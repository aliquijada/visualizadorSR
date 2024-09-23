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



var ClaseStyles = ee.Dictionary({
  'AREAS ARTIFICIALES': {color: '#FF5733'}, // Orange Red
  'AREAS DESPROVISTAS DE VEGETACION': {color: '#F0E68C'}, // Khaki
  'BOSQUES': {color: '#228B22'}, // Forest Green
  'CUERPOS DE AGUA': {color: '#1E90FF'}, // Dodger Blue
  'HUMEDALES': {color: '#40E0D0'}, // Turquoise
  'NIEVES Y GLACIARES': {color: '#ADD8E6'}, // Light Blue
  'PLANTACIONES FORESTALES': {color: '#6A5ACD'}, // Slate Blue
  'PRADERAS Y MATORRALES': {color: '#98FB98'}, // Pale Green
  'TERRENOS AGRICOLAS': {color: '#D2B48C'}  // Tan
});

/*******************************************************************************
 * Modulos *
 * Import all the modules from other scripts
 ******************************************************************************/
var startTime = new Date().getTime();

var ImgClass = require('users/aliciaquijadac/VisualizadorSR:Img_collection.js'); 

var catClass = require('users/aliciaquijadac/VisualizadorSR:CatastroFruticola.js'); 
var usoClass = require('users/aliciaquijadac/VisualizadorSR:usoSuelo.js'); 

var ShacClass = require('users/aliciaquijadac/VisualizadorSR:Shacs.js'); 
var legends = require('users/aliciaquijadac/VisualizadorSR:Legend.js');

var s = require('users/aliciaquijadac/VisualizadorSR:Style.js').styles; 
var c = {}; // Define a JSON object for storing UI components.
var region = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/Geometrias/Region_de_Valparaiso_4326_corregido");
var shac_layer = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/Geometrias/SHACs_V_Region");

var uso_suelo = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/Uso_de_Suelo/cut_valparaiso_2020");

uso_suelo = uso_suelo.map(function(feature) {
  return feature.set('style', ClaseStyles.get(feature.get('CLASE')));
});

var styledUsoSuelo = uso_suelo.style({
  styleProperty: 'style',
});

var Rcat_frut = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/Catastro_fruticola/prod_frutic_ide_05_2020_1_2");

var cat_frut = Rcat_frut.style(s.catFrutStyle);

/*******************************************************************************
 * Funciones internas *
 * 
 * Una sección para definir las funciones que se utilizaran internamente
 ******************************************************************************/

function layerExists(layers, layerName) {
  var exists = false;
  layers.forEach(function(layer) {
    if (layer.getName() === layerName && layer.getShown()) {  // Comprobar si el nombre coincide
      exists = true;
      
    }
  });
  
  return exists;
}

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
  //c.info.paperLabel, c.info.websiteLabel
]);

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
    // 1. Reiniciar el selector de Band
    c.selectBand.selector.setValue(null);
    c.selectBand.selector.setDisabled(true);
    // 2. Eliminar capa highlighted
    var layers = c.map.layers();
    for (var i = 0; i < layers.length(); i++) {
      var layer = layers.get(i);
      if (layer.getName() === 'lastHighlighted') {
        c.map.remove(layer);
        break;
      }
    }
    // 3. Zoom hacia SHAC y habilitar temporada
    var valueLabel = c.frut.com.getValue(); //label para comparar si se agrego la tab. cat. Frut
    var catFrutExist = layerExists(layers, 'Catastro Frutícola');
    if (selectedSHAC && !catFrutExist) {

      // Zoom hacia el SHAC
      ShacClass.zoomSHAC(selectedSHAC, shac_layer, c.map);
      // Habilitar el selector de Band si hay un SHAC seleccionado
      c.selectBand.selector.setDisabled(false);
    }
   
    // 4. Generar la URL de descarga para uso de suelo.
    /*
    c.usoSuelo.boton.setDisabled(false);
    var nameSHAC = selectedSHAC.split(' ').join('_');
    var usSHAC = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/Uso_de_Suelo/uso_suelo_" + nameSHAC);
    var downloadUrlUSSHAC = usSHAC.getDownloadURL({format: 'geojson'});
  */
  }
});

c.selectSHAC.panel = ui.Panel([c.selectSHAC.label, c.selectSHAC.selector]);

// Definir grupo de descarga para SR
c.downloadBand = {}; //Etiqueta de descarga que se actualizará dinámicamente
c.downloadBand.title = ui.Label('');
c.downloadBand.label = ui.Label('');

