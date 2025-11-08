import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TreePine, Leaf, Sun, Droplets, Thermometer, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { forestLayers } from '../data/layerData';
import { fetchUnsplashImage, generateGeminiText } from '../utils/api';
import { getPresetById } from '../data/indianForestPresets';

const LayerInfoPanel = ({ layerId, isOpen, onClose, selectedPreset }) => {
  const [images, setImages] = useState([]);
  const [funFact, setFunFact] = useState(null);
  const [loadingFact, setLoadingFact] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);

  const layer = forestLayers.find(l => l.id === layerId);
  const preset = selectedPreset ? getPresetById(selectedPreset) : null;

  useEffect(() => {
    if (isOpen && layer) {
      loadImages();
      // Clear fun fact when layer or preset changes to ensure context is correct
      setFunFact(null);
    }
  }, [isOpen, layerId, selectedPreset]);

  const loadImages = async () => {
    if (!layer) return;
    setLoadingImages(true);
    const imagePromises = layer.imageQueries.map(query => fetchUnsplashImage(query));
    const loadedImages = await Promise.all(imagePromises);
    setImages(loadedImages);
    setLoadingImages(false);
  };

  const handleFunFact = async () => {
    setLoadingFact(true);
    
    // Build context-aware prompt based on selected forest type
    const forestTypeContext = preset 
      ? `in ${preset.name} forests (Indian forest type: ${preset.description})`
      : 'in rainforests';
    
    const forestTypeDetails = preset
      ? `\n\nContext: The user is exploring ${preset.name} forests, which are characterized by: ${preset.description}. Location: ${preset.location}. Make the fact specific to this type of Indian forest, not generic rainforests.`
      : '';
    
    const fact = await generateGeminiText(`Generate a fun, engaging fact about the ${layer.name} ${forestTypeContext}. Keep it to 1-2 sentences only. Add 1-2 relevant emojis. Use **bold** for key terms.${forestTypeDetails}

IMPORTANT: At the end of your response, add a source citation with URL in this exact format:
*Source: [Source Name] (https://example.com)*

Use credible sources with their official websites such as:
- National Geographic (https://www.nationalgeographic.com)
- Smithsonian Institution (https://www.si.edu)
- World Wildlife Fund - WWF (https://www.worldwildlife.org)
- Rainforest Alliance (https://www.rainforest-alliance.org)
- National Geographic Education (https://education.nationalgeographic.org)
- India State of Forest Report (https://fsi.nic.in)
- Ministry of Environment, Forest and Climate Change, India (https://moef.gov.in)
- Scientific journals or research institutions
- Environmental organizations

Example format: "Did you know that... [fact]. *Source: National Geographic (https://www.nationalgeographic.com)*"

Always include a valid URL for the source.`);
    setFunFact(fact);
    setLoadingFact(false);
  };

  if (!layer || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
      >
        <div className="sticky top-0 bg-forest-green text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{layer.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-forest-dark rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Images */}
          <div className="space-y-3">
            {loadingImages ? (
              <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
            ) : (
              images.map((img, idx) => (
                <motion.img
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  src={img}
                  alt={`${layer.name} - Image ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/800x600/4a7c2a/ffffff?text=${encodeURIComponent(layer.name)}`;
                  }}
                />
              ))
            )}
          </div>

          {/* Position */}
          <div className="bg-forest-tan/30 p-4 rounded-lg">
            <h3 className="font-semibold text-forest-green mb-2 flex items-center gap-2">
              <TreePine size={18} /> Position
            </h3>
            <p className="text-gray-700">{layer.position}</p>
          </div>

          {/* Conditions */}
          <div className="bg-forest-tan/30 p-4 rounded-lg">
            <h3 className="font-semibold text-forest-green mb-2 flex items-center gap-2">
              <Sun size={18} /> Conditions
            </h3>
            <p className="text-gray-700">{layer.conditions}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Thermometer size={16} className="text-red-600" />
                {layer.temperature}
              </span>
              <span className="flex items-center gap-1">
                <Droplets size={16} className="text-blue-600" />
                {layer.humidity}
              </span>
            </div>
          </div>

          {/* Species */}
          <div className="bg-forest-tan/30 p-4 rounded-lg">
            <h3 className="font-semibold text-forest-green mb-2 flex items-center gap-2">
              <Leaf size={18} /> Species
            </h3>
            <div className="space-y-2">
              <div>
                <p className="font-medium text-gray-800">Trees:</p>
                <p className="text-gray-700">{layer.species.trees.join(', ')}</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">Fauna:</p>
                <p className="text-gray-700">{layer.species.fauna.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="bg-forest-tan/30 p-4 rounded-lg">
            <h3 className="font-semibold text-forest-green mb-2">Ecological Role</h3>
            <p className="text-gray-700">{layer.role}</p>
          </div>

          {/* Light & Biodiversity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Light Availability</p>
              <p className="font-bold text-yellow-700">{layer.light}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Biodiversity</p>
              <p className="font-bold text-green-700">{layer.biodiversity}</p>
            </div>
          </div>

          {/* Fun Fact */}
          <div className="bg-gradient-to-r from-forest-green to-forest-light p-4 rounded-lg text-white">
            <button
              onClick={handleFunFact}
              disabled={loadingFact}
              className="w-full py-2 px-4 bg-white text-forest-green rounded font-semibold hover:bg-gray-100 transition disabled:opacity-50"
            >
              {loadingFact ? 'Generating...' : funFact ? 'Generate Another Fact' : 'Generate Fun Fact'}
            </button>
            {funFact && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm"
              >
                <div className="space-y-1">
                  {(() => {
                    // Extract source citation with URL if present
                    // Match format: *Source: Name (https://url.com)*
                    const sourceMatch = funFact.match(/\*Source:\s*([^(]+)\s*\(([^)]+)\)\*/);
                    const factText = sourceMatch ? funFact.replace(/\*Source:.*/, '').trim() : funFact;
                    const sourceName = sourceMatch ? sourceMatch[1].trim() : null;
                    const sourceUrl = sourceMatch ? sourceMatch[2].trim() : null;
                    
                    // Fallback: if no URL format, try simple format
                    if (!sourceMatch) {
                      const simpleMatch = funFact.match(/\*Source:\s*([^*]+)\*/);
                      if (simpleMatch) {
                        const simpleSource = simpleMatch[1].trim();
                        return (
                          <>
                            <ReactMarkdown 
                              components={{
                                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-yellow-700" {...props} />
                              }}
                            >
                              {funFact.replace(/\*Source:.*/, '').trim()}
                            </ReactMarkdown>
                            <p className="text-xs opacity-80 italic mt-2 text-white/90 border-t border-white/20 pt-2">
                              Source: {simpleSource}
                            </p>
                          </>
                        );
                      }
                    }
                    
                    return (
                      <>
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}) => <p className="mb-2" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-yellow-700" {...props} />
                          }}
                        >
                          {factText}
                        </ReactMarkdown>
                        {sourceName && (
                          <div className="text-xs opacity-80 italic mt-2 text-white/90 border-t border-white/20 pt-2">
                            <span>Source: </span>
                            {sourceUrl ? (
                              <a
                                href={sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-yellow-200 transition-colors inline-flex items-center gap-1"
                              >
                                {sourceName}
                                <ExternalLink size={12} className="inline" />
                              </a>
                            ) : (
                              <span>{sourceName}</span>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LayerInfoPanel;

