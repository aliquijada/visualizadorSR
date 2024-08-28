
/*******************************************************************************
 * Modulos *
 * Import all the modules from other scripts
 ******************************************************************************/
var startTime = new Date().getTime();

//var Selectores = require('users/corfobbppciren2023/App_HS_User:Selectores.js'); 
var ImgClass = require('users/aliciaquijadac/VisualizadorSR:Img_collection.js'); 
//var chartClass = require('users/corfobbppciren2023/App_HS_User:TimeSerie.js'); 
var ShacClass = require('users/aliciaquijadac/VisualizadorSR:Shacs.js'); 
//var Leyenda = require('users/corfobbppciren2023/App_HS_User:Leyenda.js'); 
//var reset = require('users/corfobbppciren2023/App_HS_User:ResetButton.js'); 
var s = require('users/aliciaquijadac/VisualizadorSR:Style.js').styles; 
var c = {}; // Define a JSON object for storing UI components.
var region = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/Geometrias/Region_de_Valparaiso_4326_corregido");
var shac_layer = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/Geometrias/SHACs_V_Region");


var shac_names = ['Melipilla','Puangue Alto','Lo Ovalle','Los Perales',
'Lo Orozco','La Vinilla-Casablanca','Estero Papudo','La Laguna -  Catapilco',
'Estero Cachagua','Estero Puchuncavi','Dunas de Quintero','Horcon',
'Estero Las Salinas Sur','Maipo Desembocadura','Rocas de Santo Domingo','Estero San Jeronimo',
'Estero Guaquen','Estero Catapilco','Algarrobo','Punta Gallo',
'Estero Casablanca Desembocadura','Estero Vina del Mar','Estero Cartagena',
'Estero San Jose','Estero El Sauce','Estero El Membrillo - AR',
'Sector 1 - Rio Pedernal','Sector 2 - Estero Las Palmas','Sector 10 - Rio Petorca Oriente',
'Sector 4 - Rio Petorca Poniente','Sector 3 - Rio del Sobrante','Sector 11 - Rio La Ligua Costa',
'Sector 7 - Rio La Ligua Cabildo','Sector 9 - Estero Los Angeles','Sector 8 - Rio La Ligua Pueblo',
'Sector 6 - Rio La Ligua Oriente','Sector 5 - Estero Alicahue','Sector 12 - Estero Patagua',
'Acuifero 1 - San Felipe','Acuifero 4 - Catemu','Acuifero 3 - Panquehue',
'Acuifero 2 - Putaendo','Acuifero 8 - Aconcagua desembocadura','Acuifero 6 - Nogales-Hijuelas',
'Acuifero 7 - Quillota','Acuifero 9 - Limache','Acuifero 5 - Llay Llay',
'Rocas Playas Los Molles','Rocas Pichidangui','Punta Pichicuy',
'Estero El Pangal','Rocas Punta La Ligua','Rocas Zapallar',
'Curauma','Rocas Punta Curaumilla','Sector Valparaiso',
'Concon','Rocas El Caracol','Rocas Punta Panul','Sector San Antonio',
'Altos de Rapel','Sector Renaca','Estero Los Molles','Estero Mantagua',
'Estero La Canela','Estero Pucalan','Quintay','El Tabo',
'Estero El Rosario - Costeras V','Estero Laguna Verde','Yali Bajo El Prado',
'Maitenlahue','Rio Rapel bajo junta estero Rosario]'];

/*******************************************************************************
 * Components *
 * 
 * A section to define the widgets that will compose your app.
 * 
 * Guidelines:
 * 1. Except for static text and constraints, accept default values;
 *    initialize them in the initialization section.
 * 2. Limit composition of widgets to those belonging to an inseparable unit
 *    (i.e. a group of widgets that would make no sense out of order). 
 ******************************************************************************/

// Define a control panel for user input.
c.controlPanel = ui.Panel();

// Define a series of panel widgets to be used as horizontal dividers.
c.dividers = {};
c.dividers.divider1 = ui.Panel();
c.dividers.divider2 = ui.Panel();
c.dividers.divider3 = ui.Panel();
c.dividers.divider4 = ui.Panel();

// Define the main interactive map.
c.map = ui.Map();

// Define an app info widget group.
c.info = {};
c.info.titleLabel = ui.Label('Superficie Regada');
c.info.aboutLabel = ui.Label(
  'Producto de superficie regada de las últimas tres temporadas,' +
  ' por SHACS de la región.' +
  ' Mediante un click, seleccione un punto de interés para obtener ' +
  'información del SHAC.');
