import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Image as ImageIcon, BookOpen, Sparkles, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchUnsplashImage, generateGeminiText } from '../utils/api';
import { getPresetById } from '../data/indianForestPresets';
import { parseSource } from '../utils/sourceParser';
import SourceCitation from './SourceCitation';

const SpeciesExplorer = ({ isOpen, onClose, selectedPreset }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesData, setSpeciesData] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [source, setSource] = useState({ sourceName: null, sourceUrl: null });
  
  const preset = selectedPreset ? getPresetById(selectedPreset) : null;
  
  // Get example species suggestions based on preset
  const getExampleSpecies = () => {
    if (!preset) {
      return ['Indian elephant', 'Bengal tiger', 'Indian banyan tree', 'peacock'];
    }
    
    // Species examples based on forest type
    const speciesExamples = {
      'tropical-wet-evergreen': ['Malabar giant squirrel', 'lion-tailed macaque', 'rosewood tree', 'king cobra'],
      'tropical-semi-evergreen': ['Indian gaur', 'slender loris', 'teak tree', 'Indian hornbill'],
      'tropical-moist-deciduous': ['spotted deer', 'Indian bison', 'sal tree', 'Indian peafowl'],
      'tropical-dry-deciduous': ['Indian wolf', 'blackbuck', 'teak tree', 'Indian roller'],
      'tropical-thorn': ['Indian gazelle', 'desert fox', 'babul tree', 'Indian vulture'],
      'montane': ['Himalayan tahr', 'red panda', 'deodar tree', 'Himalayan monal']
    };
    
    return speciesExamples[preset.id] || ['Indian elephant', 'Bengal tiger', 'Indian banyan tree', 'peacock'];
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setLoadingImages(true);
    setSpeciesData(null);
    setImages([]);
    setSource({ sourceName: null, sourceUrl: null });

    try {
      // Build forest type context for prompt
      const forestTypeContext = preset
        ? `\n\n**Context:** The user is exploring ${preset.name} forests in India (${preset.location}). Focus on how ${searchQuery} relates to this specific Indian forest type. Mention Indian locations, regional characteristics, and how this species is found in ${preset.name} forests specifically.`
        : '\n\n**Context:** Focus on Indian forest ecosystems. Mention Indian locations, regional characteristics, and how this species is found in Indian forests.';
      
      // Use Gemini to generate concise, readable species information
      const prompt = `Provide a brief, clear description about ${searchQuery} in ${preset ? preset.name + ' forests in India' : 'Indian forest ecosystems'}. Include:
      - Scientific name (one line) 🌿
      - Habitat in ${preset ? preset.name + ' forests' : 'Indian forests'} (2-3 sentences) 🏞️
      - Physical characteristics (2-3 sentences) 🦋
      - Ecological role in ${preset ? 'this Indian forest type' : 'Indian forest ecosystems'} (2-3 sentences) 🌳
      - One interesting fact about this species in India 💡${forestTypeContext}
      
      Keep total response under 250 words. Write in simple, readable English. 
      Use **bold** for key terms. Add relevant emojis naturally throughout the text to make it engaging.
      IMPORTANT: Make all information specific to Indian forests and mention Indian locations/regions where relevant.

IMPORTANT: At the end of your response, add a source citation with URL in this exact format:
*Source: [Source Name] (https://example.com)*

Use credible sources such as:
- India State of Forest Report (https://fsi.nic.in)
- Ministry of Environment, Forest and Climate Change, India (https://moef.gov.in)
- National Geographic (https://www.nationalgeographic.com)
- World Wildlife Fund - WWF India (https://www.wwfindia.org)
- Scientific journals or research institutions
- Environmental organizations

Always include a valid URL for the source.`;
      
      const speciesInfo = await generateGeminiText(prompt);
      const parsed = parseSource(speciesInfo);
      
      // Fetch images from Unsplash - India-specific searches
      const imagePromises = preset
        ? [
            fetchUnsplashImage(`${searchQuery} ${preset.name} forest India`, 'landscape'),
            fetchUnsplashImage(`${searchQuery} India ${preset.location.split(',')[0]}`, 'portrait'),
            fetchUnsplashImage(`${searchQuery} Indian forest`, 'landscape')
          ]
        : [
            fetchUnsplashImage(`${searchQuery} Indian forest`, 'landscape'),
            fetchUnsplashImage(`${searchQuery} India`, 'portrait'),
            fetchUnsplashImage(`${searchQuery} forest India`, 'landscape')
          ];
      
      const loadedImages = await Promise.all(imagePromises);
      setImages(loadedImages.filter(img => img));
      
      // Store the parsed content
      setSpeciesData({
        name: searchQuery,
        description: parsed.content
      });
      setSource({ sourceName: parsed.sourceName, sourceUrl: parsed.sourceUrl });
    } catch (error) {
      console.error('Error searching species:', error);
      setSpeciesData({
        name: searchQuery,
        description: `Learn about ${searchQuery} in rainforest ecosystems! This species plays an important role in maintaining forest biodiversity and ecosystem balance.`
      });
    } finally {
      setLoading(false);
      setLoadingImages(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
          />
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full sm:h-auto sm:max-h-[calc(100vh-2rem)] md:w-[90%] md:max-w-4xl md:h-auto md:max-h-[90vh] bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            >
            <div className="sticky top-0 bg-gradient-to-r from-forest-green to-forest-light text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <Search size={20} className="sm:w-6 sm:h-6" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Species Explorer</h2>
                  {preset && (
                    <p className="text-xs sm:text-sm opacity-90 mt-1 flex items-center gap-1">
                      <MapPin size={12} />
                      {preset.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for species..."
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-forest-green text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-forest-light transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 min-w-[100px] sm:min-w-auto"
                  >
                    <Sparkles size={18} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{loading ? 'Exploring...' : 'Explore'}</span>
                    <span className="sm:hidden">{loading ? '...' : 'Go'}</span>
                  </motion.button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Powered by Gemini AI & Unsplash - Discover {preset ? preset.name.toLowerCase() : 'Indian forest'} species with AI-generated insights and real photos
                </p>
              </div>

              {/* Results */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div>
                    <p className="mt-4 text-gray-600">Analyzing species with AI...</p>
                  </motion.div>
                )}

                {speciesData && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Images Gallery */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {images.map((img, idx) => (
                          <motion.img
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            src={img}
                            alt={`${speciesData.name} - ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(img, '_blank')}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Species Information */}
                    <div className="bg-gradient-to-br from-forest-tan/30 to-green-50 p-6 rounded-lg border border-forest-green/20">
                      <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="text-forest-green" size={24} />
                        <h3 className="text-2xl font-bold text-forest-green">{speciesData.name}</h3>
                      </div>
                      <div className="prose max-w-none text-gray-700 leading-relaxed">
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}) => <p className="mb-3" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-forest-green" {...props} />,
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-3" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-3" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-forest-green font-bold text-2xl mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-forest-green font-bold text-xl mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-forest-green font-bold text-lg mb-2" {...props} />
                          }}
                        >
                          {speciesData.description}
                        </ReactMarkdown>
                        <SourceCitation sourceName={source.sourceName} sourceUrl={source.sourceUrl} />
                      </div>
                    </div>

                    {/* Additional Actions */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSearch}
                        className="flex-1 px-4 py-2 bg-forest-green text-white rounded-lg font-semibold hover:bg-forest-light transition"
                      >
                        Learn More
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const newQuery = `related to ${speciesData.name}`;
                          setSearchQuery(newQuery);
                          setTimeout(() => handleSearch(), 100);
                        }}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                      >
                        Explore Related
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {!speciesData && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-gray-500"
                  >
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Search for any {preset ? preset.name.toLowerCase() : 'Indian forest'} species to begin</p>
                    <p className="text-sm mt-2">
                      Try: {getExampleSpecies().map((species, idx) => (
                        <span key={idx}>
                          "{species}"{idx < getExampleSpecies().length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SpeciesExplorer;

