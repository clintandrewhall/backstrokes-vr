/* @flow */
import relativeDate from 'relative-date';
import moment from 'moment';
import _ from 'underscore';
import geolib from 'geolib';

import latlng from './latlng';

import type { Configuration } from './config';
import type { Location } from './latlng';

type FSQCheckin = {
  createdAt: number,
  comments: {
    comments: Array<Object>,
    count: number,
  },
  id: string,
  photos: {
    count: number,
    photos: Array<Object>,
  },
  shout: string,
  timeZoneOffset: number,
  venue: {
    location: {
      city: string,
      crossStreet: string,
      lat: string,
      lng: string,
      postalCode: string,
      state: string,
      street: string,
    },
    name: string,
  },
};

type Options = {
  radiusCity?: number,
  radiusHome?: number,
  tripMinimum?: number,
  ignoreHome?: boolean,
};

export type Checkin = {
  created: number,
  id: string,
  createdDate: string,
  createdTime: string,
  createdEpoch: number,
  createdSince: number,
  name: string,
  shout: string,
  crossStreet: string,
  street: string,
  city: string,
  state: string,
  postalCode: string,
  location: {
    lat: string,
    lng: string,
  },
  photos: Array<Object>,
  comments: Array<Object>,
};

export type Trip = {
  startDate: Date,
  endDate: Date,
  start: string,
  end: string,
  range: string,
  city: string,
  state: string,
  checkins: Array<Checkin>,
  count: number,
};

export type TripCollection = {
  totalCheckins: number,
  qualifyingCheckins: number,
  totalTrips: number,
  home: ?Location,
  range: string,
  startDate: Date,
  endDate: Date,
  start: string,
  end: string,
  trips: Array<Trip>,
};

function getEpoch(date: Date): number {
  return Math.round(date.getTime() / 1000);
}

_.mixin({
  countUp: function(array, truthy) {
    const counts = {};

    _.each(array, function(item) {
      if (truthy && !item) {
        return;
      }

      if (!counts[item]) {
        counts[item] = {
          value: item,
          count: 1,
        };
      } else {
        counts[item].count++;
      }
    });
    const results = _.sortBy(_.toArray(counts), function(item) {
      return -item.count;
    });
    return _.toArray(results);
  },
});

function checkinComparator(o1: FSQCheckin, o2: FSQCheckin) {
  if (!o1 && !o2) {
    return 0;
  }
  if (!o1) {
    return -1;
  }
  if (!o2) {
    return 1;
  }
  if (!o1.createdAt && !o2.createdAt) {
    return 0;
  }
  if (!o1.createdAt) {
    return -1;
  }
  if (!o2.createdAt) {
    return 1;
  }
  if (o1.createdAt === o2.createdAt) {
    return 0;
  }
  if (o1.createdAt > o2.createdAt) {
    return 1;
  }
  return -1;
}

function convertFSQCheckin(checkin: FSQCheckin): Checkin {
  const {
    comments,
    createdAt,
    id,
    photos,
    shout,
    timeZoneOffset,
    venue,
  } = checkin;
  const { location, name } = venue;
  const { city, crossStreet, lat, lng, postalCode, state, street } = location;
  const d = moment.unix(createdAt).utcOffset(timeZoneOffset);

  return {
    created: d.toDate(),
    id,
    createdDate: moment(d).format('ddd, MMM Do, YYYY'),
    createdTime: moment(d).format('h:mma'),
    createdEpoch: createdAt,
    createdSince: relativeDate(d),
    name,
    shout,
    crossStreet,
    street,
    city,
    state,
    postalCode,
    location: {
      lat,
      lng,
    },
    photos: photos.count > 0 ? photos.photos : [],
    comments: comments.count > 0 ? comments.comments : [],
  };
}

