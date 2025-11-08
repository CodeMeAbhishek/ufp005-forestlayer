import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Zap, TrendingUp, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchUnsplashImage, generateGeminiText } from '../utils/api';
import { getPresetById } from '../data/indianForestPresets';
import { parseSource } from '../utils/sourceParser';
import SourceCitation from './SourceCitation';

const ForestSimulator = ({ isOpen, onClose, controls, selectedPreset }) => {
  const [prediction, setPrediction] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [source, setSource] = useState({ sourceName: null, sourceUrl: null });
  
  const preset = selectedPreset ? getPresetById(selectedPreset) : null;

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

  const generatePrediction = async () => {
    setLoading(true);
    setLoadingImages(true);
    setPrediction(null);
    setImages([]);
    setSource({ sourceName: null, sourceUrl: null });

    try {
      // Create description of current forest state based on controls
      const forestState = {
        canopyCover: controls.canopyCover,
        lai: controls.lai || controls.LAI,
        solarIntensity: controls.lightPenetration || controls.solarIntensity,
        sunAngle: controls.sunAngle,
        canopyGaps: controls.canopyGaps
      };

      // Determine forest characteristics
      const isDense = forestState.canopyCover >= 70;
      const isSparse = forestState.canopyCover <= 40;
      const isDenseUnderstory = forestState.lai >= 5;
      const isBright = forestState.solarIntensity >= 70;
      const isGapRich = forestState.canopyGaps >= 10;
      
      // Build descriptive keywords for image search - India-specific based on preset
      let searchKeywords = [];
      
      if (preset && preset.visualImageQueries && preset.visualImageQueries.length > 0) {
        // Use preset-specific image queries
        searchKeywords = preset.visualImageQueries.slice(0, 3);
      } else {
        // Fallback to generic India forest searches
        if (isDense && isDenseUnderstory) {
          searchKeywords = ['dense Indian forest', 'tropical evergreen forest India', 'Western Ghats forest'];
        } else if (isSparse) {
          searchKeywords = ['dry deciduous forest India', 'open forest India', 'Deccan Plateau forest'];
        } else if (isGapRich) {
          searchKeywords = ['forest gap India', 'sunlit forest India', 'forest clearing India'];
        } else {
          searchKeywords = ['Indian forest ecosystem', 'tropical forest India', 'forest layers India'];
        }
      }

      // Build forest type context for prompt
      const forestTypeContext = preset
        ? `\n\n**Forest Type Context:**\n- Type: ${preset.name} (${preset.shortName})\n- Description: ${preset.description}\n- Location: ${preset.location}\n- Characteristics: ${preset.characteristics ? Object.entries(preset.characteristics).map(([k, v]) => `${k}: ${v}`).join(', ') : 'N/A'}\n\nIMPORTANT: Make all descriptions specific to ${preset.name} forests in India, not generic rainforests. Reference Indian locations, Indian species, and Indian forest characteristics.`
        : '\n\nIMPORTANT: Focus on Indian forest ecosystems. Reference Indian locations, Indian species, and characteristics of forests found in India.';

      // Generate AI prediction based on controls and preset
      const prompt = `Based on these Indian forest model parameters, describe what the ${preset ? preset.name : 'Indian forest'} ecosystem would look like:
      
      **Model Parameters:**
      - Canopy Cover: ${forestState.canopyCover}% ${isDense ? '(very dense)' : isSparse ? '(sparse)' : '(moderate)'}
      - Leaf Area Index (LAI): ${forestState.lai} ${isDenseUnderstory ? '(dense vegetation)' : '(moderate vegetation)'}
      - Solar Intensity: ${forestState.solarIntensity}% ${isBright ? '(bright sunlight)' : '(moderate light)'}
      - Sun Angle: ${forestState.sunAngle}° ${forestState.sunAngle > 60 ? '(overhead sun)' : forestState.sunAngle < 30 ? '(low angle)' : '(mid-day sun)'}
      - Canopy Gaps: ${forestState.canopyGaps}% ${isGapRich ? '(many gaps)' : '(few gaps)'}${forestTypeContext}
      
      Describe:
      1. **Overall Appearance** (2-3 sentences) - Describe the visual characteristics of this Indian forest type 🌳
      2. **Light Conditions** - how light reaches each layer in this specific forest type (2-3 sentences) ☀️
      3. **Vegetation Density** - what Indian plant species thrive in this environment (2-3 sentences) 🌿
      4. **Wildlife Habitat** - what Indian animals would be found here (2-3 sentences) 🦋
      5. **Ecological Conditions** - temperature, humidity, microclimate specific to this Indian forest type (2-3 sentences) 🌡️
      
      Keep total response under 350 words. Use **bold** for key terms. Add 2-4 relevant emojis naturally throughout. Make the description vivid, scientifically accurate, and specifically about Indian forests. Mention Indian locations, species names, and regional characteristics where relevant.

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

      const predictionText = await generateGeminiText(prompt);
      const parsed = parseSource(predictionText);
      setPrediction(parsed.content);
      setSource({ sourceName: parsed.sourceName, sourceUrl: parsed.sourceUrl });

      // Fetch relevant images based on the forest state and preset
      const imagePromises = searchKeywords.map(keyword => 
        fetchUnsplashImage(keyword, 'landscape')
      );
      
      const loadedImages = await Promise.all(imagePromises);
      setImages(loadedImages.filter(img => img));
      
    } catch (error) {
      console.error('Error generating prediction:', error);
      setPrediction('Unable to generate prediction. Please try again.');
    } finally {
      setLoading(false);
      setLoadingImages(false);
    }
  };

  // Auto-generate when controls or preset change and modal is open
  useEffect(() => {
    if (isOpen && controls) {
      const timer = setTimeout(() => {
        generatePrediction();
      }, 500); // Small delay to avoid too frequent updates
      return () => clearTimeout(timer);
    }
  }, [isOpen, controls?.canopyCover, controls?.lai, controls?.lightPenetration, controls?.sunAngle, controls?.canopyGaps, selectedPreset]);

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
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-forest-green to-forest-light text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Eye size={20} className="sm:w-6 sm:h-6" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">Forest Simulator</h2>
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Current Parameters */}
                <div className="bg-gradient-to-r from-forest-green/10 to-green-50 p-4 rounded-lg border border-forest-green/20">
                  <h3 className="font-bold text-forest-green mb-3 flex items-center gap-2">
                    <Zap size={18} /> Current Model Parameters
                  </h3>
                  {preset && (
                    <div className="mb-3 p-2 bg-forest-green/20 rounded border border-forest-green/30">
                      <p className="text-sm font-semibold text-forest-green">{preset.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{preset.description}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin size={10} />
                        {preset.location}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Canopy Cover:</span>
                      <span className="font-semibold ml-2">{controls?.canopyCover || 0}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Leaf Area Index:</span>
                      <span className="font-semibold ml-2">{controls?.lai?.toFixed(1) || controls?.LAI || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Solar Intensity:</span>
                      <span className="font-semibold ml-2">{controls?.lightPenetration || controls?.solarIntensity || 0}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Sun Angle:</span>
                      <span className="font-semibold ml-2">{controls?.sunAngle || 0}°</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Canopy Gaps:</span>
                      <span className="font-semibold ml-2">{controls?.canopyGaps || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Regenerate Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generatePrediction}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-forest-green to-forest-light text-white rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <TrendingUp size={20} />
                  {loading ? 'Analyzing Forest Conditions...' : 'Regenerate Prediction'}
                </motion.button>

                {/* Loading State */}
                <AnimatePresence>
                  {(loading || loadingImages) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div>
                      <p className="mt-4 text-gray-600">
                        {loadingImages ? 'Fetching relevant images...' : 'Generating forest prediction...'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Images Gallery */}
                {images.length > 0 && !loadingImages && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {images.map((img, idx) => (
                      <motion.img
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        src={img}
                        alt={`Forest simulation ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(img, '_blank')}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Prediction Text */}
                {prediction && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-forest-tan/30 to-green-50 p-6 rounded-lg border border-forest-green/20"
                  >
                    <h3 className="text-xl font-bold text-forest-green mb-4 flex items-center gap-2">
                      <Eye size={24} /> Forest Simulation Prediction
                    </h3>
                    <div className="prose max-w-none text-gray-800 leading-relaxed">
                      <ReactMarkdown 
                        components={{
                          p: ({node, ...props}) => <p className="mb-3" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-forest-green" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold text-forest-green mt-4 mb-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-base font-bold text-forest-green mt-4 mb-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-3" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />
                        }}
                      >
                        {prediction}
                      </ReactMarkdown>
                      <SourceCitation sourceName={source.sourceName} sourceUrl={source.sourceUrl} />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ForestSimulator;

