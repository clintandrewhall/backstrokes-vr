import React from 'react';
import { View } from 'react-360';
import { overlayLonOffset } from '../../../../consts/rotationOffset';

export default class LocationOverlay extends React.Component {
  constructor() {
    super();
    this.getYRotationForLocation = this.getYRotationForLocation.bind(this);
  }
  getYRotationForLocation(location) {
    return location.coordinates.lon + overlayLonOffset;
  }
  render() {
    const { location, highlighted } = this.props;
    return (
      <View
        style={{
          position: 'absolute',
          transform: [
            {
              rotateY: this.getYRotationForLocation(location),
            },
            {
              rotateX: location.coordinates.lat > 0 ? -40 : 40,
            },
          ],
        }}>
        {React.cloneElement(location.component, {
          highlighted: highlighted,
        })}
      </View>
    );
  }
}
