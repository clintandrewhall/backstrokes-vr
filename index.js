import React from 'react';
import {
  AppRegistry,
  asset,
  Pano,
  Text,
  AmbientLight,
  Image,
  View,
  VrButton,
  StyleSheet,
} from 'react-360';

import Earth from './components/earth';
import Marker from './components/marker';

const europeanCities = [
  {
    coordinates: { lat: 48.938519, lon: -3.35607 },
    component: <Marker />,
  },
];

const Checkins = require('./data/checkins');

const checkins = Checkins.map(checkin => {
  return {
    coordinates: {
      lat: parseFloat(checkin.location.lat),
      lon: parseFloat(checkin.location.lng),
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
    console.log(this.state.offset);
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
                  this.state.offset < checkins.length - 10
                    ? (this.state.offset += 10)
                    : checkins.length,
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
            locationContent={checkins.slice(
              this.state.offset,
              this.state.offset + 10,
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
*/
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

/*AppRegistry.registerComponent('Backstrokes360', () => Backstrokes360);*/
