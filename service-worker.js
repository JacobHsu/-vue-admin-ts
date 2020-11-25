importScripts("/vue-admin-ts/precache-manifest.e340d2892ac484b2b6f09df278761c48.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

// This is the code piece that GenerateSW mode can't provide for us.
// This code listens for the user's confirmation to update the app.
self.addEventListener('message', (e) => {
  if (e.data) {
    if (e.data === 'skipWaiting') {
      self.skipWaiting()
    }
  }
})

/* eslint-disable no-undef */
workbox.core.clientsClaim()
workbox.precaching.precacheAndRoute(self.__precacheManifest || [])