c.info.paperLabel = ui.Label({
  value: 'Repositorio GitHub',
  targetUrl: 'https://github.com/jvaldiviesob/Humedad_de_Suelo'
});
c.info.websiteLabel = ui.Label({
  value: 'Publicación de referencia',
  targetUrl: 'https://www.nature.com/articles/s41597-023-02011-7'
});
c.info.panel = ui.Panel([
  c.info.titleLabel, c.info.aboutLabel,
  c.info.paperLabel, c.info.websiteLabel
]);

//Define a download per year widget group
c.downloadYear = {};
c.downloadYear.title = ui.Label();
c.downloadYear.label1 = ui.Label();
c.downloadYear.label2 = ui.Label();
c.downloadYear.label3 = ui.Label();
//arreglo temporal
c.downloadYearlabels = [
  c.downloadYear.label1,
  c.downloadYear.label2,
  c.downloadYear.label3,
  c.downloadYear.label4
];

//posicion capas: [REGION, SHAC, SR|FRUT|SUELO]


//region
var styled_region = region.style(s.visParams_region);
var layer_region = ui.Map.Layer(styled_region, {}, 'Región de Valparaíso');
c.map.layers().add(layer_region); //queda en posicion 1


var init_year = '2019_2020';
//probaremos con el agno 2017 primero
var disp_year = ['2019_2020',
                 '2020_2021', 
                 '2021_2022',
                 '2022_2023'];


// Define a data year selector widget group.
c.selectSHAC = {};
c.selectSHAC.label = ui.Label('Superficie Regada');
c.selectSHAC.selector = ui.Select({
  items:shac_names,
  placeholder: 'Seleccione un SHAC',
  onChange: function(selectedSHAC) {
    print(c.map.layers());
    // Reiniciar el selector de Band
    c.selectBand.selector.setValue(null);
    c.selectBand.selector.setDisabled(true);
    var layers = c.map.layers();
    for (var i = 0; i < layers.length(); i++) {
      var layer = layers.get(i);
      if (layer.getName() === 'lastHighlighted') {
        c.map.remove(layer);
        break;
      }
    }


    // Verificar si se ha seleccionado un SHAC
    if (selectedSHAC) {
      // Zoom hacia el SHAC
      ShacClass.zoomSHAC(selectedSHAC, shac_layer, c.map);
      // Habilitar el selector de Band si hay un SHAC seleccionado
      c.selectBand.selector.setDisabled(false);
    }
  }
});

c.selectSHAC.panel = ui.Panel([c.selectSHAC.label, c.selectSHAC.selector]);
c.downloadYear.panel = ui.Panel([c.downloadYear.title, 
                                  c.downloadYear.label1,
                                  c.downloadYear.label2,
                                  c.downloadYear.label3 ]);

// Define a download per day widget group
c.downloadBand = {}; //Etiqueta de descarga que se actualizará dinámicamente
c.downloadBand.title = ui.Label('');
c.downloadBand.label = ui.Label('');

// Define a data band selector widget group.
//inicializamos en el 2023
c.selectBand = {};
c.selectBand.selector = ui.Select({
  items: disp_year,
  placeholder: 'Seleccione una temporada',
  disabled: true,
  onChange: function(selectedBand) {

      if (selectedBand) {
      
      // 1. Agregar link de descarga
      var link = ImgClass.collection(c.selectSHAC.selector.getValue(), selectedBand);
      var downloadUrl = link.getDownloadURL({format: 'geojson'});
      c.downloadBand.label.setValue('Descarga Geojson');
      c.downloadBand.label.setUrl(downloadUrl);
      c.downloadBand.label.style().set(s.ableLabel);
      c.downloadBand.title.setValue('Descargar Superficie Regada');
      c.downloadBand.title.style().set(s.widgetTitle);
      
      // 2. Agregar capa a mapa
      
        var layer = ui.Map.Layer(link, {},'Superficie regada');
        
        c.map.layers().set(2, layer); //se agrega a la tercera posicion y reemplaza la SHAC highlighted

        
      }  
}
  
});


c.selectBand.panel = ui.Panel([ c.selectBand.selector]);
c.downloadBand.panel = ui.Panel([c.downloadBand.title, c.downloadBand.label ]);



// Widgets del mapa

//hay dos tablas informativas: uso de suelo y catastro frutícola

c.infoTable = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    shown: false  // Esconder el panel inicialmente
  }}); //panel con información onClick 

// Crear un botón de cerrar
var closeButton = ui.Button({
  label : 'Cerrar tabla',
  onClick: function() {
    c.infoTable.style().set('shown', false);
  }
});