// Define a data band selector widget group.

c.selectBand = {};
c.selectBand.selector = ui.Select({
  items: disp_year,
  placeholder: 'Seleccione una temporada',
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


//Point for onClick function
var pointLayer = null;


//Uso de Suelo
c.usoSuelo = {};
c.usoSuelo.legend = legends.createUsoSueloLegend();
c.usoSuelo.label = ui.Label('Uso de suelo');
c.usoSuelo.aboutLabel = ui.Label(
  'Información de la capa de uso de suelo ' +
  'para el SHAC seleccionado (Capa actualizada hasta el año 2020).');
c.usoSuelo.cerrar = ui.Button({
  label : 'Cerrar tabla Uso de Suelo',
  style: {stretch: 'horizontal', fontSize: '12px', padding: '1px'},
  onClick: function() {
    c.usoSuelo.panel.style().set('shown', false);
  }});
  
c.usoSuelo.buttonPanel = ui.Panel({
  widgets: [c.usoSuelo.cerrar],
});
c.usoSuelo.dynamicPanel = ui.Panel({
  // Panel para almacenar la informacion a presentar
  widgets: [],
});
c.usoSuelo.clase = ui.Label('');
c.usoSuelo.uso = ui.Label('');
c.usoSuelo.tipo = ui.Label('');
c.usoSuelo.esp1 = ui.Label('');
c.usoSuelo.esp2 = ui.Label('');
c.usoSuelo.esp3 = ui.Label('');
c.usoSuelo.esp4 = ui.Label('');
c.usoSuelo.esp5 = ui.Label('');
c.usoSuelo.esp6 = ui.Label('');
c.usoSuelo.variedad= ui.Label('');
c.usoSuelo.com =ui.Label('');
c.usoSuelo.prov =ui.Label('');
c.usoSuelo.ori =ui.Label('');
c.usoSuelo.pan1 = ui.Panel({style: {border: '1px solid black'}});

c.usoSuelo.panel = ui.Panel({
  widgets: [c.usoSuelo.buttonPanel, c.usoSuelo.dynamicPanel]});
c.usoSuelo.panel.style().set('shown', false);


c.usoSuelo.boton= ui.Button({
  label : 'Agregar capa de uso de suelo',
  onClick: function() {
    var currentLabel = c.usoSuelo.boton.getLabel();
    var layers = c.map.layers();
    var n = layers.length();
    var usExist = layerExists(layers, 'Uso de Suelo');
    var layer = ui.Map.Layer(styledUsoSuelo, {} ,'Uso de Suelo');
  if (currentLabel === 'Agregar capa de uso de suelo') {
    
      c.usoSuelo.legend.style().set('shown', true);
      c.usoSuelo.boton.setLabel('Quitar capa de uso de suelo');
      if (!usExist){
      c.map.layers().set(n+1, layer); //se agrega a la ultima posicion 
      }
      else {

        layers.forEach(function(existingLayer) {
          if (existingLayer.getName() === 'Uso de Suelo') {
            existingLayer.setShown(true);

          }
        });
      }
    } 
    else {
      layers.forEach(function(existingLayer) {
          if (existingLayer.getName() === 'Uso de Suelo') {
            existingLayer.setShown(false);
          }
        });
      c.usoSuelo.boton.setLabel('Agregar capa de uso de suelo');
      c.usoSuelo.legend.style().set('shown', false);
    }
  }
});




//Catastro frutícola
c.frut = {};
c.frut.label = ui.Label('Catastro frutícola');
c.frut.aboutLabel = ui.Label(
  'Información de la capa de catastro frutícola ' +
  'capa actualizada a 2020.');

c.frut.cerrar = ui.Button({
  label : 'Cerrar tabla Cat. Frutícola',
  style: {stretch: 'horizontal', fontSize: '12px', padding: '1px'},
  onClick: function() {
    c.frut.panel.style().set('shown', false);
  }});
  
c.frut.buttonPanel = ui.Panel({
  widgets: [c.frut.cerrar],
});
c.frut.dynamicPanel = ui.Panel({
  // Panel para almacenar la informacion a presentar
  widgets: [],
});
c.frut.com = ui.Label('');
c.frut.esp1 = ui.Label('');
c.frut.arb1 = ui.Label('');
c.frut.sup1 = ui.Label('');
c.frut.esp2 = ui.Label('');
c.frut.arb2 = ui.Label('');
c.frut.sup2 = ui.Label('');
c.frut.esp3 = ui.Label('');
c.frut.arb3 = ui.Label('');
c.frut.sup3 = ui.Label('');
c.frut.esp4 = ui.Label('');
c.frut.arb4 = ui.Label('');
c.frut.sup4 = ui.Label('');
c.frut.pan1 = ui.Panel({style: {border: '1px solid black'}});
c.frut.pan2 = ui.Panel({style: {border: '1px solid black'}});
c.frut.pan3 = ui.Panel({style: {border: '1px solid black'}});
c.frut.pan4 = ui.Panel({style: {border: '1px solid black'}});

c.frut.panel = ui.Panel({
  widgets: [c.frut.buttonPanel, c.frut.dynamicPanel]});
c.frut.panel.style().set('shown', false);


c.frut.boton = ui.Button({
  label: 'Agregar capa catastro frutícola',
  onClick: function() {
    var currentLabel = c.frut.boton.getLabel();
    var layers = c.map.layers();
    var n = layers.length();
    var catFrutExist = layerExists(layers, 'Catastro Frutícola');
    
    if (currentLabel === 'Agregar capa catastro frutícola') {
      // Check if the layer already exists
      if (!catFrutExist) {
        var layer = ui.Map.Layer(cat_frut, {}, 'Catastro Frutícola');
        c.map.layers().set(n, layer); // Add to the last position
      } else {
        layers.forEach(function(existingLayer) {
          if (existingLayer.getName() === 'Catastro Frutícola') {
            existingLayer.setShown(true);
          }
        });
      }
      c.frut.boton.setLabel('Quitar capa catastro frutícola');
    } else {
      layers.forEach(function(existingLayer) {
        if (existingLayer.getName() === 'Catastro Frutícola') {
          existingLayer.setShown(false);
        }
      });
      c.frut.boton.setLabel('Agregar capa catastro frutícola');
    }
  }
});


//reset
c.resetButton = ui.Button({
  label : 'Borrar selecciones',
  onClick: function() {
    borrarSeleccion();
    print('click');//c.usoSuelo.panel.style().set('shown', false);
  }});

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
c.controlPanel.add(c.dividers.divider4);
c.controlPanel.add(c.resetButton);
c.controlPanel.add(c.downloadBand.panel);

c.map.add(c.frut.panel);
c.map.add(c.usoSuelo.legend);
c.map.setControlVisibility({'layerList':false}); //Oculta el layer control



var senVis = shac_layer.style({
  color: 'black', // Color gris para el borde
  width: 1.5,        // Ancho del borde
  fillColor: '00000000', // Sin color de relleno (transparente)
  lineType: 'dashed' // Tipo de línea punteada
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

c.controlPanel.style().set(s.controlPanel);

c.map.style().set({
  cursor: 'crosshair'
});

c.map.setOptions('SATELLITE');

c.usoSuelo.boton.style().set(s.widgetTitle);
c.usoSuelo.aboutLabel.style().set(s.aboutText);
c.usoSuelo.cerrar.style().set(s.buttonStyle);
c.usoSuelo.panel.style().set(s.opacityWhiteMed);
c.usoSuelo.panel.style().set({position: 'top-left'});

c.usoSuelo.ori.style().set(s.greyLabel);
c.usoSuelo.com.style().set(s.whiteLabel);
c.usoSuelo.prov.style().set(s.greyLabel);
c.usoSuelo.uso.style().set(s.whiteLabel);
c.usoSuelo.tipo.style().set(s.greyLabel);
c.usoSuelo.variedad.style().set(s.whiteLabel);
c.usoSuelo.esp1.style().set(s.greyLabel);
c.usoSuelo.esp2.style().set(s.whiteLabel);
c.usoSuelo.esp3.style().set(s.greyLabel);
c.usoSuelo.esp4.style().set(s.whiteLabel);
c.usoSuelo.esp5.style().set(s.greyLabel);
c.usoSuelo.esp6.style().set(s.whiteLabel);

c.frut.panel.style().set(s.opacityWhiteMed);
c.frut.panel.style().set({position: 'bottom-left'});
c.frut.com.style().set(s.whiteLabel);
c.frut.esp1.style().set(s.greyLabel);
c.frut.arb1.style().set(s.whiteLabel);
c.frut.sup1.style().set(s.greyLabel);
c.frut.esp2.style().set(s.whiteLabel);
c.frut.arb2.style().set(s.greyLabel);
c.frut.sup2.style().set(s.whiteLabel);
c.frut.esp3.style().set(s.greyLabel);
c.frut.arb3.style().set(s.whiteLabel);
c.frut.sup3.style().set(s.greyLabel);
c.frut.esp4.style().set(s.whiteLabel);
c.frut.arb4.style().set(s.greyLabel);
c.frut.sup4.style().set(s.whiteLabel);
c.resetButton.style().set(s.stretchHorizontal);

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



function borrarSeleccion(){
  var actualLayers = c.map.layers();
  var shac =c.selectSHAC.selector.getValue();
  var temp = c.selectBand.selector.getValue();
  var catFrutExist = layerExists(actualLayers, 'Catastro Frutícola');
  var usoSueloExist = layerExists(actualLayers, 'Uso de Suelo');
  
  //1. Recentrar
  c.map.setCenter({
  lon: ui.url.get('lon', -70.3),
  lat: ui.url.get('lat', -32.9),
  zoom: ui.url.get('zoom', 8)
    });

 //2. SHAC
 if(shac!== null){
  c.selectSHAC.selector.setValue(null);
 }
 // 3. Punto rojo
  if (pointLayer) {
      actualLayers.remove(pointLayer); // Remove the previous point layer
  }
  // 4. Temporada
  if(temp!== null){
    c.selectBand.selector.setValue(null);
    for (var i = 0; i < actualLayers.length(); i++) {
      var layer = actualLayers.get(i);
      if (layer.getName() === 'Superficie regada') {
        c.map.remove(layer);
        break;
      }
    }
    c.downloadBand.panel.clear(); 
  }
  
  // 5. Uso de Suelo
  if(usoSueloExist){
    c.usoSuelo.legend.style().set('shown', false);
    c.usoSuelo.boton.setLabel('Agregar capa de uso de suelo');
    c.usoSuelo.panel.style().set('shown', false);
     actualLayers.forEach(function(existingLayer) {
          if (existingLayer.getName() === 'Uso de Suelo') {
            existingLayer.setShown(false);
          }
        });
  }
  
  //6. Catastro Fruticola
  if(catFrutExist){
    c.frut.boton.setLabel('Agregar capa catastro frutícola');
    c.frut.panel.style().set('shown', false);
    actualLayers.forEach(function(existingLayer) {
          if (existingLayer.getName() === 'Catastro Frutícola') {
            existingLayer.setShown(false);
          }
        });
      
  }

}


function getSelectedYear() {
  var agno_sel1 = c.selectSHAC.selector.getValue();
  //var days_agno = Selectores.getDateList(agno_sel1, disp_year);
  //c.selectBand.selector.items().reset(days_agno);
  //return days_agno;
}

c.selectSHAC.selector.onChange(getSelectedYear);

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
  
    var actualLayers = c.map.layers();
    var clickedPoint = ee.Geometry.Point(coords.lon, coords.lat);
    
    var catFrutExist = layerExists(actualLayers, 'Catastro Frutícola');
    var usoSueloExist = layerExists(actualLayers, 'Uso de Suelo');
    // 1. Seleccionar SHAC si no hay uso de suelo ni catastro fruticola
    if(!catFrutExist && !usoSueloExist){
    ShacClass.onClickSHAC(coords.lon, coords.lat, c,region, shac_layer);
      }
    // 2. Remover punto anterior y Colocar punto 
    
    if (pointLayer) {
      actualLayers.remove(pointLayer); // Remove the previous point layer
    }
    pointLayer = ui.Map.Layer(clickedPoint, {color: 'red'}, 'Punto seleccionado');
    actualLayers.add(pointLayer);
    
    // 3. Agregar tabla de cat. fruticola
    if (catFrutExist) { //si existe e intersecta con el valor
      catClass.actualizarCatFrut(clickedPoint, Rcat_frut,c);
    } else {
      // Si no hay datos para las coordenadas clickeadas, esconder el panel
      c.frut.panel.style().set('shown', false);
      }
      
    // 4. Agregar tabla de uso de suelo
    
    if (usoSueloExist) { //si existe e intersecta con el valor
      usoClass. actualizarUsoSuelo(clickedPoint, uso_suelo,c);
      
    } else {
      // Si no hay datos para las coordenadas clickeadas, esconder el panel
      c.usoSuelo.panel.style().set('shown', false);
      }
  
});
  

print(c);
var endTime = new Date().getTime();

var executionTime = endTime - startTime;

// Imprimir el tiempo de ejecución en la consola
print('Tiempo de ejecución (ms):', executionTime);