function buildTrip(checkins: Array<Checkin>): Trip {
  const startDate = moment(_.first(checkins).created);
  const endDate = moment(_.last(checkins).created);
  const start = startDate.format('MMMM D, YYYY');
  const end = endDate.format('MMMM D, YYYY');
  const rangeStart = startDate.format('MM/DD');
  const rangeEnd = endDate.format('MM/DD');
  const range =
    rangeStart === rangeEnd ? rangeStart : rangeStart + ' to ' + rangeEnd;
  const cities = _.countUp(_.pluck(checkins, 'city'), true);
  const states = _.countUp(_.pluck(checkins, 'state'), true);
  const city = cities[0] ? cities[0].value : '';
  const state = states[0] ? states[0].value : '';

  const coords = checkins.map(checkin => {
    return {
      latitude: checkin.location.lat,
      longitude: checkin.location.lng,
    };
  });

  let center = geolib.getCenter(coords);

  center = center
    ? {
      lat: center.latitude,
      lng: center.longitude,
    }
    : null;

  return {
    startDate,
    center,
    endDate,
    start,
    end,
    range,
    city,
    state,
    checkins,
    count: checkins.length,
  };
}

const Backstroke = function(config: Configuration, Foursquare: any) {
  const { backstrokes, geocode } = config;
  const LatLng = latlng(geocode);
  const logger = require('winston');

  const { concurrentCalls, distanceUnit, limit, passLimit } = backstrokes;

  function buildTripsByLocation(
    checkins: Array<Checkin>,
    home: ?Location,
    before: Date,
    after: Date,
    options: Options = {}
  ): TripCollection {
    const radiusHome = options.radiusHome || backstrokes.radiusHome;
    const radiusCity = options.radiusCity || backstrokes.radiusCity;
    const tripMinimum = options.tripMinimum || backstrokes.tripMinimum;

    let results = [];
    let trip = [];
    let qualifyingCheckins = 0;

    checkins.forEach((checkin: Checkin) => {
      const { location } = checkin;
      const { lat, lng } = location || {};

      // Check for latitude and longitude
      if (!lat || !lng) {
        return;
      }

      const checkinLocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };

      if (home) {
        // Get the distance between the checkin's location and "home".
        const distance = LatLng.getDistance(home, checkinLocation);

        // If it's less than the boundary, just return (and discard).
        if (distance[distanceUnit] <= radiusHome) {
          return;
        }
      }

      // If the current trip has no checkins...
      if (trip.length <= 0) {
        // ...but we already have trips stored...
        if (results.length > 0) {
          // ...check the distance of the last checkin of the last trip...
          if (
            LatLng.getDistance(
              _.last(_.last(results).checkins).location,
              checkinLocation
            )[distanceUnit] <= radiusCity
          ) {
            // ... if it fits, add it to that trip and return...
            _.last(results).push(checkin);
            return;
          }
        }
        // ...otherwise, add it to the current, empty trip.
        trip.push(checkin);
        return;
      }

      // Get the first location of the first checkin in the trip.
      var firstLocation = _.first(trip).location;

      // If the distance between the first location and this checkin's location
      // is within the boundary...
      if (
        LatLng.getDistance(firstLocation, checkinLocation)[distanceUnit] <=
        radiusCity
      ) {
        // ...add to the trip.
        trip.push(checkin);
        return;
      }

      // ... otherwise, process and add the trip. If the trip length is within
      // the minimum...
      if (trip.length >= tripMinimum) {
        // ...increment the qualifying checkins count.
        results.push(buildTrip(trip));
      }
      trip = [checkin];
    });

    if (trip.length >= tripMinimum) {
      qualifyingCheckins += trip.length;
      results.push(buildTrip(trip));
    }

    const consolidated = [];

    results.forEach((result: Trip) => {
      const lastTrip = consolidated.pop();

      if (lastTrip && lastTrip.city === result.city) {
        lastTrip.checkins = lastTrip.checkins.concat(result.checkins);
        lastTrip.count += result.count;
        lastTrip.end = result.end;
        lastTrip.endDate = result.endDate;
        consolidated.push(lastTrip);
      } else {
        lastTrip && consolidated.push(lastTrip);
        consolidated.push(result);
      }
    });

    logger.info(
      'BUILT: ' +
        consolidated.length +
        ' trips using ' +
        qualifyingCheckins +
        ' of ' +
        consolidated.length +
        ' checkins.'
    );

    const rangeStart = moment(after).format('MM/YYYY');
    const rangeEnd = moment(before).format('MM/YYYY');
    const range =
      rangeStart === rangeEnd ? rangeStart : rangeStart + ' to ' + rangeEnd;

    return {
      totalCheckins: checkins.length,
      qualifyingCheckins,
      totalTrips: consolidated.length,
      home,
      range,
      startDate: after,
      endDate: before,
      start: moment(after).format('MMMM D, YYYY'),
      end: moment(before).format('MMMM D, YYYY'),
      trips: consolidated,
    };
  }

  async function retrieveCheckinSet(
    offset: number,
    before: Date,
    after: Date,
    accessToken: string
  ): Promise<?Array<FSQCheckin>> {
    logger.debug('ENTERING: retrieveCheckinSet, offset=' + offset);

    return new Promise((resolve, reject) =>
      Foursquare.Users.getSelfCheckins(
        {
          limit,
          beforeTimestamp: getEpoch(before),
          afterTimestamp: getEpoch(after),
          offset,
        },
        accessToken,
        function success(error, results) {
          if (error) {
            reject(error);
          } else {
            resolve(results.checkins ? results.checkins.items || [] : []);
          }
        }
      )
    );
  }

  async function genCheckins(
    before: Date,
    after: Date,
    accessToken: string
  ): Promise<?Array<Checkin>> {
    logger.debug('ENTERING: retrieveCheckins');
    let allResults = [];

    let baseOffset = 0;
    let keepFetching = true;
    let passTotal = 0;

    async function fetchBatch(): Promise<Array<FSQCheckin>> {
      const awaitables = [...Array(concurrentCalls)].map(async (_, i) => {
        const awaitable = await retrieveCheckinSet(
          i * limit + baseOffset,
          before,
          after,
          accessToken
        );

        return awaitable;
      });

      const rawResults = await Promise.all(awaitables);
      const filteredResults = rawResults.filter(Boolean);

      // Check the last result to see if it has as many checkins as the limit;
      // that would mean we have more results.
      keepFetching = _.last(filteredResults).length === limit;

      const results = filteredResults.reduce(
        (a: Array<FSQCheckin>, b: Array<FSQCheckin>): Array<FSQCheckin> =>
          a.concat(b),
        []
      );

      passTotal += 1;
      return results;
    }

    // Don't exceed the pass total in config.
    while (keepFetching && passTotal < passLimit) {
      const batch = await fetchBatch();
      baseOffset += limit * concurrentCalls;
      allResults = allResults.concat(batch);
    }

    if (passLimit === passTotal && keepFetching) {
      logger.warn('Results were truncated after ' + passTotal + ' passes');
    }

    logger.info(
      'RETRIEVED: ' +
        allResults.length +
        ' checkins in ' +
        passTotal +
        ' pass(es) of ' +
        concurrentCalls +
        ' calls each.'
    );

    allResults.sort(checkinComparator);
    return allResults.map(checkin => convertFSQCheckin(checkin));
  }

  async function genTripCollection(
    postalCode: string,
    before: Date,
    after: Date,
    options: Options = {},
    accessToken: string
  ): Promise<?TripCollection> {
    logger.debug('ENTERING: getTrips');

    if (!accessToken || !postalCode) {
      logger.error(
        'retrieveTrips: No postalCode (' +
          postalCode +
          ') or no accessToken (' +
          accessToken +
          ')'
      );
    }

    logger.info('RETRIEVING: trips for Postal Code ' + postalCode);
    const location = await LatLng.genLocationByPostalCode(postalCode);

    if (!location) {
      return null;
    }

    const checkins = await genCheckins(before, after, accessToken);

    if (!checkins) {
      return null;
    }

    return buildTripsByLocation(checkins, location, before, after, options);
  }

  async function genAllTripCollection(
    before: Date,
    after: Date,
    options: Options = {},
    accessToken: string
  ): Promise<?TripCollection> {
    logger.debug('ENTERING: genAllTripCollection');

    if (!accessToken) {
      logger.error('retrieveTrips: No accessToken (' + accessToken + ')');
    }

    const checkins = await genCheckins(before, after, accessToken);

    if (!checkins) {
      return null;
    }

    return buildTripsByLocation(checkins, null, before, after, options);
  }

  return {
    genAllTripCollection,
    genTripCollection,
    genCheckins,
  };
};

exports = module.exports = Backstroke;
