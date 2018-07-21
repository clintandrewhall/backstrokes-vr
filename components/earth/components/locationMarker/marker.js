import React from 'react';
import { Image, asset, View } from 'react-360';

export default class Marker extends React.Component {
  render() {
    return (
      <Image
        style={{
          transform: [{ translate: [-0.05, 0.1, 0] }],
          width: 0.25,
          height: 0.25,
        }}
        source={asset('pin.png')}
      />
    );
  }
}
