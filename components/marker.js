import React from 'react';
import { Image, asset, View } from 'react-360';

export default class Marker extends React.Component {
  render() {
    return (
      <Image
        style={{
          transform: [{ rotateX: 25 }, { translate: [-0.01, 0.08, 0] }],
          width: 0.05,
          height: 0.05,
        }}
        source={asset('pin.png')}
      />
    );
  }
}
