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
import Marker from './components/earth/components/locationMarker/marker';

const europeanCities = [
  {
    coordinates: { lat: 48.938519, lon: 2.35607 },
    component: <Marker />,
  },
];

export default class Backstrokes360 extends React.Component {
  constructor() {
    super();
    this.earthRadius = 2.5;
    this.state = {
      locationItems: europeanCities,
    };
  }
  render() {
    const earthRadius = 7;
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
        <Earth
          locationMarkerStyle={{ color: 'red' }}
          showLocationMarkers={true}
          wrap={asset('earth.jpg')}
          locationContent={this.state.locationItems}
          scale={earthRadius}
        />
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
