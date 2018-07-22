import React from 'react';
import { Animated } from 'react-360';
import { Easing } from 'react-native';

export default class EarthSpin extends React.Component {
  constructor(props) {
    super(props);
    this.spin = this.spin.bind(this);
    this.rotate = this.rotate.bind(this);
    this.resetEarthPosition = this.resetEarthPosition.bind(this);
    this.primeMeridianOffset = this.props.xOffset || 0;
    this.equatorOffset = this.props.yOffset || 0;
    this.state = {
      rotateValue: new Animated.Value(0),
      bounceXValue: new Animated.Value(this.primeMeridianOffset),
      bounceYValue: new Animated.Value(this.equatorOffset),
    };
  }
  mapLatitude(lat) {
    return lat + this.equatorOffset;
  }
  mapLongitude(lon) {
    return (lon >= 0 ? -lon : Math.abs(lon)) + this.primeMeridianOffset;
  }
  resetEarthPosition(props) {
    const locationItems = props.locationContent;
    if (!Array.isArray(locationItems) || locationItems.length <= 0) {
      return;
    }
    const focalPoint = props.focalPoint || locationItems[0];

    this.setState({ rotateValue: new Animated.Value(0) });

    this.spin(
      this.mapLatitude(focalPoint.coordinates.lat),
      this.mapLongitude(focalPoint.coordinates.lon)
    );
  }
  componentWillMount() {
    this.resetEarthPosition(this.props);
  }
  componentWillReceiveProps(next) {
    this.resetEarthPosition(next);
  }
  spin(lat, lon) {
    Animated.spring(this.state.bounceXValue, {
      toValue: lon,
      friction: 15,
      tension: 4,
    }).start();
    Animated.spring(this.state.bounceYValue, {
      toValue: lat,
      friction: 15,
      tension: 4,
    }).start(o => {
      if (o.finished) {
        this.rotate();
      }
    });
  }
  rotate() {
    this.state.rotateValue.setValue(0);
    Animated.timing(this.state.rotateValue, {
      toValue: 360,
      duration: 100000,
      easing: Easing.linear,
    }).start(o => {
      if (o.finished) {
        this.rotate();
      }
    });
  }
  render() {
    const thing = Animated.add(this.state.bounceXValue, this.state.rotateValue);
    return (
      <Animated.View
        style={{
          transform: [{ rotateX: this.state.bounceYValue }, { rotateY: thing }],
        }}>
        {this.props.children}
      </Animated.View>
    );
  }
}
