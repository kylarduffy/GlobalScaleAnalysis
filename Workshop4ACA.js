// Workshop 4 - Allen Coral Atlas
// Finding the ideal research station for coral sampling by snorkelling

// Global Variables
var distance = 800 // metres allowed to snorkel from the station
Map.setOptions('SATELLITE'); // set base layer as satellite imagery
Map.setCenter(0, 0, 2); // zoom out to view whole map

// Research Station Locations
Map.setCenter(113.772, -23.145, 17); // zoom to research locations
// Heron, Hamilton, Lizard, Daydream, Orpheus, Coral Bay, Sesoko (Japan), Hoga (Indo), Bailey (French Polynesia), Carrie Bow (Belize)  
Map.setCenter(0, 0, 2.5);

var field_stations = ee.FeatureCollection([Heron, Hamilton, Lizard, Daydream, Orpheus, CoralBay, Sesoko, Hoga, Bailey, CarrieBow]); // create a feature collection
print(field_stations);

// Import ACA
var aca = ee.Image("ACA/reef_habitat/v2_0");
print(aca);
//Map.addLayer(aca, {}, 'Allen Coral Atlas')

// Choosing a band image for benthic layer
var benthic = aca.select('benthic');
print(benthic);

// Build binary image
var coral = benthic.eq(15);
print(coral);

// Mask all 0 values
coral = coral.selfMask();
Map.addLayer(coral, {palette: ['ff69b4']}, 'Coral/Algae');

// Vector Operations
// Make a buffer
var buffered = ee.Feature(field_stations.first()).buffer(distance);
print(buffered);
// Map.addLayer(buffered, {color: 'orange'}, 'Heron Buffer');

// Write a function that applies a buffer
var bufferer = function (feature) {
  var buffered = feature.buffer(800)
  return buffered;
};

var bufferedStations = field_stations.map(bufferer); // .map works on feature collection
print(bufferedStations);
Map.addLayer(bufferedStations, {color: 'orange'}, 'Buffered Stations');

// ACA Operations
// Calculate area of coral within buffer
var coral_area = coral // binary 1 == coral
  .multiply(ee.Image.pixelArea()) // get the area of each pixel
  .reduceRegions({
    reducer: ee.Reducer.sum(), // sum all pixel areas together
    collection: bufferedStations,
    scale: 5
  });
  
print(coral_area, 'Coral Area');
var coral_clipped = coral.clipToCollection(bufferedStations); // visualise coral within buffers
Map.addLayer(coral_clipped, {palette: ['skyblue']}, 'Coral Within Buffers');

// Export the results
Export.table.toDrive({
  collection: coral_area, //FYI - type: featureCollection
  description: 'exportToDrive', // works on feature collections only
  fileNamePrefix: 'research_stations',
  fileFormat:'CSV'
}) 