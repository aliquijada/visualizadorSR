
/*******************************************************************************
 * Sensores *
 * 
 * En esta sección se almacenan todos las funciones relacionadas
 * con los sensores. 
 * 
 * Guidelines: Los widgets se definen en el main y se actualizan aqui.
 ******************************************************************************/
//var sensores_puntos = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/sensores_corfo");
var dataSensores = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/DataSensores");


/*******************************************************************************
 * Funciones internas *
 ******************************************************************************/


var extraerAtributo = function(feature) {
  var atributo = 'filename';
  return feature.get(atributo);
};
/*******************************************************************************
 ******************************************************************************/


//importa el panel completo con todas las labels
function updateTooltip(coords, shapefile, panel) {

  if (typeof(coords) === 'string') {
    // Caso cuando coords es el nombre del sensor
    getPointFromSensorName(coords, function(point) {
    processAndUpdateLabels(point, shapefile, panel);
    });
  } else {
    // Caso cuando coords son las coordenadas del click en el mapa
    var point = ee.Geometry.Point([coords.lon, coords.lat]);
    processAndUpdateLabels(point, shapefile, panel);
  }

}

function getPointFromSensorName(sensorName, callback) {
  // Obtener las coordenadas del diccionario
  var sensorCoords = ee.Dictionary(nom_sensores.get(sensorName));
  
  // Evaluar las coordenadas para obtener los valores en el cliente
  sensorCoords.evaluate(function(coords) {
    if (coords) {
      var shlat = coords.lat;
      var shlon = coords.lon;
      
      if (!isNaN(shlat) && !isNaN(shlon)) {
        var point = ee.Geometry.Point([shlon, shlat]);
        callback(point);  // Llamar al callback con el punto obtenido
      } else {
        print('Coordenadas no válidas para el sensor:', sensorName);
        callback(null);  // Enviar null si las coordenadas son inválidas
      }
    } else {
      print('No se encontraron coordenadas para el sensor:', sensorName);
      callback(null);  // Enviar null si no se encuentran coordenadas
    }
  });
}

function processAndUpdateLabels(point, shapefile, panel) {
  var bufferedPoint = point.buffer(2000);  // Buffer para ayudar en la búsqueda
  
  // Encontrar el punto más cercano en el shapefile
  var nearestFeature = shapefile.filterBounds(bufferedPoint).first();

  nearestFeature.evaluate(function(feature) {
    if (feature && feature.properties) {
      var nombre = feature.properties.filename || 'No especificada';
      var localidad = feature.properties.Localidad || 'No especificada';
      var altitud = feature.properties.altitude || NaN;
      var lon = parseFloat(feature.properties.longitude) || NaN;
      var lat = parseFloat(feature.properties.latitude) || NaN;
      var rLon = lon.toFixed(2);
      var rLat = lat.toFixed(2);
      
      var labels = panel.widgets();
      labels.get(1).setValue('Nombre sensor: ' + nombre);
      labels.get(2).setValue('Localidad: ' + localidad);
      labels.get(3).setValue('Altitud: ' + altitud + ' m.');
      labels.get(4).setValue('Lon: ' + rLon + '°');
      labels.get(5).setValue('Lat: ' + rLat + '°');
      
      panel.style().set({
        'shown': true
      });
    } else {
      print('No hay sensores cercanos');
    }
  });
}



exports.updateTooltip = updateTooltip;

function zoomSensor(nombreSeleccionado, map) {
  var coords = nom_sensores.get(nombreSeleccionado);
  // Evaluar el diccionario en el cliente
  coords.evaluate(function(coordObj) {
    if (coordObj) {
      var lat = coordObj.lat;
      var lon = coordObj.lon;
      
      if (!isNaN(lat) && !isNaN(lon)) {
        var pointCoords = [lon, lat];
        var punto = ee.Geometry.Point(pointCoords);
        map.centerObject(punto, 15);
      } else {
        print('Coordenadas no válidas para el sensor:', nombreSeleccionado);
      }
    } else {
      print('No se encontraron coordenadas para el sensor:', nombreSeleccionado);
    }
  });
}



exports.zoomSensor = zoomSensor;


// Agregar una serie de tiempo al chart

function serieSensor(nombreSensor, callback) {
  var filtered = dataSensores.filter(ee.Filter.eq('Sensor', nombreSensor));
  var hsList = filtered.aggregate_array('HS');
  var fechaList = filtered.aggregate_array('Fecha');
  var longLat = nom_sensores.get(nombreSensor);
  
  // Asegúrate de que longLat esté envuelto en ee.List
  longLat = ee.List(longLat);

  var sensorDict = ee.Dictionary.fromLists(fechaList, hsList);
  var returnList = [sensorDict, longLat];

  // Evaluar y pasar el resultado al callback
  ee.Dictionary.fromLists(fechaList, hsList).evaluate(function(sensorDictEvaluated) {
    longLat.evaluate(function(longLatEvaluated) {
      var finalResult = [sensorDictEvaluated, longLatEvaluated];
      callback(finalResult);
    });
  });
}

exports.serieSensor = serieSensor;


