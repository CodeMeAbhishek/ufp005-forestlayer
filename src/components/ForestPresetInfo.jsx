import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Droplets, Sun, TreePine, Leaf, ExternalLink, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getPresetById } from '../data/indianForestPresets';
import { fetchUnsplashImages } from '../utils/api';

const ForestPresetInfo = ({ isOpen, onClose, presetId }) => {
  const preset = presetId ? getPresetById(presetId) : null;
  const [visualImages, setVisualImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (isOpen && preset && preset.visualImageQueries) {
      setLoadingImages(true);
      setVisualImages([]);
      
      // Fetch 2 images for visual characteristics
      fetchUnsplashImages(preset.visualImageQueries, 'landscape', 2)
        .then(images => {
          setVisualImages(images);
          setLoadingImages(false);
        })
        .catch(error => {
          console.error('Error fetching visual images:', error);
          setVisualImages([]);
          setLoadingImages(false);
        });
    } else {
      setVisualImages([]);
      setLoadingImages(false);
    }
  }, [isOpen, presetId, preset]);

  if (!preset) return null;

  return (
    <AnimatePresence>
      {isOpen && preset && (
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
              className="w-full h-full sm:h-auto sm:max-h-[calc(100vh-2rem)] md:w-[90%] md:max-w-3xl md:h-auto md:max-h-[90vh] bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-forest-green to-forest-light text-white p-4 sm:p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <TreePine size={24} className="sm:w-6 sm:h-6" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">{preset.name}</h2>
                    <p className="text-xs sm:text-sm opacity-90 mt-1">{preset.shortName}</p>
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
                {/* Location */}
                <div className="bg-gradient-to-r from-forest-green/10 to-green-50 p-4 rounded-lg border border-forest-green/20">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-forest-green mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-forest-green mb-1">Geographic Location</h3>
                      <p className="text-sm text-gray-700">{preset.location}</p>
                    </div>
                  </div>
                </div>

                {/* Model Parameters */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Sun size={18} />
                    Model Parameters (Visualization Settings)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div className="bg-white p-2 rounded border">
                      <div className="text-gray-600 text-xs">Canopy Cover</div>
                      <div className="font-bold text-forest-green">{preset.canopyCover}%</div>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <div className="text-gray-600 text-xs">Leaf Area Index</div>
                      <div className="font-bold text-forest-green">{preset.lai}</div>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <div className="text-gray-600 text-xs">Light Penetration</div>
                      <div className="font-bold text-forest-green">{preset.lightPenetration}%</div>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <div className="text-gray-600 text-xs">Sun Angle</div>
                      <div className="font-bold text-forest-green">{preset.sunAngle}°</div>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <div className="text-gray-600 text-xs">Canopy Gaps</div>
                      <div className="font-bold text-forest-green">{preset.canopyGaps}%</div>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <div className="text-gray-600 text-xs">Rainfall</div>
                      <div className="font-bold text-forest-green text-xs">
                        {preset.id === 'tropical-wet-evergreen' && '200-300 cm/year'}
                        {preset.id === 'tropical-semi-evergreen' && '150-250 cm/year'}
                        {preset.id === 'tropical-moist-deciduous' && '100-200 cm/year'}
                        {preset.id === 'tropical-dry-deciduous' && '50-100 cm/year'}
                        {preset.id === 'tropical-thorn' && '<50 cm/year'}
                        {preset.id === 'montane' && 'Variable'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Description */}
                <div className="bg-gradient-to-br from-forest-tan/30 to-green-50 p-4 sm:p-6 rounded-lg border border-forest-green/20">
                  <h3 className="text-lg sm:text-xl font-bold text-forest-green mb-4 flex items-center gap-2">
                    <Leaf size={24} />
                    Detailed Description
                  </h3>
                  <div className="prose max-w-none text-gray-800 leading-relaxed text-sm sm:text-base">
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="mb-3" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-forest-green" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base sm:text-lg font-bold text-forest-green mt-4 mb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm sm:text-base font-bold text-forest-green mt-4 mb-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-3 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />
                      }}
                    >
                      {preset.detailedDescription}
                    </ReactMarkdown>
                  </div>

                  {/* Visual Characteristics Images */}
                  {preset.visualImageQueries && preset.visualImageQueries.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-forest-green/20">
                      <h4 className="text-base font-bold text-forest-green mb-3 flex items-center gap-2">
                        <ImageIcon size={20} />
                        Visual Examples
                      </h4>
                      {loadingImages ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green"></div>
                          <p className="ml-3 text-sm text-gray-600">Loading images...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {preset.visualImageQueries.slice(0, 2).map((query, idx) => {
                            const img = visualImages[idx];
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md bg-gray-200 min-h-[192px]"
                                onClick={() => {
                                  if (img && img.startsWith('http')) {
                                    window.open(img, '_blank');
                                  }
                                }}
                              >
                                {img ? (
                                  <>
                                    <img
                                      src={img}
                                      alt={`${preset.name} visual example ${idx + 1}`}
                                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                      loading="lazy"
                                    />
                                    <div className="hidden w-full h-48 bg-gradient-to-br from-forest-green/30 via-green-100 to-forest-green/20 items-center justify-center">
                                      <div className="text-center text-forest-green">
                                        <ImageIcon size={40} className="mx-auto mb-2 opacity-60" />
                                        <p className="text-sm font-semibold">{preset.shortName}</p>
                                        <p className="text-xs mt-1 opacity-70">{query}</p>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-48 bg-gradient-to-br from-forest-green/30 via-green-100 to-forest-green/20 flex items-center justify-center">
                                    <div className="text-center text-forest-green">
                                      <ImageIcon size={40} className="mx-auto mb-2 opacity-60" />
                                      <p className="text-sm font-semibold">{preset.shortName}</p>
                                      <p className="text-xs mt-1 opacity-70">{query}</p>
                                    </div>
                                  </div>
                                )}
                                {img && (
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                                    <ExternalLink 
                                      size={24} 
                                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity" 
                                    />
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Characteristics Summary */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Key Characteristics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600 text-xs">Tree Height</div>
                      <div className="font-semibold text-forest-green capitalize">{preset.characteristics.treeHeight.replace('-', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">Density</div>
                      <div className="font-semibold text-forest-green capitalize">{preset.characteristics.density.replace('-', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">Understory</div>
                      <div className="font-semibold text-forest-green capitalize">{preset.characteristics.understory}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">Biodiversity</div>
                      <div className="font-semibold text-forest-green capitalize">{preset.characteristics.biodiversity.replace('-', ' ')}</div>
                    </div>
                  </div>
                </div>

                {/* Sources Section */}
                {preset.sources && preset.sources.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <ExternalLink size={18} className="text-blue-600" />
                      Sources & References
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Information compiled from the following authoritative sources:
                    </p>
                    <div className="space-y-2">
                      {preset.sources.map((source, index) => (
                        <motion.a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02, x: 4 }}
                          className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all group"
                        >
                          <ExternalLink size={14} className="text-blue-600 group-hover:text-blue-700 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-blue-700 group-hover:text-blue-800 font-medium">
                            {source.name}
                          </span>
                        </motion.a>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3 italic">
                      * Information based on web research and official forest classification systems of India
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ForestPresetInfo;

