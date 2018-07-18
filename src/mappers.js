import { logger } from '../utils/really-simple-logger';
const log = logger('mappers.js');

/**
 * Преобразует данные с сервера в объекты для карты
 * @param {Object} serverData данные полученные с сервера
 */
export function mapServerData(serverData) {
  log('mapServerData recieved argument', 'mapServerData', 'info', serverData)
  return {
    type: "FeatureCollection",
    features: serverData.map((obj, index) => ({
      id: index,
      type: "Feature",
      isActive: obj.isActive,
      geometry: 
      {
        type: "Point",
        coordinates: [obj.lat, obj.long] //тут координаты менялись местами, больше они этого делать не будут, они обещали
      },
      properties: {
        iconCaption: obj.serialNumber
      },
      options: {
        preset: getObjectPreset(obj)
      }
    }))
  };
}

function getObjectPreset(obj) {
  return obj.isActive
    ? 'islands#blueCircleDotIconWithCaption'
    : 'islands#redCircleDotIconWithCaption';
}
