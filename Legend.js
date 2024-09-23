// legends.js

// Function to create the legend for land use
exports.createUsoSueloLegend = function() {

  // Create the legend panel, initially hidden
  var legend = ui.Panel({
    style: {
      position: 'bottom-right',
      padding: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      shown: false  // Initially hidden
    }
  });

  // Title for the legend
  var legendTitle = ui.Label('Leyenda uso de suelo', {
    fontWeight: 'bold',
    fontSize: '14px',
    margin: '0 0 4px 0'
  });

  // Add title to the legend panel
  legend.add(legendTitle);

  // Function to create a legend item
  function makeLegendItem(color, name) {
    // Create a small color box
    var colorBox = ui.Label('', {
      backgroundColor: color,
      padding: '10px',
      margin: '0'
    });
    
    // Create the label for the class name
    var description = ui.Label(name, {
      margin: '5px 0 4px 6px',
      fontSize: '12px',
      color: 'black'
    });
    
    // Combine colorBox and description into a horizontal panel
    var legendItem = ui.Panel({
      widgets: [colorBox, description],
      layout: ui.Panel.Layout.Flow('horizontal')
    });
    
    return legendItem;
  }

  // Add all legend items to the legend panel
  legend.add(makeLegendItem('#FF5733', 'AREAS ARTIFICIALES'));
  legend.add(makeLegendItem('#F0E68C', 'AREAS DESPROVISTAS DE VEGETACION'));
  legend.add(makeLegendItem('#228B22', 'BOSQUES'));
  legend.add(makeLegendItem('#1E90FF', 'CUERPOS DE AGUA'));
  legend.add(makeLegendItem('#40E0D0', 'HUMEDALES'));
  legend.add(makeLegendItem('#ADD8E6', 'NIEVES Y GLACIARES'));
  legend.add(makeLegendItem('#6A5ACD', 'PLANTACIONES FORESTALES'));
  legend.add(makeLegendItem('#98FB98', 'PRADERAS Y MATORRALES'));
  legend.add(makeLegendItem('#D2B48C', 'TERRENOS AGRICOLAS'));

  // Return the legend panel
  return legend;
};
