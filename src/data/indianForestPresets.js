// Indian Forest Types Presets
// Based on India's forest classification system

export const indianForestPresets = [
  {
    id: 'tropical-wet-evergreen',
    name: 'Tropical Wet Evergreen',
    shortName: 'Wet Evergreen',
    description: 'Dense, multilayered canopy with high rainfall (200-300 cm/year)',
    location: 'Western Ghats, Northeastern states, Andaman & Nicobar',
    detailedDescription: `Tropical Wet Evergreen forests are characterized by their extremely dense, multilayered canopy structure. These forests receive very high annual rainfall (200-300 cm), creating a humid, lush environment.

**Visual Characteristics:**
- Very tall trees (up to 60m) with dense, overlapping canopies
- High canopy cover (90%) creating deep shade below
- Rich, dark green foliage throughout all layers
- Moderate understory vegetation due to limited light penetration
- Thick leaf litter on the forest floor

**Ecological Features:**
- Highest biodiversity among Indian forests
- Trees remain green year-round (evergreen)
- High humidity and stable temperatures
- Complex vertical stratification with distinct layers
- Home to many endemic species`,
    canopyCover: 90,
    lai: 7.5,
    lightPenetration: 60,
    sunAngle: 75,
    canopyGaps: 3,
    treeTypes: ['tall', 'very-tall', 'dense'],
    colors: {
      trunk: '#4A3728',
      canopy: '#1A5F1A',
      understory: '#2D5016',
      floor: '#3D5F1F'
    },
    characteristics: {
      treeHeight: 'very-tall',
      density: 'very-dense',
      understory: 'moderate',
      biodiversity: 'very-high'
    },
    sources: [
      {
        name: 'ClearIAS - Types of Forests in India',
        url: 'https://www.clearias.com/types-of-forests/'
      },
      {
        name: 'Ministry of Environment, Forest and Climate Change, India',
        url: 'https://moef.gov.in/'
      }
    ],
    visualImageQueries: [
      'dense tropical evergreen forest India Western Ghats',
      'tall rainforest trees multilayered canopy India'
    ]
  },
  {
    id: 'tropical-semi-evergreen',
    name: 'Tropical Semi-Evergreen',
    shortName: 'Semi-Evergreen',
    description: 'Mix of evergreen and deciduous species, intermediate rainfall (150-250 cm/year)',
    location: 'Western Ghats, Odisha, Andaman & Nicobar',
    detailedDescription: `Tropical Semi-Evergreen forests represent a transition zone between evergreen and deciduous forests. They feature a mix of tree species, some retaining leaves year-round while others shed seasonally.

**Visual Characteristics:**
- Tall trees with moderately dense canopy (75% cover)
- Mix of dark green (evergreen) and seasonal foliage
- More light penetration than wet evergreen forests
- Moderate understory growth
- Varied canopy structure with some gaps

**Ecological Features:**
- Intermediate rainfall (150-250 cm/year)
- Combination of evergreen and deciduous species
- High biodiversity with transitional species
- Seasonal variation in canopy density
- Supports both tropical and subtropical species`,
    canopyCover: 75,
    lai: 6.0,
    lightPenetration: 65,
    sunAngle: 70,
    canopyGaps: 5,
    treeTypes: ['tall', 'medium', 'mixed'],
    colors: {
      trunk: '#5D4E37',
      canopy: '#2D5016',
      understory: '#3D5F1F',
      floor: '#4A6741'
    },
    characteristics: {
      treeHeight: 'tall',
      density: 'dense',
      understory: 'moderate',
      biodiversity: 'high'
    },
    sources: [
      {
        name: 'ClearIAS - Types of Forests in India',
        url: 'https://www.clearias.com/types-of-forests/'
      },
      {
        name: 'India State of Forest Report (ISFR)',
        url: 'https://fsi.nic.in/isfr-2021'
      }
    ],
    visualImageQueries: [
      'semi evergreen forest India mixed species',
      'tropical forest canopy gaps light penetration'
    ]
  },
  {
    id: 'tropical-moist-deciduous',
    name: 'Tropical Moist Deciduous',
    shortName: 'Moist Deciduous',
    description: 'Most extensive forest type, moderate rainfall (100-200 cm/year), trees shed leaves in dry season',
    location: 'Eastern India, Himalayan foothills, Central India',
    detailedDescription: `Tropical Moist Deciduous forests are the most extensive forest type in India. These forests experience seasonal changes, with trees shedding leaves during the dry season and regrowing them during monsoon.

**Visual Characteristics:**
- Medium to tall trees with moderate canopy density (65% cover)
- Seasonal leaf shedding creates varying canopy appearance
- More open structure allows greater light penetration
- Dense understory vegetation thrives with increased sunlight
- Lighter green tones compared to evergreen forests

**Ecological Features:**
- Moderate rainfall (100-200 cm/year) with distinct wet and dry seasons
- Trees shed leaves in dry season to conserve water
- High biodiversity with many commercially valuable species (teak, sal)
- Supports diverse wildlife including large mammals
- Most extensive forest type covering large areas of India`,
    canopyCover: 65,
    lai: 5.0,
    lightPenetration: 70,
    sunAngle: 65,
    canopyGaps: 8,
    treeTypes: ['medium', 'tall', 'sparse'],
    colors: {
      trunk: '#6B4423',
      canopy: '#3D5F1F',
      understory: '#4A6741',
      floor: '#556B2F'
    },
    characteristics: {
      treeHeight: 'medium-tall',
      density: 'moderate',
      understory: 'dense',
      biodiversity: 'high'
    },
    sources: [
      {
        name: 'ClearIAS - Types of Forests in India',
        url: 'https://www.clearias.com/types-of-forests/'
      },
      {
        name: 'Jagran Josh - Types of Forests in India',
        url: 'https://www.jagranjosh.com/general-knowledge/types-of-forests-in-india-1440149324-1'
      }
    ],
    visualImageQueries: [
      'teak sal forest India deciduous monsoon',
      'moist deciduous forest understory dense vegetation'
    ]
  },
  {
    id: 'tropical-dry-deciduous',
    name: 'Tropical Dry Deciduous',
    shortName: 'Dry Deciduous',
    description: 'Open canopy, lower rainfall (50-100 cm/year), seasonal leaf shedding',
    location: 'Deccan Plateau, Gangetic plains',
    detailedDescription: `Tropical Dry Deciduous forests have an open, sparse canopy structure adapted to lower rainfall conditions. These forests experience significant seasonal variation.

**Visual Characteristics:**
- Open canopy with only 45% cover, allowing abundant sunlight
- Medium-height trees with sparse distribution
- Light green to yellowish foliage, especially in dry season
- Sparse understory with drought-resistant plants
- More visible ground with less leaf litter

**Ecological Features:**
- Lower rainfall (50-100 cm/year) with long dry seasons
- Trees shed leaves for extended periods to conserve water
- Adapted to semi-arid conditions
- Moderate biodiversity with drought-tolerant species
- Important for grazing and supports various wildlife`,
    canopyCover: 45,
    lai: 3.5,
    lightPenetration: 80,
    sunAngle: 60,
    canopyGaps: 12,
    treeTypes: ['medium', 'short', 'sparse'],
    colors: {
      trunk: '#8B6F47',
      canopy: '#556B2F',
      understory: '#6B8E23',
      floor: '#8FBC8F'
    },
    characteristics: {
      treeHeight: 'medium',
      density: 'sparse',
      understory: 'sparse',
      biodiversity: 'moderate'
    },
    sources: [
      {
        name: 'Wikipedia - Central Deccan Plateau Dry Deciduous Forests',
        url: 'https://en.wikipedia.org/wiki/Central_Deccan_Plateau_dry_deciduous_forests'
      },
      {
        name: 'ClearIAS - Types of Forests in India',
        url: 'https://www.clearias.com/types-of-forests/'
      }
    ],
    visualImageQueries: [
      'dry deciduous forest India open canopy sparse',
      'Deccan Plateau forest seasonal leaf shedding'
    ]
  },
  {
    id: 'tropical-thorn',
    name: 'Tropical Thorn Forests',
    shortName: 'Thorn Forests',
    description: 'Sparse vegetation adapted to drought, rainfall less than 50 cm/year',
    location: 'Rajasthan, Gujarat, Haryana, Punjab',
    detailedDescription: `Tropical Thorn Forests are characterized by extremely sparse vegetation adapted to arid and semi-arid conditions. These are the driest forest ecosystems in India.

**Visual Characteristics:**
- Very sparse canopy with only 25% cover
- Short, stunted trees with thorny branches
- Light brown to tan colored vegetation
- Minimal understory - mostly bare ground
- Wide spacing between trees with abundant sunlight

**Ecological Features:**
- Very low rainfall (less than 50 cm/year)
- Extreme drought adaptation with water-conserving features
- Thorny plants to deter herbivores
- Low to moderate biodiversity
- Adapted to high temperatures and water scarcity
- Important for desert ecosystems and grazing`,
    canopyCover: 25,
    lai: 1.5,
    lightPenetration: 95,
    sunAngle: 55,
    canopyGaps: 15,
    treeTypes: ['short', 'sparse', 'thorny'],
    colors: {
      trunk: '#A0826D',
      canopy: '#8B7355',
      understory: '#9C8B7A',
      floor: '#D2B48C'
    },
    characteristics: {
      treeHeight: 'short',
      density: 'very-sparse',
      understory: 'very-sparse',
      biodiversity: 'low-moderate'
    },
    sources: [
      {
        name: 'ClearIAS - Types of Forests in India',
        url: 'https://www.clearias.com/types-of-forests/'
      },
      {
        name: 'India State of Forest Report (ISFR)',
        url: 'https://fsi.nic.in/isfr-2021'
      }
    ],
    visualImageQueries: [
      'thorn forest Rajasthan sparse vegetation desert',
      'arid forest India drought adapted trees'
    ]
  },
  {
    id: 'montane',
    name: 'Montane Forests',
    shortName: 'Montane',
    description: 'Diverse vertical stratification, varied with altitude, high moisture',
    location: 'Himalayas, Nilgiris',
    detailedDescription: `Montane Forests are found at higher elevations and show diverse characteristics that vary with altitude. These forests experience cooler temperatures and high moisture levels.

**Visual Characteristics:**
- Tall trees with moderate to dense canopy (70% cover)
- Mix of coniferous (pine, fir) and broadleaf species
- Dark green, often bluish-green coniferous foliage
- Moderate understory with mosses and ferns
- Distinct vertical stratification based on elevation

**Ecological Features:**
- High altitude locations (Himalayas, Nilgiris)
- Cooler temperatures and high moisture/humidity
- Diverse species composition varying with elevation
- High biodiversity with many endemic species
- Important for water catchment and climate regulation
- Supports unique alpine and subalpine ecosystems`,
    canopyCover: 70,
    lai: 5.5,
    lightPenetration: 65,
    sunAngle: 50,
    canopyGaps: 6,
    treeTypes: ['tall', 'coniferous', 'mixed'],
    colors: {
      trunk: '#5D4E37',
      canopy: '#2F5233',
      understory: '#3D5A3D',
      floor: '#4A6741'
    },
    characteristics: {
      treeHeight: 'tall',
      density: 'moderate-dense',
      understory: 'moderate',
      biodiversity: 'high'
    },
    sources: [
      {
        name: 'Wikipedia - Shola Forests',
        url: 'https://en.wikipedia.org/wiki/Shola'
      },
      {
        name: 'India State of Forest Report (ISFR)',
        url: 'https://fsi.nic.in/isfr-2021'
      }
    ],
    visualImageQueries: [
      'montane forest Himalayas coniferous pine',
      'mountain forest Nilgiris elevation mosses ferns'
    ]
  }
];

// Helper function to get preset by ID
export const getPresetById = (id) => {
  return indianForestPresets.find(preset => preset.id === id) || null;
};

// Helper function to get default preset
export const getDefaultPreset = () => {
  return indianForestPresets[0]; // Tropical Wet Evergreen
};

