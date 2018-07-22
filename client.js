// This file contains the boilerplate to execute your React app.
// If you want to modify your application's content, start in "index.js"

import { ReactInstance, Location } from 'react-360-web';

function init(bundle, parent, options = {}) {
  const r360 = new ReactInstance(bundle, parent, {
    fullScreen: true,
    ...options,
  });

  // Render your app content to the default cylinder surface
  r360.renderToLocation(
    r360.createRoot('Backstrokes360', {
      /* initial props */
    }),
    new Location([0, 0, 0])
  );

  // Load the initial environment
  r360.compositor.setBackground(r360.getAssetURL('star_bg.jpg'));

  const bundleURL = new URL('http://localhost:8081/' + bundle);

  console.warn(`HotReload on ${bundle}`);
  r360.runtime.context.callFunction('HMRClient', 'enable', [
    'vr',
    bundleURL.pathname.toString().substr(1),
    bundleURL.hostname,
    bundleURL.port,
  ]);
}

window.React360 = { init };
