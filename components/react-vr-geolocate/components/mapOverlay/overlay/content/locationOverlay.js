import React from "react";
import {
    View,
    Text,
    Sphere
} from 'react-360';
import { overlayLonOffset } from "../../../../consts/rotationOffset";

export default class LocationOverlay extends React.Component{
    constructor(){
        super();
        this.getYRotationForLocation = this.getYRotationForLocation.bind(this);
    }
    getYRotationForLocation(location){
        return location.coordinates.lon + overlayLonOffset;
    }
    render(){
        const { location } = this.props;
        return (            
            <View style={{
                position: "absolute",
                transform: [{
                    rotateY: this.getYRotationForLocation(location),
                }, {
                    rotateX: -40
                }, {
                    translateZ: .05
                }]
            }}>
                {location.component}
            </View>            
        )
    }
}