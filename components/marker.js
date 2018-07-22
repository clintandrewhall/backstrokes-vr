import React from 'react';
import { Image, asset, View, Text } from 'react-360';

export default class Marker extends React.Component {
  render() {
    return (
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          backfaceVisibility: 'hidden',
          justifyContent: 'center',
          transform: [{ rotateX: 30 }, { translate: [-0.01, 0.08, -0.01] }],
        }}>
        <Text
          style={{
            display: this.props.highlighted ? 'flex' : 'none',
            backfaceVisibility: 'hidden',
            backgroundColor: '#F3F3F3',
            paddingLeft: 0.025,
            paddingRight: 0.025,
            height: 0.05,
            fontSize: 0.025,
            flex: 1,
            textAlign: 'center',
            textAlignVertical: 'center',
            color: '#000',
            transform: [
              { scale: this.props.highlighted ? 1.75 : 1 },
              {
                translateY: this.props.highlighted ? 0.1 : 0.075,
              },
              {
                translateZ: 0, //this.props.highlighted ? 0.01 : 0,
              },
            ],
          }}>
          {this.props.label}
        </Text>
        <Image
          style={{
            display: this.props.highlighted ? 'flex' : 'none',
            position: 'absolute',
            width: 0.075,
            height: 0.075,
            transform: [{ translateY: 0 }],
          }}
          source={asset('pin.png')}
        />
      </View>
    );
  }
}
