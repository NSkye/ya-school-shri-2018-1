import { initMap } from "./map";

import { logger } from '../utils/really-simple-logger'
const log = logger('index.js');

ymaps.ready(() => {
  initMap(ymaps, "map");
  log('map initialized', 'ymaps.ready(callback)');
});
