import { loadList, loadDetails } from './api';
import { getDetailsContentLayout } from './details';
import { createFilterControl } from './filter';

import { logger } from '../utils/really-simple-logger';
const log = logger('map.js')

/**
 * Генерирует карту
 * @param {Object} ymaps глобальный объект, предоставляемый API Яндекс-карт
 * @param {String} containerId id элемента в котором будет расположена карта
 */
export function initMap(ymaps, containerId) {
  const myMap = new ymaps.Map(containerId, {
    center: [55.76,37.64], //координаты показывают нужное место, но карта зумится на Москву (upd: на самом деле правильное место, просто маппер меняет координаты точек местами)
    controls: [],
    zoom: 10
  });
  /**
   * Менеджер объектов карты: https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ObjectManager-docpage/
   * Производится создание менеджера объектов карты через его конструктор.
   */
  const objectManager = new ymaps.ObjectManager({
    clusterize: true, //указывает нужно ли кластеризировать объекты
    gridSize: 64, // ?
    clusterIconLayout: 'default#pieChart',
    clusterDisableClickZoom: false,
    geoObjectOpenBalloonOnClick: false,
    geoObjectHideIconOnBalloonOpen: false,
    geoObjectBalloonContentLayout: getDetailsContentLayout(ymaps)
  });

  objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
  
  /**
   * Тут производится добавление объектов в objectManager 
   * [1] Пример: https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ObjectManager-docpage/#method_detail__add
   */
  loadList().then(data => {
    log('adding data to objectManager', 'initMap', 'info', data)
    objectManager.add(data); 
    myMap.geoObjects.add(objectManager); //Для добавления объектов на карту тут не хватало этой строчки [1]
  });

  // details
  objectManager.objects.events.add('click', event => {
    const objectId = event.get('objectId');
    const obj = objectManager.objects.getById(objectId);

    objectManager.objects.balloon.open(objectId);

    if (!obj.properties.details) {
      loadDetails(objectId).then(data => {
        obj.properties.details = data;
        objectManager.objects.balloon.setData(obj);
      });
    }
  });
  
  // filters
  const listBoxControl = createFilterControl(ymaps);
  myMap.controls.add(listBoxControl);

  var filterMonitor = new ymaps.Monitor(listBoxControl.state);
  filterMonitor.add('filters', filters => {
    objectManager.setFilter(
      obj => filters[obj.isActive ? 'active' : 'defective']
    );
  });
}
