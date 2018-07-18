import { loadList, loadDetails } from './api';
import { getDetailsContentLayout } from './details';
import { createFilterControl } from './filter';
import { getPopupContent } from './popup';

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

  /**
   * По умолчанию всем кластерам ставится зеленый цвет
   */
  objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
  /**
   * Когда происходит создание кластера, проверяются все объекты в нем.
   * Если в нем есть неактивные объекты (дефектные станции), то делаем кластер оранжевым.
   * Если все станции в кластере дефектны, то делаем кластер красным.
   * Доки: https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/objectManager.ClusterCollection-docpage
   */
  objectManager.clusters.events.add('add', function (e) {
    const cluster = objectManager.clusters.getById(e.get('objectId')); //узнаем что у нас за кластер
    const objects = cluster.properties.geoObjects; //получаем все объекты кластера
    const inactiveObjsCount = objects.reduce((ac, cv) => //итерируем через все объекты, одновременно считая их
      cv.isActive ? ac //если объект активен, то ничего не делаем
      : objectManager.clusters.setClusterOptions(cluster.id, {preset:'islands#orangeClusterIcons'}) && ac+1, 0 //если нет, то делаем кластер оранжевым и считаем его
    )
    if (objects.length == inactiveObjsCount) { //если количество неактивных объектов = количеству объектов в кластере
      objectManager.clusters.setClusterOptions(cluster.id, {preset:'islands#redClusterIcons'}) //делаем кластер красным
    }
  })

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
    log('station was clicked', 'objectManager.objects.events.add', 'info', event.get('objectId'))
    const objectId = event.get('objectId');
    const obj = objectManager.objects.getById(objectId);

    objectManager.objects.balloon.open(objectId);

    if (!obj.properties.details) {
      loadDetails(objectId).then(data => {
        obj.properties.details = data;
        log(`loaded details for station ${event.get('objectId')}`, 'loadDetails(objectId).then()', 'info', obj)
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
