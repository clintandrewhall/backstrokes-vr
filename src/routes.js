/* @flow */
import express from 'express';
import winston from 'winston';
import nodeFoursquare from 'node-foursquare';
import moment from 'moment';
import asyncHandler from 'express-async-handler';

import type {
  $Application,
  NextFunction,
  Router,
  $Request,
  $Response,
} from 'express';

import backstroke from './backstroke';
import latlng from './latlng';

import type { Configuration } from './config';
import type { FoursquareEntity } from 'node-foursquare';

type SessionEnabledRequest = $Request & {
  session: {
    destroy: Function,
    foursquare?: {
      accessToken: string,
      entity?: FoursquareEntity,
    },
  },
};

const logger = winston.createLogger({
  level: 'debug',
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

function sendWindowedResponse(json: Object): string {
  return `
    <html><body><script type="text/javascript">
      window.opener.postMessage(
        ${JSON.stringify(json)},
        window.opener.location,
      );
    </script></body></html>
  `;
}

function addRoutes(app: $Application, config: Configuration) {
  const router: Router = express.Router();
  const Foursquare = nodeFoursquare(config.nodeFoursquare);
  const Backstroke = backstroke(config, Foursquare);
  const LatLng = latlng(config.geocode);

  async function genUser(accessToken: string) {
    return new Promise((resolve, reject) =>
      Foursquare.Users.getSelfDetails(accessToken, function success(
        error,
        results
      ) {
        if (error) {
          reject(error);
        } else {
          resolve(results.user);
        }
      })
    );
  }

  async function restrict(
    request: SessionEnabledRequest,
    response: $Response,
    next: NextFunction
  ) {
    logger.debug(`BEFORE: ${request.url}`);
    logger.debug('Entering: /restrict');
    let { session } = request;
    let { foursquare } = session;
    const accessToken = process.env.ACCESS_TOKEN;

    // If we have an access token in config, we're likely testing something, so
    // call for the current user.
    if ((!foursquare || !foursquare.accessToken) && accessToken) {
      const user = await genUser(accessToken);
      request.session.foursquare = { accessToken, user };
      session = request.session;
    }

    if (session.foursquare) {
      next();
      return;
    }

    response.status(401);
    response.send('Not Authorized');
  }

  router
    .route('/login')
    .get(
      (
        request: SessionEnabledRequest,
        response: $Response,
        _: NextFunction
      ) => {
        logger.debug('REQUESTING: /api/login');
        const location = Foursquare.getAuthClientRedirectUrl();
        response.redirect(location);
        response.end();
      }
    );

  router
    .route('/callback')
    .get(
      (
        request: SessionEnabledRequest & {
          query?: ?{
            code?: ?string,
            r?: ?string,
          },
        },
        response: $Response,
        _: NextFunction
      ) => {
        logger.debug('REQUESTING: /callback/foursquare');
        const { query } = request;
        const { code } = query;

        Foursquare.getAccessToken(
          {
            code,
          },
          (accessTokenError: Error, accessToken: string) => {
            if (accessTokenError) {
              logger.error(
                `Error retrieving Access Token: ${accessTokenError.message}`
              );
              response.send(
                sendWindowedResponse({
                  auth: false,
                  reason: accessTokenError.message,
                })
              );
              return;
            }

            if (accessToken) {
              Foursquare.Users.getSelfDetails(
                accessToken,
                (getUserError: Error, user: Object) => {
                  if (getUserError) {
                    response.send(
                      sendWindowedResponse({
                        auth: false,
                        reason: getUserError.message,
                      })
                    );
                  } else {
                    request.session.foursquare = {
                      user: user.user,
                      accessToken,
                    };

                    delete request.query.code;
                    delete request.query.c;

                    response.send(sendWindowedResponse({ auth: true }));
                  }
                }
              );
            } else {
              logger.error('No Access Token was received.');
              response.send(
                sendWindowedResponse({ auth: false, reason: 'no_token' })
              );
            }
          }
        );
      }
    );

  router
    .route('/who')
    .get(
      restrict,
      async (
        request: SessionEnabledRequest,
        response: $Response,
        _next: NextFunction
      ) => {
        logger.debug('REQUESTING: /api/who');
        const { session } = request;
        const { foursquare } = session;
        const { user } = foursquare || {};

        response.json({
          foursquare: user,
        });
      }
    );

  router
    .route('/disconnect')
    .get(
      (
        request: SessionEnabledRequest,
        response: $Response,
        _: NextFunction
      ) => {
        request.session.destroy(() => {
          response.redirect('/');
        });
      }
    );

  router
    .route('/checkins')
    .get(
      restrict,
      async (
        request: SessionEnabledRequest & {},
        response: $Response,
        _: NextFunction
      ) => {
        logger.debug('REQUESTING: /trips/:postalCode');
        const { session } = request;
        const { foursquare } = session;
        const { accessToken } = foursquare || {};

        const checkinSet = await Backstroke.genCheckins(
          new Date(1532200086 * 1000),
          new Date(1500595200 * 1000),
          accessToken
        );
        response.json(checkinSet);
      }
    );

  router
    .route('/postalCode/:postalCode')
    .get(
      restrict,
      async (
        request: SessionEnabledRequest & {
          params: ?{
            postalCode?: ?string,
          },
        },
        response: $Response,
        _: NextFunction
      ) => {
        const { params } = request;
        const { postalCode } = params;
        logger.debug('REQUESTING: /postalCode/:postalCode', postalCode);

        const location = await LatLng.genLocationByPostalCode(postalCode);

        response.json(location);
      }
    );
  router
    .route('/trips')
    .get(
      restrict,
      async (
        request: SessionEnabledRequest & {
          query: ?{
            start?: string,
            end?: string,
          },
        },
        response: $Response,
        _: NextFunction
      ) => {
        logger.debug('REQUESTING: /trips/:postalCode');
        const { session, query } = request;
        const { foursquare } = session;
        const { accessToken } = foursquare || {};

        let options = {
          ignoreHome: true,
        };

        let endDate = moment().endOf('month');
        let startDate = moment()
          .startOf('month')
          .subtract(1, 'year');

        if (query) {
          const { start, end } = query;

          if (start) {
            startDate = moment(start);
          }

          if (end) {
            endDate = moment(end);
          }
        }

        logger.debug('Retrieving checkins to build trips.');

        const tripCollection = await Backstroke.genAllTripCollection(
          endDate.toDate(),
          startDate.toDate(),
          options,
          accessToken
        );

        response.json(tripCollection);
      }
    );

  router
    .route('/trips/:postalCode')
    .get(
      restrict,
      async (
        request: SessionEnabledRequest & {
          params: ?{
            postalCode?: ?string,
          },
          query: ?{
            start?: string,
            end?: string,
          },
        },
        response: $Response,
        _: NextFunction
      ) => {
        logger.debug('REQUESTING: /trips/:postalCode');
        const { session, params, query } = request;
        const { foursquare } = session;
        const { accessToken } = foursquare || {};
        const { postalCode } = params;

        if (!postalCode) {
          response.status(401);
          response.send('Postal Code invalid or not provided');
          return;
        }

        let options = {};

        let endDate = moment().endOf('month');
        let startDate = moment()
          .startOf('month')
          .subtract(1, 'year');

        if (query) {
          const { start, end } = query;

          if (start) {
            startDate = moment(start);
          }

          if (end) {
            endDate = moment(end);
          }
        }

        logger.debug('Retrieving checkins to build trips.');

        const tripCollection = await Backstroke.genTripCollection(
          postalCode,
          endDate.toDate(),
          startDate.toDate(),
          options,
          accessToken
        );

        response.json(tripCollection);
      }
    );

  app.use('/api', router);

  app.use(
    asyncHandler(
      async (request: $Request, response: $Response, next: NextFunction) => {
        if (!request.route) {
          response.status(404);
          response.send('Not Found');
        }
        next();
      }
    )
  );
}

export { addRoutes };
