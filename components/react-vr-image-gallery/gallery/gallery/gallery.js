import React from 'react';
import { imageTypes } from './imageTypes';
import GazeButton from '../button/gazeButton';
import {
  asset,
  Image,
  View,
  VrButton,
  Animated,
  Button,
  StyleSheet,
  Text,
  CylindricalPanel,
} from 'react-360';
import GalleryImage from './galleryImage';

class Gallery extends React.Component {
  static defaultProps = {
    type: imageTypes.SQUARE,
  };
  constructor(props) {
    super(props);
    this.imageDimensions = {
      SQUARE: {
        style: {
          height: 500,
          width: 500,
        },
        vrWidth: 38.5,
      },
    };
    this.imageStyles = StyleSheet.create(
      this.imageDimensions[props.type].style
    );
    this.calculateWidth = this.calculateWidth.bind(this);
    this.goToNext = this.goToNext.bind(this);
    this.rotateGallery = this.rotateGallery.bind(this);
    this.goToPrev = this.goToPrev.bind(this);
    this.getPosition = this.getPosition.bind(this);
    this.state = {
      imageNumber: this.props.initialImage,
      containerWidth: this.calculateWidth(props.images) || 1,
      galleryRotation: new Animated.Value(
        this.getPosition(props.images, props.initialImage)
      ),
    };
  }

  componentWillReceiveProps(next) {
    this.setState({
      containerWidth: this.calculateWidth(next.images),
    });
  }

  calculateWidth(images) {
    return 1500;
  }
  goToNext() {
    const nextImageNum = this.state.imageNumber + 1;
    const nextRotation = this.getPosition(this.props.images, nextImageNum);
    this.setState({
      imageNumber: nextImageNum,
    });
    this.rotateGallery(nextRotation);
    this.props.onChange && this.props.onChange(nextImageNum);
  }
  goToPrev() {
    const prevImageNum = this.state.imageNumber - 1;
    const nextRotation = this.getPosition(this.props.images, prevImageNum);
    this.setState({
      imageNumber: prevImageNum,
    });
    this.rotateGallery(nextRotation);
    this.props.onChange && this.props.onChange(prevImageNum);
  }
  rotateGallery(rotation) {
    const animation = Animated.timing(this.state.galleryRotation, {
      toValue: rotation,
      duration: 150,
    });
    animation.start();
  }
  getPosition(images, imageNumber) {
    const { type, initialImage } = this.props;
    const boxWidth = this.imageDimensions[type].vrWidth;
    const boxPosition = imageNumber * boxWidth;
    const basePosition = -(boxWidth / 2);
    return -(basePosition + (3 / 2 + -(imageNumber - 1)) * boxWidth);
  }
  render() {
    const { images } = this.props;
    const { imageNumber } = this.state;
    const { containerWidth, galleryRotation } = this.state;
    const imageStyle = this.imageDimensions[this.props.type].style;
    const canNext = imageNumber < images.length;
    const canPrev = imageNumber > 1;
    return (
      <View style={{ position: 'absolute' }}>
        <Animated.View
          style={{
            transform: [{ rotateY: galleryRotation }],
          }}>
          <CylindricalPanel
            layer={{
              width: containerWidth,
              height: 500,
            }}>
            <View
              style={{
                opacity: 1,
                flex: 1,
                flexDirection: 'row',
                width: containerWidth,
                height: 500,
                justifyContent: 'flex-start',
              }}>
              {this.props.images.map((image, idx) => {
                const isSelected = idx + 1 == imageNumber;
                return (
                  <GalleryImage
                    key={'image' + idx}
                    imageStyle={imageStyle}
                    src={image}
                    isSelected={isSelected}
                  />
                );
              })}
            </View>
          </CylindricalPanel>
        </Animated.View>
        <View>
          <GazeButton
            disabled={!canPrev}
            onClick={this.goToPrev}
            buttonStyle={{
              borderRadius: 1,
              opacity: 0.85,
              paddingLeft: 0.06,
              borderWidth: 0.01,
              width: 0.2,
              height: 0.2,
              backgroundColor: '#333',
              borderColor: '#222',
            }}
            containerStyle={{
              position: 'absolute',
              transform: [{ translate: [-1.5, 0.1, -2] }],
            }}>
            <Text
              style={{
                color: 'white',
                bottom: 0.01,
                fontSize: 0.15,
                fontWeight: 'bold',
              }}>
              {'<'}
            </Text>
          </GazeButton>
          <GazeButton
            disabled={!canNext}
            onClick={this.goToNext}
            buttonStyle={{
              borderRadius: 1,
              opacity: 0.85,
              paddingLeft: 0.06,
              borderWidth: 0.01,
              height: 0.2,
              width: 0.2,
              backgroundColor: '#333',
              borderColor: '#222',
            }}
            containerStyle={{
              position: 'absolute',
              transform: [
                {
                  translate: [1.25, 0.1, -2],
                },
              ],
            }}>
            <Text
              style={{
                color: 'white',
                bottom: 0.01,
                fontSize: 0.15,
                fontWeight: 'bold',
              }}>
              {'>'}
            </Text>
          </GazeButton>
        </View>
      </View>
    );
  }
}

export default Gallery;
