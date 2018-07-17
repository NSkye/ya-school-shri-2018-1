import { mapServerData } from './mappers';

import { logger } from '../utils/really-simple-logger';
const log = logger('api.js');
 
export function loadList() {
  return fetch('/api/stations')
    .then(response => {
      log(`fetched list of stations`, 'loadList', 'info', JSON.stringify(response))
      return response.json()
    })
    .then(mapServerData);
}

export function loadDetails(id) 
{
  return fetch(`/api/stations/${id}`).then(response => {
    log(`fetched data for station ${id}`, 'loadDetails');
    return response.json()
  });
}