// Crear las filas con etiquetas vacías que se actualizarán más tarde
var latRow = createRow('Latitud', '', 'white');
var lonRow = createRow('Longitud', '', '#D3D3D3');
var humRow = createRow('Humedad (%)', '', 'white');
var dateRow = createRow('Fecha', '', '#D3D3D3');


//Point for onClick function
var pointLayer = null;


//Uso de Suelo
c.usoSuelo = {};
c.usoSuelo.label = ui.Label('Uso de suelo');
c.usoSuelo.aboutLabel = ui.Label(
  'Información de la capa de uso de suelo ' +
  'capa actualizada a 2020.');

c.usoSuelo.cerrar = ui.Button({
  label : 'Cerrar tabla',
  onClick: function() {
    c.sensores.panel.style().set('shown', false);
  }
});
c.usoSuelo.nom_sensor = ui.Label('Nombre sensor:');
c.usoSuelo.localidad = ui.Label('Localidad:');
c.usoSuelo.altitud = ui.Label('Altitud');
c.usoSuelo.lon = ui.Label('Lon:');
c.usoSuelo.lat= ui.Label('Lat:');
c.usoSuelo.panel = ui.Panel([
  c.usoSuelo.cerrar,
  c.usoSuelo.nom_sensor, 
  c.usoSuelo.localidad,
  c.usoSuelo.altitud,
  c.usoSuelo.lon,
  c.usoSuelo.lat]);
c.usoSuelo.boton = ui.Button('Agregar capa de uso de suelo');

//Catastro frutícola
c.frut = {};
c.frut.label = ui.Label('Catastro frutícola');
c.frut.aboutLabel = ui.Label(
  'Información de la capa de catastro frutícola ' +
  'capa actualizada a 2020.');

c.frut.cerrar = ui.Button({
  label : 'Cerrar tabla',
  onClick: function() {
    c.sensores.panel.style().set('shown', false);
  }
});
c.frut.nom_sensor = ui.Label('Nombre sensor:');
c.frut.localidad = ui.Label('Localidad:');
c.frut.altitud = ui.Label('Altitud');
c.frut.lon = ui.Label('Lon:');
c.frut.lat= ui.Label('Lat:');
c.frut.panel = ui.Panel([
  c.frut.cerrar,
  c.frut.nom_sensor, 
  c.frut.localidad,
  c.frut.altitud,
  c.frut.lon,
  c.frut.lat]);
c.frut.boton = ui.Button('Agregar capa catastro frutícola');



//c.resetButton = ui.Button('Borrar Selección');
/*******************************************************************************
 * Composition *
 * 
 * A section to compose the app i.e. add child widgets and widget groups to
 * first-level parent components like control panels and maps.
 * 
 * Guidelines: There is a gradient between components and composition. There
 * are no hard guidelines here; use this section to help conceptually break up
 * the composition of complicated apps with many widgets and widget groups.
 ******************************************************************************/

c.controlPanel.add(c.info.panel);
c.controlPanel.add(c.dividers.divider1);
c.controlPanel.add(c.selectSHAC.panel);
c.controlPanel.add(c.selectBand.panel);
c.controlPanel.add(c.dividers.divider2);
c.controlPanel.add(c.usoSuelo.label);
c.controlPanel.add(c.usoSuelo.aboutLabel);
c.controlPanel.add(c.usoSuelo.boton);
c.controlPanel.add(c.dividers.divider3);
c.controlPanel.add(c.frut.label);
c.controlPanel.add(c.frut.aboutLabel);
c.controlPanel.add(c.frut.boton);
//c.controlPanel.add(c.resetButton);
c.controlPanel.add(c.dividers.divider4);
//c.controlPanel.add(c.downloadYear.panel);
c.controlPanel.add(c.downloadBand.panel);


c.infoTable.add(closeButton);
c.infoTable.add(latRow);
c.infoTable.add(lonRow);
c.infoTable.add(humRow);
c.infoTable.add(dateRow);


c.map.add(c.infoTable);




//capa sensores

var senVis = shac_layer.style({
  color: '1e90ff',
  width: 2,
  fillColor: 'ff475788',
  pointSize: 7,
  pointShape: 'circle'
});

var layerSensor = ui.Map.Layer(shac_layer,senVis, 'SHACS');
c.map.addLayer(senVis, null, 'SHACS');
c.map.add(c.usoSuelo.panel);

  
ui.root.clear();
ui.root.add(c.controlPanel);
ui.root.add(c.map);


