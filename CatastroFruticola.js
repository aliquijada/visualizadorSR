exports.actualizarCatFrut = function(point, cat_frut, c) {
  var startTime = new Date().getTime();
  
  // 1. Clear all dynamic panels
  c.frut.dynamicPanel.clear();
  c.frut.pan1.clear();
  c.frut.pan2.clear();
  c.frut.pan3.clear();
  c.frut.pan4.clear();
  print('coords', point);
  // Filter features by the point
  var features = cat_frut.filterBounds(point);
  var count = features.size();

  // Use 'evaluate' to work with the number of features asynchronously
  count.evaluate(function(countVal) {
    if (countVal === 0) {
      print('No se encontró información en las coordenadas seleccionadas.');
      c.frut.panel.style().set('shown', false);
      return;
    }
    
    // Get the first feature
    var featureList = features.toList(countVal);
    var feature = ee.Feature(featureList.get(0));
    
    // Retrieve the required properties without getInfo
    var comuna = feature.get('desccomu').getInfo();
    var especie1 = feature.get('especie_01');
    var arbol1 = feature.get('arboles_01');
    var superficie1 = feature.get('superfi_01');
    
    c.frut.com.setValue('Comuna: ' + comuna);
    c.frut.dynamicPanel.insert(1,c.frut.com);
    
    
    especie1.evaluate(function(especieVal) {
      arbol1.evaluate(function(arbolVal) {
        superficie1.evaluate(function(superficieVal) {
          if (especieVal) c.frut.esp1.setValue('Especie 1: ' + especieVal);
          if (arbolVal) c.frut.arb1.setValue('N. árboles: ' + arbolVal);
          if (superficieVal) c.frut.sup1.setValue('Superficie: ' + superficieVal + ' ha');
          
          c.frut.pan1.insert(0, c.frut.esp1);
          c.frut.pan1.insert(1, c.frut.arb1);
          c.frut.pan1.insert(2, c.frut.sup1);
          c.frut.dynamicPanel.insert(2, c.frut.pan1);
        });
      });
    });

    // Process the second set of features
    feature.get('arboles_02').evaluate(function(arbol2Val) {
      if (arbol2Val !== 0) {
        feature.get('especie_02').evaluate(function(especie2Val) {
          feature.get('superfi_02').evaluate(function(superficie2Val) {
            if (especie2Val) c.frut.esp2.setValue('Especie 2: ' + especie2Val);
            if (arbol2Val) c.frut.arb2.setValue('N. árboles: ' + arbol2Val);
            if (superficie2Val) c.frut.sup2.setValue('Superficie: ' + superficie2Val + ' ha');
            
            c.frut.pan2.insert(0, c.frut.esp2);
            c.frut.pan2.insert(1, c.frut.arb2);
            c.frut.pan2.insert(2, c.frut.sup2);
            c.frut.dynamicPanel.insert(3, c.frut.pan2);
          });
        });
      }
    });

    // Process the third set of features (arbol3)
    feature.get('arboles_03').evaluate(function(arbol3Val) {
      if (arbol3Val !== 0) {
        feature.get('especie_03').evaluate(function(especie3Val) {
          feature.get('superfi_03').evaluate(function(superficie3Val) {
            if (especie3Val) c.frut.esp3.setValue('Especie 3: ' + especie3Val);
            if (arbol3Val) c.frut.arb3.setValue('N. árboles: ' + arbol3Val);
            if (superficie3Val) c.frut.sup3.setValue('Superficie: ' + superficie3Val + ' ha');
            
            c.frut.pan3.insert(0, c.frut.esp3);
            c.frut.pan3.insert(1, c.frut.arb3);
            c.frut.pan3.insert(2, c.frut.sup3);
            c.frut.dynamicPanel.insert(4, c.frut.pan3);
          });
        });
      }
    });

    // Process the fourth set of features (arbol4)
    feature.get('arboles_04').evaluate(function(arbol4Val) {
      if (arbol4Val !== 0) {
        feature.get('especie_04').evaluate(function(especie4Val) {
          feature.get('superfi_04').evaluate(function(superficie4Val) {
            if (especie4Val) c.frut.esp4.setValue('Especie 4: ' + especie4Val);
            if (arbol4Val) c.frut.arb4.setValue('N. árboles: ' + arbol4Val);
            if (superficie4Val) c.frut.sup4.setValue('Superficie: ' + superficie4Val + ' ha');
            
            c.frut.pan4.insert(0, c.frut.esp4);
            c.frut.pan4.insert(1, c.frut.arb4);
            c.frut.pan4.insert(2, c.frut.sup4);
            c.frut.dynamicPanel.insert(5, c.frut.pan4);
          });
        });
      }
    });

    // Finally, show the panel
    c.frut.panel.style().set('shown', true);
    c.frut.panel.style().set('position', 'bottom-left');

    // End time and execution print
    var endTime = new Date().getTime();
    var executionTime = endTime - startTime;
    print('Tiempo de ejecución funcion Cat. Frut (ms):', executionTime);
  });
};
