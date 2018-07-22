// Copyright 2004-present Facebook. All Rights Reserved.

import { Module } from 'react-360-web';
import { AsyncStorage } from 'react-native';

/**
 * Demonstration of a custom Native Module, used to send browser information
 * to the React application.
 */
export default class CustomModule extends Module {
  constructor(ctx) {
    super('CustomModule');
    this._ctx = ctx;
    this._trip = null;
  }
}
