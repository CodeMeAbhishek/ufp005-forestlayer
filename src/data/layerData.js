export const forestLayers = [
  {
    id: 'emergent',
    name: 'Emergent Layer',
    position: 'Tallest trees (up to 60m), above canopy',
    conditions: 'Intense sunlight, strong winds, dry air',
    species: {
      trees: ['Kapok', 'Brazil nut'],
      fauna: ['Eagles', 'Macaws', 'Butterflies', 'Bats']
    },
    role: 'Seed dispersal, primary sunlight interceptors, first responders to wind/storm stress',
    light: '95-100%',
    biodiversity: '10%',
    imageQueries: ['kapok tree rainforest', 'eagle in flight rainforest'],
    temperature: 'Warm',
    humidity: 'Low'
  },
  {
    id: 'canopy',
    name: 'Canopy',
    position: 'Continuous overlapping tree crowns (30-45m)',
    conditions: 'Blocks ~95% sunlight, defines availability below',
    species: {
      trees: ['Various broadleaf trees'],
      fauna: ['Monkeys', 'Toucans', 'Insects', 'Epiphytes']
    },
    role: 'Intercepts rainfall, regulates temp/evaporation, primary carbon absorption/photosynthesis site',
    light: '70-95%',
    biodiversity: '50%',
    imageQueries: ['dense rainforest canopy', 'toucan rainforest'],
    temperature: 'Moderate',
    humidity: 'Medium'
  },
  {
    id: 'understory',
    name: 'Understory',
    position: '10-20m',
    conditions: 'Dim light (~5-10%)',
    species: {
      trees: ['Shrubs', 'Vines', 'Saplings'],
      fauna: ['Frogs', 'Snakes', 'Leopards', 'Jaguars']
    },
    role: 'Transition zone, supports climbing species, secondary growth',
    light: '5-10%',
    biodiversity: '30%',
    imageQueries: ['jungle undergrowth', 'frog on leaf rainforest'],
    temperature: 'Cool',
    humidity: 'High'
  },
  {
    id: 'forest-floor',
    name: 'Forest Floor',
    position: 'Ground level (0-10m)',
    conditions: 'Almost dark (~2%), high humidity, thick leaf litter',
    species: {
      trees: ['Fungi', 'Mosses', 'Seedlings'],
      fauna: ['Tapirs', 'Anteaters', 'Insects', 'Worms']
    },
    role: 'Nutrient cycling, seed germination, detritivore hotspot',
    light: '1-2%',
    biodiversity: '10%',
    imageQueries: ['forest floor litter', 'anteater rainforest'],
    temperature: 'Cool',
    humidity: 'Very High'
  }
];

