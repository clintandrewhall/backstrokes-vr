import React from 'react';
import { AppRegistry, asset, Text, AmbientLight, View } from 'react-360';

import List from './components/centro/list/list';
import ListItem from './components/centro/list/list-item';

const renderRow = (index, trip) => {
  return (
    <ListItem key={'row' + index}>
      <Text
        style={{
          fontSize: 0.1,
          flex: 1,
          textAlign: 'left',
          textAlignVertical: 'center',
          color: '#000',
          width: 1,
        }}>
        {trip.city}, {trip.state}
      </Text>
    </ListItem>
  );
};

export default class TripList extends React.Component {
  _renderRow = (index, trip) => {
    return (
      <ListItem key={'row' + index}>
        <Text
          style={{
            fontSize: 0.1,
            flex: 1,
            textAlign: 'left',
            textAlignVertical: 'center',
            color: '#000',
            width: 1,
          }}>
          {trip.city}, {trip.state}
        </Text>
      </ListItem>
    );
  };

  constructor() {
    super();
    this.earthRadius = 2.5;
    this.state = {
      trips: this.props.trips.slice(0, 5),
    };
  }
  render() {
    return (
      <View style={this.props.style}>
        <Text>Trips</Text>
        <List
          renderRow={this._renderRow}
          onScroll={index => {
            this.setState({ trips: this.props.trips.slice(index, index + 5) });
          }}
          data={this.props.trips}
        />
      </View>
    );
  }
}

AppRegistry.registerComponent('TripList', () => TripList);
