import React from 'react';
import { View, asset, Text, AppRegistry, AsyncStorage } from 'react-360';
import Gallery, { imageTypes } from './react-vr-image-gallery';

const API_KEY = 'AIzaSyDEr12I8OMkarsDRcaqCDJdW6tc832HrJ4';
const urlStart = 'https://maps.googleapis.com/maps/api/staticmap?center=';
const urlMiddle = '&markers=color:blue%7C';
const urlEnd = '&zoom=13&size=512x512&maptype=roadmap&key=' + API_KEY;

export default class CheckinGallery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trip: {},
      name: '',
    };
  }
  componentDidMount() {
    setInterval(() => {
      AsyncStorage.getItem('trip:key').then(value => {
        if (value.startDate !== this.state.trip.startDate) {
          this.setState({
            trip: value,
            name: value.checkins[0].name,
          });
        }
      });
    }, 250);
  }
  render() {
    const checkins = this.state.trip.checkins || [];
    const images = checkins.map(checkin => {
      const a = checkin.location.lat + ',' + checkin.location.lng;
      return {
        uri: urlStart + a + urlMiddle + a + urlEnd,
      };
    });
    return (
      <View style={{ transform: [{ rotateY: -90 }] }}>
        <Gallery
          type={imageTypes.SQUARE}
          initialImage={1}
          images={images}
          onChange={idx => {
            if (this.state.trip.checkins[idx]) {
              this.setState({ name: this.state.trip.checkins[idx].name });
            }
          }}
        />
        <View
          style={{
            position: 'absolute',
            paddingLeft: 0.1,
            paddingRight: 0.1,
            transform: [{ translate: [-1, -1.3, -3.5] }],
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
              width: 2,
              textAlign: 'center',
              transform: [{ translateZ: -0.001 }, { translateY: -0.025 }],
            }}>
            {this.state.name}
          </Text>
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('CheckinGallery', () => CheckinGallery);