/*******************************************************************************
 * Styling *
 * 
 * A section to define and set widget style properties.
 * Styles are defined in Style.js and imported as a module here with the 
 * name of "s". 
 * 
 ******************************************************************************/

           
c.info.titleLabel.style().set({
  fontSize: '20px',
  fontWeight: 'bold'
});
c.info.titleLabel.style().set(s.bigTopMargin);
c.info.aboutLabel.style().set(s.aboutText);
c.info.paperLabel.style().set(s.aboutText);
c.info.paperLabel.style().set(s.smallBottomMargin);
c.info.websiteLabel.style().set(s.aboutText);
c.info.websiteLabel.style().set(s.noTopMargin);

c.selectSHAC.selector.style().set(s.stretchHorizontal);
c.selectSHAC.label.style().set(s.widgetTitle);

c.selectBand.selector.style().set(s.stretchHorizontal);
c.usoSuelo.label.style().set(s.widgetTitle);
c.usoSuelo.boton.style().set(s.stretchHorizontal);
c.frut.label.style().set(s.widgetTitle);
c.frut.boton.style().set(s.stretchHorizontal);

c.downloadYear.label1.style().set(s.disableLabel);
c.downloadYear.label2.style().set(s.disableLabel);
c.downloadYear.label3.style().set(s.disableLabel);
c.downloadBand.label.style().set(s.disableLabel);
c.controlPanel.style().set(s.controlPanel);

c.map.style().set({
  cursor: 'crosshair'
});

c.map.setOptions('SATELLITE');


c.infoTable.style().set(s.opacityWhiteMed);
closeButton.style().set(s.buttonStyle);

c.usoSuelo.boton.style().set(s.widgetTitle);
c.usoSuelo.aboutLabel.style().set(s.aboutText);
c.usoSuelo.cerrar.style().set(s.buttonStyle);
c.usoSuelo.panel.style().set(s.infoTable);
c.usoSuelo.panel.style().set(s.opacityWhiteMed);
c.usoSuelo.panel.style().set({position: 'top-right'});
c.usoSuelo.nom_sensor.style().set(s.labelTabla1);
c.usoSuelo.localidad.style().set(s.labelTabla2);
c.usoSuelo.altitud.style().set(s.labelTabla1);
c.usoSuelo.lon.style().set(s.labelTabla2);
c.usoSuelo.lat.style().set(s.labelTabla1);

//c.resetButton.style().set(s.stretchHorizontal);

// Loop through setting divider style.
Object.keys(c.dividers).forEach(function(key) {
  c.dividers[key].style().set(s.divider);
});

/*******************************************************************************
 * Behaviors *
 * 
 * A section to define app behavior on UI activity.
 * 
 * Guidelines:
 * 1. At the top, define helper functions and functions that will be used as
 *    callbacks for multiple events.
 * 2. For single-use callbacks, define them just prior to assignment. If multiple
 *    callbacks are required for a widget, add them consecutively to maintain
 *    order; single-use followed by multi-use.
 * 3. As much as possible, include callbacks that update URL parameters.
 ******************************************************************************/

//c.resetButton.onClick(reset.borrarSeleccion(c,s, layerDummy, pointLayer));

/*
function borrarSeleccion(){
 c.selectYear.selector.setValue(null, false);
    c.selectBand.selector.setValue(null, false);
    c.sensores.selector.setValue(null, false);

    // 2. Ocultar las descargas
    c.downloadYear.title.setValue('');
    DownloadYearlabels.forEach(function(label) {
        label.setValue('');
        label.setUrl('');
        label.style().set(s.disableLabel);
    });
    c.downloadBand.title.setValue('');
    c.downloadBand.label.setValue('');
    c.downloadBand.label.setUrl('');
    c.downloadBand.label.style().set(s.disableLabel);

    // 3. Restaurar el mapa al estado inicial (posición y zoom).
    c.map.setCenter({
        lon: ui.url.get('lon', -70.3), // Coordenadas iniciales
        lat: ui.url.get('lat', -32.9),
        zoom: ui.url.get('zoom', 8)
    });

    // 4. Limpiar capas adicionales en el mapa, excepto las iniciales.
    c.map.layers().set(0, layerDummy); // Eliminar capa de humedad del suelo
    c.map.layers().set(1, layer_region); // Restaurar capa de región
    c.map.layers().remove(pointLayer); // Eliminar el punto de clic, si existe
    
    // 5. Ocultar elementos adicionales (gráficos, tablas, leyendas).
    c.chart.chartPanel.style().set('shown', false);
    c.infoTable.style().set('shown', false);
    c.legend.panel.style().set('shown', false);
    c.sensores.panel.style().set('shown', false);
    
    // Limpiar el panel de sensores
    c.sensores.nom_sensor.setValue('Nombre sensor:');
    c.sensores.localidad.setValue('Localidad:');
    c.sensores.altitud.setValue('Altitud');
    c.sensores.lon.setValue('Lon:');
    c.sensores.lat.setValue('Lat:');

}


c.sensores.selector.onChange(function(nombreSeleccionado) {
  Sensores.zoomSensor(nombreSeleccionado, c.map);
  Sensores.updateTooltip(nombreSeleccionado, sensores_puntos, c.sensores.panel);
  
  // Llamar a serieSensor con un callback que maneje el resultado
  Sensores.serieSensor(nombreSeleccionado, function(listGeometry) {
    if (listGeometry) {
      chartClass.createChartSensor(c, nombreSeleccionado, listGeometry, region);
    } else {
      print('listGeometry es undefined o null');
    }
  });
});
*/

