import React from 'react';
import { View, Sphere } from 'react-360';
import { to3dLocation } from '../../../helpers/coordinateHelpers';
import LocationOverlay from './content/locationOverlay';

export default class Overlay extends React.Component {
  constructor() {
    super();
  }
  render() {
    const {
      locationContent,
      showLocationMarkers,
      locationMarkerStyle,
      sphereRadius,
    } = this.props;
    if (!locationContent) {
      return null;
    }
    return (
      <View>
        {locationContent.map((location, idx) => {
          const location3dCoords = to3dLocation(
            location.coordinates,
            sphereRadius
          );
          return (
            <View
              key={`${location.location}-${idx}`}
              style={{
                flex: 1,
                alignItems: 'center',
                position: 'absolute',
                transform: [{ translate: location3dCoords }],
              }}>
              {showLocationMarkers && (
                <Sphere
                  radius={0.004}
                  heightSegments={15}
                  widthSegments={15}
                  style={locationMarkerStyle}
                />
              )}
              <LocationOverlay
                location={location}
                highlighted={this.props.selectedLocation === location}
              />
            </View>
          );
        })}
      </View>
    );
  }
}
