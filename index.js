import React from 'react';
import {
  AppRegistry,
  asset,
  Text,
  AmbientLight,
  View,
  VrButton,
  StyleSheet,
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
    component: <Marker />,
  };
});

export default class Backstrokes360 extends React.Component {
  constructor() {
    super();
    this.earthRadius = 2.5;
    this.state = {
      offset: 0,
    };
  }
  render() {
    const earthRadius = 1.5;
    const buttonStyle = {
      backgroundColor: 'black',
      alignItems: 'center',
      flex: 1,
      paddingLeft: 0.1,
      marginBottom: 0.02,
      height: 1,
      flexDirection: 'row',
    };

    return (
      <View>
        <View
          style={{
            width: 1.5,
            height: 1,
            backgroundColor: 'grey',
            padding: 0.1,
            transform: [{ translate: [-3.4, 1, -3.5] }, { rotateY: 25 }],
          }}>
          <Text>Select an option to load new locations</Text>
          <VrButton
            style={buttonStyle}
            onClick={() =>
              this.setState({
                offset: this.state.offset > 0 ? (this.state.offset -= 10) : 0,
              })
            }>
            <Text>Back</Text>
          </VrButton>
          <VrButton
            style={buttonStyle}
            onClick={() =>
              this.setState({
                offset:
                  this.state.offset < trips.length - 10
                    ? (this.state.offset += 10)
                    : trips.length,
              })
            }>
            <Text>Forward</Text>
          </VrButton>
        </View>
        <View
          style={{
            position: 'absolute',
            transform: [{ translate: [0, 0, -3.5] }],
          }}>
          <Earth
            locationMarkerStyle={{ color: 'red' }}
            showLocationMarkers={true}
            wrap={asset('earth.jpg')}
            locationContent={trips.slice(
              this.state.offset,
              this.state.offset + 10
            )}
            scale={earthRadius}
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