function getSelectedYear() {
  var agno_sel1 = c.selectSHAC.selector.getValue();
  //var days_agno = Selectores.getDateList(agno_sel1, disp_year);
  //c.selectBand.selector.items().reset(days_agno);
  //return days_agno;
}

c.selectSHAC.selector.onChange(getSelectedYear);



//crear fila para panel de informacion 
function createRow(label, value, bgColor) {
  return ui.Panel({
    widgets: [
      ui.Label(label, {padding: '1px', backgroundColor: bgColor || 'white'}),
      ui.Label(value, {padding: '1px', backgroundColor: bgColor || 'white'})
    ],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      backgroundColor: bgColor || 'white',
      border: '1px solid black',
      stretch: 'horizontal',
      fontSize: '4px',
      height: '35px'
    }
  });
}





/*******************************************************************************
 * Initialize *
 * 
 * A section to initialize the app state on load.
 * 
 * Guidelines:
 * 1. At the top, define any helper functions.
 * 2. As much as possible, use URL params to initialize the state of the app.
 ******************************************************************************/

// Set model state based on URL parameters or default values.
c.map.setCenter({
  lon: ui.url.get('lon', -70.3),
  lat: ui.url.get('lat', -32.9),
  zoom: ui.url.get('zoom', 8)
});

function handleMouseMove(coords) {
  ShacClass.updateTooltip(coords, shac_layer, c.sensores.panel);
}

// Capturar eventos del ratón en la capa
//c.map.onClick(handleMouseMove);

c.map.onClick(function(coords) {
    ShacClass.onClickSHAC(coords.lon, coords.lat, c,region, shac_layer);
  });
  
  /*
c.map.onClick(function(coords) {
  
  //1. Seleccionar un SHAC (funcion en Shacs.js)
  
  //esta funcion solo se debe activar si hay un año cargado
  if(c.selectSHAC.selector.getValue() !== null) {
  //para agregar un punto donde clickeo el usuario
  var clickedPoint = ee.Geometry.Point(coords.lon, coords.lat);
  if (pointLayer) {
    c.map.layers().remove(pointLayer); // Remove the previous point layer
  }
  pointLayer = ui.Map.Layer(clickedPoint, {color: 'red'}, 'Punto seleccionado');
  
  
  var valueDict = chartClass.Click(c.selectSHAC.selector.getValue(), coords, region);
  chartClass.createChartOUT(c,valueDict);
  
  //if(c.selectBand.selector.getValue()!== null){
  chartClass.tablaInfo(coords, {map: c.map}, region, valueDict, c.selectBand.selector.getValue(), function(values) {
    if (values) {
      // Actualizar las etiquetas con los valores retornados
      latRow.widgets().get(1).setValue(values.lat);
      lonRow.widgets().get(1).setValue(values.lon);
      humRow.widgets().get(1).setValue(values.hs);
      dateRow.widgets().get(1).setValue(values.newDate);
      
      // Mostrar el panel
      c.infoTable.style().set('shown', true);
      c.infoTable.style().set('position', 'bottom-left');
    } else {
      // Si no hay datos para las coordenadas clickeadas, esconder el panel
      c.infoTable.style().set('shown', false);
    }
  });
  
  if(valueDict){
    c.map.layers().add(pointLayer);
  }}  
  }
  
);
*/

print(c);
print(c.map.layers());
var endTime = new Date().getTime();

var executionTime = endTime - startTime;

// Imprimir el tiempo de ejecución en la consola
print('Tiempo de ejecución (ms):', executionTime);
