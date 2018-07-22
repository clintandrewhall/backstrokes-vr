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
          transform: [{ rotateX: 25 }, { translate: [-0.01, 0.08, -0.01] }],
        }}>
        <Text
          style={{
            backfaceVisibility: 'hidden',
            backgroundColor: this.props.highlighted ? '#F3F3F3' : '#E9E9E9',
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
                translateZ: this.props.highlighted ? 0.048 : 0.05,
              },
              {
                translateY: this.props.highlighted ? 0.052 : 0.05,
              },
            ],
          }}>
          {this.props.label}
        </Text>
        <Image
          style={{
            flex: 1,
            width: 0.075,
            height: 0.075,
          }}
          source={asset('pin.png')}
        />
      </View>
    );
  }
}
