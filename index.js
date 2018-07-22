import React from 'react';
import {
  AppRegistry,
  asset,
  AmbientLight,
  View,
  VrButton,
  Text,
} from 'react-360';

import Earth from './components/react-vr-geolocate';
import Marker from './components/marker';

const Trips = require('./data/allTrips');

const trips = Trips.trips.map(trip => {
  return {
    coordinates: {
      lat: parseFloat(trip.center.lat),
      lon: parseFloat(trip.center.lng),
    },
    component: <Marker label={trip.city} />,
  };
});

export default class Backstrokes360 extends React.Component {
  constructor() {
    super();
    this.state = {
      index: 0,
    };
  }

  render() {
    const earthRadius = 1;

    return (
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            position: 'absolute',
            backgroundColor: '#333',
            borderRadius: 0.05,
            height: 0.25,
            width: 0.25,
            justifyContent: 'center',
            alignContent: 'center',
            transform: [{ translate: [-1.25, -1, -3] }, { rotateY: 30 }],
          }}>
          <VrButton
            style={{
              flex: 1,
              justifyContent: 'center',
              alignContent: 'center',
            }}
            onClick={() =>
              this.setState({
                index: Math.max(this.state.index - 1, 0),
              })
            }>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 0.25,
                position: 'absolute',
                top: -0.065,
                left: 0.06,
              }}>
              {'<'}
            </Text>
          </VrButton>
        </View>
        <View
          style={{
            position: 'absolute',
            backgroundColor: '#333',
            borderRadius: 0.05,
            height: 0.25,
            width: 0.25,
            justifyContent: 'center',
            alignContent: 'center',
            transform: [{ translate: [1.25, -1, -3] }, { rotateY: -30 }],
          }}>
          <VrButton
            style={{
              flex: 1,
              justifyContent: 'center',
              alignContent: 'center',
            }}
            onClick={() =>
              this.setState({
                index: Math.min(this.state.index + 1, trips.length - 1),
              })
            }>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 0.25,
                position: 'absolute',
                top: -0.065,
                left: 0.06,
              }}>
              {'>'}
            </Text>
          </VrButton>
        </View>
        <View
          style={{
            position: 'absolute',
            paddingLeft: 0.1,
            paddingRight: 0.1,
            transform: [{ translate: [0, -1, -2.5] }],
          }}>
          <View
            style={{
              zIndex: 1,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.5,
              backgroundColor: 'grey',
              borderRadius: 0.05,
            }}
          />
          <Text
            style={{
              fontSize: 0.15,
              height: 0.25,
              width: 1.2,
              textAlign: 'center',
              transform: [{ translateZ: -0.001 }, { translateY: -0.025 }],
            }}>
            {Trips.trips[this.state.index].city}
          </Text>
        </View>
        <View
          style={{
            position: 'absolute',
            transform: [{ translate: [0, 0, -3] }],
          }}>
          <Earth
            locationMarkerStyle={{ color: 'red' }}
            showLocationMarkers={true}
            wrap={asset('earth.jpg')}
            locationContent={trips}
            scale={earthRadius}
            focalPoint={trips[this.state.index]}
          />
        </View>
        <AmbientLight intensity={1.2} decay={100} />
      </View>
    );
  }
}

AppRegistry.registerComponent('Backstrokes360', () => Backstrokes360);
/*
import React from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-360';

export default class Backstrokes360 extends React.Component {
  render() {
    return (
      <View style={styles.panel}>
        <View style={styles.greetingBox}>
          <Text style={styles.greeting}>Welcome to React 360, Clint.</Text>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  panel: {
    // Fill the entire surface
    width: 1000,
    height: 600,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingBox: {
    padding: 20,
    backgroundColor: '#000000',
    borderColor: '#639dda',
    borderWidth: 2,
  },
  greeting: {
    fontSize: 30,
  },
});

AppRegistry.registerComponent('Backstrokes360', () => Backstrokes360);*/
