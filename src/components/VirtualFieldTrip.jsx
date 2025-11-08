import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Camera, ArrowRight, ArrowLeft } from 'lucide-react';
import { fetchUnsplashImage, generateGeminiText } from '../utils/api';
import { forestLayers } from '../data/layerData';
import { getPresetById } from '../data/indianForestPresets';
import { parseSource } from '../utils/sourceParser';
import SourceCitation from './SourceCitation';

const VirtualFieldTrip = ({ isOpen, onClose, selectedPreset }) => {
  const preset = selectedPreset ? getPresetById(selectedPreset) : null;
  const [currentStop, setCurrentStop] = useState(0);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [source, setSource] = useState({ sourceName: null, sourceUrl: null });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (stops.length === 0) {
        generateFieldTrip();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const generateFieldTrip = async () => {
    setLoading(true);
    setSource({ sourceName: null, sourceUrl: null });
    try {
      // Build forest type context
      const forestContext = preset
        ? `\n\n**Context:** The field trip should be through ${preset.name} forests in India (${preset.location}). Include Indian species, Indian locations, and characteristics specific to ${preset.name} forests. Make all observations and learning points relevant to Indian forest ecosystems.`
        : `\n\n**Context:** The field trip should be through Indian forest ecosystems. Include Indian species, Indian locations, and characteristics of forests found in India.`;
      
      const prompt = `Create a virtual field trip through ${preset ? preset.name + ' forests in India' : 'Indian forest ecosystems'} with 5 stops, one for each layer plus an overview. For each stop, provide:
      - Stop name and layer (e.g., "Stop 1: Emergent Layer 🌲")
      - What students will observe (2-3 short sentences) - mention Indian species and locations
      - Key learning points (2-3 short sentences) - focus on Indian forest characteristics
      - One interactive question related to Indian forests
      
      Keep descriptions concise (under 100 words per stop). Write in simple, engaging language. Add 1-2 relevant emojis per stop description. Use **bold** for key terms.${forestContext}
      IMPORTANT: Always include Indian species names, Indian locations, and make it specific to Indian forest ecosystems.
      Format as JSON array: [{stop: "...", layer: "...", observation: "...", learning: "...", question: "..."}]

IMPORTANT: After the JSON array, add a source citation with URL in this exact format:
*Source: [Source Name] (https://example.com)*

Use credible sources such as:
- India State of Forest Report (https://fsi.nic.in)
- Ministry of Environment, Forest and Climate Change, India (https://moef.gov.in)
- National Geographic (https://www.nationalgeographic.com)
- World Wildlife Fund - WWF India (https://www.wwfindia.org)
- Scientific journals or research institutions

Always include a valid URL for the source.`;

      const response = await generateGeminiText(prompt);
      const parsed = parseSource(response);
      
      // Try to parse JSON, fallback to structured text
      let parsedStops;
      try {
        const jsonMatch = parsed.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedStops = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        // Fallback: create stops from layer data
        parsedStops = forestLayers.map((layer, idx) => ({
          stop: `Stop ${idx + 1}: ${layer.name}`,
          layer: layer.name,
          observation: `Explore the ${layer.name.toLowerCase()} - ${layer.position}. ${layer.conditions}`,
          learning: layer.role,
          question: `What role does the ${layer.name.toLowerCase()} play in the ecosystem?`
        }));
      }

      setStops(parsedStops);
      setSource({ sourceName: parsed.sourceName, sourceUrl: parsed.sourceUrl });

      // Load images for each stop based on its actual content
      const imagePromises = parsedStops.map((stop, idx) => {
        // Extract keywords from the stop's observation and layer name
        const layerName = stop.layer || '';
        const observation = stop.observation || '';
        
        // Build search query from layer name and key terms from observation
        let searchQuery = layerName.toLowerCase();
        
        // Add relevant keywords based on observation content
        if (observation.toLowerCase().includes('light') || observation.toLowerCase().includes('sun')) {
          searchQuery += ' sunlight';
        }
        if (observation.toLowerCase().includes('dense') || observation.toLowerCase().includes('thick')) {
          searchQuery += ' dense';
        }
        if (observation.toLowerCase().includes('sparse') || observation.toLowerCase().includes('open')) {
          searchQuery += ' open';
        }
        if (observation.toLowerCase().includes('canopy')) {
          searchQuery += ' canopy';
        }
        if (observation.toLowerCase().includes('understory')) {
          searchQuery += ' understory';
        }
        if (observation.toLowerCase().includes('floor') || observation.toLowerCase().includes('ground')) {
          searchQuery += ' forest floor';
        }
        
        // Fallback to layer-based search if needed
        if (!searchQuery || searchQuery.trim() === layerName.toLowerCase()) {
          const matchingLayer = forestLayers.find(l => 
            layerName.toLowerCase().includes(l.name.toLowerCase().split(' ')[0]) ||
            l.name.toLowerCase().includes(layerName.toLowerCase().split(' ')[0])
          );
          if (matchingLayer) {
            searchQuery = matchingLayer.imageQueries[0];
          } else {
            searchQuery = `${layerName} ${preset ? preset.name + ' forest India' : 'Indian forest'}`;
          }
        } else {
          // Add India context to search query
          searchQuery = `${searchQuery} ${preset ? preset.name + ' forest India' : 'Indian forest'}`;
        }
        
        return fetchUnsplashImage(searchQuery, 'landscape');
      });

      const loadedImages = await Promise.all(imagePromises);
      setImages(loadedImages.filter(img => img));
    } catch (error) {
      console.error('Error generating field trip:', error);
      // Fallback stops
      setStops(forestLayers.map((layer, idx) => ({
        stop: `Stop ${idx + 1}: ${layer.name}`,
        layer: layer.name,
        observation: `Discover the ${layer.name.toLowerCase()} - ${layer.position}`,
        learning: layer.role,
        question: `What makes the ${layer.name.toLowerCase()} unique?`
      })));
    } finally {
      setLoading(false);
    }
  };

  const nextStop = () => {
    if (currentStop < stops.length - 1) {
      setCurrentStop(currentStop + 1);
    }
  };

  const prevStop = () => {
    if (currentStop > 0) {
      setCurrentStop(currentStop - 1);
    }
  };

  const currentStopData = stops[currentStop];

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
              className="w-full h-full sm:h-auto sm:max-h-[calc(100vh-2rem)] md:w-[90%] md:max-w-5xl md:h-auto md:max-h-[90vh] bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            >
            <div className="sticky top-0 bg-gradient-to-r from-forest-green to-forest-light text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MapPin size={24} />
                <div>
                  <h2 className="text-xl font-bold">Virtual Field Trip</h2>
                  {preset && (
                    <p className="text-xs sm:text-sm opacity-90 mt-1 flex items-center gap-1">
                      {preset.name}
                    </p>
                  )}
                </div>
                <span className="text-sm opacity-90">
                  Stop {currentStop + 1} of {stops.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div>
                  <p className="mt-4 text-gray-600">Planning your virtual field trip...</p>
                </div>
              ) : currentStopData ? (
                <motion.div
                  key={currentStop}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6"
                >
                  {/* Image */}
                  {images[currentStop] && (
                    <motion.img
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={images[currentStop]}
                      alt={currentStopData.stop}
                      className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg mb-6"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/800x400/4a7c2a/ffffff?text=${encodeURIComponent(currentStopData.stop)}`;
                      }}
                    />
                  )}

                  {/* Stop Information */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-forest-green to-forest-light text-white p-4 rounded-lg">
                      <h3 className="text-2xl font-bold mb-2">{currentStopData.stop}</h3>
                      <p className="text-sm opacity-90">{currentStopData.layer}</p>
                    </div>

                    <div className="bg-forest-tan/30 p-5 rounded-lg">
                      <h4 className="font-semibold text-forest-green mb-2 flex items-center gap-2">
                        <Camera size={18} />
                        What You'll Observe:
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{currentStopData.observation}</p>
                    </div>

                    <div className="bg-green-50 p-5 rounded-lg border-l-4 border-forest-green">
                      <h4 className="font-semibold text-forest-green mb-2">Key Learning Points:</h4>
                      <p className="text-gray-700 leading-relaxed">{currentStopData.learning}</p>
                    </div>

                    {currentStopData.question && (
                      <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-500">
                        <h4 className="font-semibold text-yellow-800 mb-2">Think About:</h4>
                        <p className="text-yellow-900">{currentStopData.question}</p>
                      </div>
                    )}
                    
                    {/* Source Citation - show on last stop */}
                    {currentStop === stops.length - 1 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <SourceCitation sourceName={source.sourceName} sourceUrl={source.sourceUrl} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </div>

            {/* Navigation */}
            {stops.length > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevStop}
                  disabled={currentStop === 0}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Previous
                </motion.button>

                {/* Progress Dots */}
                <div className="flex gap-2">
                  {stops.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStop(idx)}
                      className={`w-3 h-3 rounded-full transition ${
                        idx === currentStop
                          ? 'bg-forest-green w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextStop}
                  disabled={currentStop === stops.length - 1}
                  className="px-6 py-3 bg-forest-green text-white rounded-lg font-semibold hover:bg-forest-light transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ArrowRight size={20} />
                </motion.button>
              </div>
            )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VirtualFieldTrip;

