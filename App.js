
/*******************************************************************************
 * Modulos *
 * Import all the modules from other scripts
 ******************************************************************************/
var startTime = new Date().getTime();

//var Selectores = require('users/corfobbppciren2023/App_HS_User:Selectores.js'); 
//var ImgClass = require('users/corfobbppciren2023/App_HS_User:Img_collection.js'); 
//var chartClass = require('users/corfobbppciren2023/App_HS_User:TimeSerie.js'); 
var ShacClass = require('users/aliciaquijadac/VisualizadorSR:Shacs.js'); 
//var Leyenda = require('users/corfobbppciren2023/App_HS_User:Leyenda.js'); 
//var reset = require('users/corfobbppciren2023/App_HS_User:ResetButton.js'); 
var s = require('users/aliciaquijadac/VisualizadorSR:Style.js').styles; 
var c = {}; // Define a JSON object for storing UI components.
var region = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/Geometrias/Region_de_Valparaiso_4326_corregido");
var shac_layer = ee.FeatureCollection("projects/ee-aliciaquijadac/assets/Geometrias/SHACs_V_Region");
var shac_names = [
  'Acuifero_1_San_Felipe',
'Acuifero_2_Putaendo',
'Acuifero_3_Panquehue',
'Acuifero_4_Catemu',
'Acuifero_5_Llay_Llay',
'Acuifero_6_Nogales_Hijuelas',
'Acuifero_7_Quillota',
'Acuifero_8_Aconcagua_desembocadura',
'Acuifero_9_Limache',
'Algarrobo',
'Altos_de_Rapel',
'Concon',
'Curauma',
'Dunas_de_Quintero',
'El_Tabo',
'Esterlo_Los_Molles',
'Estero_Cachagua',
'Estero_Cartagena',
'Estero_Casablanca_Desembocadura',
'Estero_Catapilco',
'Estero_El_Membrillo_AR',
'Estero_El_Pangal',
'Estero_El_Rosario_Costeras_V',
'Estero_El_Sauce',
'Estero_Guaquen',
'Estero_Laguna_Verde',
'Estero_Las_Salinas_Sur',
'Estero_La_Canela',
'Estero_Mantagua',
'Estero_Papudo',
'Estero_Pucalan',
'Estero_Puchuncavi',
'Estero_San_Jeronimo',
'Estero_San_Jose',
'Estero_Vina_del_Mar',
'Horcon',
'La_Laguna_Catapilco',
'La_Vinilla_Casablanca',
'Los_Perales',
'Lo_Orozco',
'Lo_Ovalle',
'Maipo_Desembocadura',
'Melipilla',
'Puangue_Alto',
'Punta_Gallo',
'Punta_Pichicuy',
'Quintay',
'Rio_Rapel_bajo_junta_Estero_Rosario',
'Rocas_de_Santo_Domingo',
'Rocas_El_Caracol',
'Rocas_Pichidangui',
'Rocas_Punta_Curaumilla',
'Rocas_Punta_La_Ligua',
'Rocas_Punta_Panul',
'Rocas_Zapallar',
'Roca_Playas_Los_Molles',
'Sector_10_Rio_Petorca_Oriente',
'Sector_11_Rio_La_Ligua_Costa',
'Sector_12_Estero_Patagua',
'Sector_1_Rio_Pedernal',
'Sector_2_Estero_Las_Palmas',
'Sector_3_Rio_del_Sobrante',
'Sector_4_Rio_Petorca_Oriente',
'Sector_5_Estero_Alicahue',
'Sector_6_Rio_La_Ligua_Oriente',
'Sector_7_Rio_La_Ligua_Cabildo',
'Sector_8_Rio_La_Ligua_Pueblo',
'Sector_9_Los_Angeles',
'Sector_Renaca',
'Sector_San_Antonio',
'Sector_Valparaiso',
'Yali_Bajo_El_Prado'];
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


var init_year = '2019-2020';
//probaremos con el agno 2017 primero
var disp_year = ['2019-2020',
                 '2020-2021', 
                 '2021-2022',
                 '2022-2023'];


// Define a data year selector widget group.
c.selectYear = {};
c.selectYear.label = ui.Label('Superficie Regada');
c.selectYear.selector = ui.Select({
  items:shac_names,
  placeholder: 'Seleccione un SHAC',
  onChange: function(selectedYear) {

    var links = ImgClass.collection(selectedYear, '01/01/0101', disp_year)[0];
    
    Selectores.onChangeSelectedYear(c, links, selectedYear, s);
  }
  
  
});

c.selectYear.panel = ui.Panel([c.selectYear.label, c.selectYear.selector]);
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
c.controlPanel.add(c.selectYear.panel);
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
//c.controlPanel.add(c.dividers.divider4);
c.controlPanel.add(c.downloadYear.panel);
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

c.selectYear.selector.style().set(s.stretchHorizontal);
c.selectYear.label.style().set(s.widgetTitle);

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
  var agno_sel1 = c.selectYear.selector.getValue();
  var days_agno = Selectores.getDateList(agno_sel1, disp_year);
  c.selectBand.selector.items().reset(days_agno);
  return days_agno;
}

c.selectYear.selector.onChange(getSelectedYear);



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
c.map.onClick(handleMouseMove);

c.map.onClick(function(coords) {
  
  //esta funcion solo se debe activar si hay un año cargado
  if(c.selectYear.selector.getValue() !== null) {
  //para agregar un punto donde clickeo el usuario
  var clickedPoint = ee.Geometry.Point(coords.lon, coords.lat);
  if (pointLayer) {
    c.map.layers().remove(pointLayer); // Remove the previous point layer
  }
  pointLayer = ui.Map.Layer(clickedPoint, {color: 'red'}, 'Punto seleccionado');
  
  
  var valueDict = chartClass.Click(c.selectYear.selector.getValue(), coords, region);
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


print(c);
print(c.map.layers());
var endTime = new Date().getTime();

var executionTime = endTime - startTime;

// Imprimir el tiempo de ejecución en la consola
print('Tiempo de ejecución (ms):', executionTime);
