// MB5370 - Global Scale Analysis
// Assignment: Mapping the world's deep ocean ecosystems
// Author: Kylar Duffy

// Configure the map
var snazzy = require('users/aazuspan/snazzy:styles');
snazzy.addStyle('https://snazzymaps.com/style/8150/blue-essence-no-label', 'theme');
Map.setCenter(0, 0, 2);

// Import ETOPO1
var etopo = ee.Image("NOAA/NGDC/ETOPO1");
print('ETOPO1 dataset:',etopo);

// Select bedrock band
var bedrock = etopo.select('bedrock');
print('Bedrock:', bedrock);

// Mask land
var bedrock = bedrock.updateMask(bedrock.lt(0));
print('Bedrock:', bedrock);

// Set bathymetry visualisation
var bedrockVis = {
  max:0,
  palette: [
    '081d58', 
    '253494', 
    '225ea8',
    '41b6c4', 
    'c7e9b4'], min: -11000
};

// Add bathymetry to the map
Map.addLayer(bedrock, bedrockVis, 'Bedrock');

// Create hadal trenches and troughs
var hadal = bedrock.lt(-6000).selfMask();
print('Hadal trenches and troughs:', hadal);

Map.addLayer(hadal, {palette: ['8e44ad'], min: 0, max: 1}, 'Hadal trenches and troughs');

// Abyssal plains
var abyssal = bedrock.lt(-3000)
    .and(bedrock.gte(-6000))
    .selfMask();
print('Abyssal plains:', abyssal);

Map.addLayer(abyssal, {palette: ['225ea8'], min:0, max: 1}, 'Abyssal plains');

// Continental and island slopes
var continentalSlope = bedrock.lte(-250)
    .and(bedrock.gte(-3000))
    .selfMask();
print('Continental and island slopes:', continentalSlope);

Map.addLayer(continentalSlope, {palette: ['2ec4b6'], min: 0, max: 1}, 'Continental and island slopes');

// Calculate terrain products from the bedrock elevation
var terrain = ee.Terrain.products(bedrock);
print('Terrain products:', terrain);

// Select slope band
var slope = terrain.select('slope');
print('Seafloor slope:', slope);

// Submarine canyons (depth >200 m and slope >6 degrees)
var submarineCanyons = bedrock.lt(-200)
    .and(slope.gt(6))
    .selfMask();
print('Submarine canyons:', submarineCanyons);

Map.addLayer(submarineCanyons, {palette: ['f4a261'], min: 0, max: 1}, 'Submarine canyons');

// Import global hydrothermal vents
var hydrothermalVents = ee.FeatureCollection('projects/mb5370-globalscaleanalysis/assets/hydrothermal_vents');
print('Hydrothermal vents:', hydrothermalVents);

// Inspect the data
print(hydrothermalVents.first());
print('Number of vent fields:', hydrothermalVents.size());

// Add hydrothermal vents to the map
Map.addLayer(hydrothermalVents, {color: 'fcf4a3', min: 0, max: 1}, 'Hydrothermal vents');

// Create map title
var title = ui.Label({
  value: 'Global Deep Ocean Ecosystems',
  style: {
    fontSize: '24px',
    fontWeight: 'bold'
  }
});

// Add title
Map.add(title)

// Create legend
var legend = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '10px',
    width: '280px'
   }
});

legend.add(ui.Label({
  value: 'Deep Ocean Ecosystems',
  style: {
    fontWeight: 'bold',
    fontSize: '16px'
  }
}));

function addLegendRow(color, description) {
  var colorBox = ui.Label({
    value: '',
    style: {
      backgroundColor: '#' + color,
      padding: '8px',
      margin: '0 8px 4px 0'
    }
  });

var label = ui.Label({
  value: description,
  style: {
    margin: '0 0 4px 0',
    fontSize: '12px'
  }
});

var row = ui.Panel({
  widgets: [colorBox, label],
  layout: ui.Panel.Layout.Flow('horizontal')
});

legend.add(row);
}

// Add legend entries
addLegendRow('8e44ad', 'Hadal trenches and troughs (>6000 m)');
addLegendRow('225ea8', 'Abyssal plains (3000-6000 m)');
addLegendRow('2ec4b6', 'Continental and island slopes (250-3000 m)');
addLegendRow('f4a261', 'Submarine canyons (>200 m, slope >6°)');
addLegendRow('fcf4a3', 'Hydrothermal vent fields');

// Add legend to map
Map.add(legend); 