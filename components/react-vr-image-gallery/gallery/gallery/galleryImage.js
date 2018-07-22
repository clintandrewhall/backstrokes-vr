import React from 'react';
import { Image, Animated, Text, View } from 'react-360';

export default class GalleryImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opacity: new Animated.Value(props.isSelected ? 1 : 0.5),
    };
  }
  componentWillReceiveProps(next) {
    if (this.props.isSelected != next.isSelected) {
      const animation = Animated.timing(this.state.opacity, {
        toValue: next.isSelected ? 1 : 0.5,
        duration: 300,
      });
      animation.start();
    }
  }
  render() {
    const { imageStyle, src } = this.props;
    return (
      <Animated.View
        style={{
          opacity: this.state.opacity,
        }}>
        <Image
          style={[
            imageStyle,
            {
              flex: 1,
              margin: 5,
              flexDirection: 'column',
              backgroundColor: 'black',
            },
          ]}
          source={src}
        />
        <Text
          style={{
            color: '#123',
            position: 'absolute',
            transform: [{ translateZ: 1 }],
          }}>
          Hello
        </Text>
      </Animated.View>
    );
  }
}
