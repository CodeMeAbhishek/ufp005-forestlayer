import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Map, Info } from 'lucide-react';
import { indianForestPresets, getPresetById } from '../data/indianForestPresets';

const ModelControls = ({ isOpen, onClose, controls, onControlChange, selectedPreset, onPresetChange, onPresetInfoClick }) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-full md:w-80 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-forest-green text-white p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings size={20} /> Model Controls
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-forest-dark rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Indian Forest Presets Section */}
                <div>
                  <h3 className="font-semibold text-forest-green mb-4 flex items-center gap-2">
                    <Map size={18} />
                    Indian Forest Types
                  </h3>
                  <div className="space-y-2">
                    {indianForestPresets.map((preset) => {
                      const isSelected = selectedPreset === preset.id;
                      return (
                        <div
                          key={preset.id}
                          className={`w-full rounded-lg transition-all border ${
                            isSelected
                              ? 'bg-forest-green text-white border-forest-green shadow-md'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => onPresetChange(preset.id)}
                            className="w-full text-left p-3 cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-semibold text-sm">{preset.shortName}</div>
                                <div className={`text-xs mt-1 line-clamp-2 ${
                                  isSelected ? 'opacity-90' : 'opacity-75'
                                }`}>
                                  {preset.description}
                                </div>
                                {isSelected && (
                                  <div className="text-xs mt-1 opacity-90 font-medium">
                                    ✓ Currently Selected
                                  </div>
                                )}
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPresetInfoClick(preset.id);
                                }}
                                className={`p-1.5 rounded-full transition flex-shrink-0 cursor-pointer ${
                                  isSelected
                                    ? 'hover:bg-white/20 text-white'
                                    : 'hover:bg-gray-200 text-gray-500'
                                }`}
                                title="Learn more about this forest type"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onPresetInfoClick(preset.id);
                                  }
                                }}
                              >
                                <Info size={18} />
                              </motion.div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedPreset && (
                    <div className="mt-3 p-3 bg-forest-green/10 rounded-lg border border-forest-green/20">
                      <div className="text-xs font-semibold text-forest-green mb-1">
                        {getPresetById(selectedPreset)?.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        Location: {getPresetById(selectedPreset)?.location}
                      </div>
                    </div>
                  )}
                </div>

                {/* Canopy Cover */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-forest-green">Canopy Cover</label>
                    <span className="text-2xl font-bold text-forest-light">{controls.canopyCover}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={controls.canopyCover}
                    onChange={(e) => onControlChange('canopyCover', parseInt(e.target.value))}
                    className="w-full h-3 bg-forest-tan rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-xs text-gray-600 mt-1">Density of canopy layer</p>
                </div>

                {/* Leaf Area Index */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-forest-green">Leaf Area Index (LAI)</label>
                    <span className="text-2xl font-bold text-forest-light">{controls.lai.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={controls.lai}
                    onChange={(e) => onControlChange('lai', parseFloat(e.target.value))}
                    className="w-full h-3 bg-forest-tan rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-xs text-gray-600 mt-1">Leaf thickness/density across layers</p>
                </div>

                {/* Light Penetration / Solar Intensity */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-forest-green">Solar Intensity</label>
                    <span className="text-2xl font-bold text-forest-light">{controls.lightPenetration}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={controls.lightPenetration}
                    onChange={(e) => onControlChange('lightPenetration', parseInt(e.target.value))}
                    className="w-full h-3 bg-forest-tan rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-xs text-gray-600 mt-1">Time of day / weather modifier</p>
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-700">
                    <strong>Auto-calculated penetration:</strong> {(() => {
                      const canopyDensityFactor = controls.canopyCover / 100;
                      const laiFactor = controls.lai / 10;
                      const basePenetration = Math.exp(-0.8 * canopyDensityFactor * (1 + laiFactor));
                      const autoPenetration = 5 + (basePenetration * 95);
                      const sunAngle = controls.sunAngle || 45;
                      const angleRad = (sunAngle * Math.PI) / 180;
                      const angleFactor = Math.abs(Math.sin(angleRad));
                      const effectivePenetration = (autoPenetration * (controls.lightPenetration / 100) * (0.7 + 0.3 * angleFactor)).toFixed(1);
                      return `${effectivePenetration}%`;
                    })()}
                    <br />
                    <span className="text-gray-600">(Based on canopy structure + solar intensity + sun angle)</span>
                  </div>
                </div>

                {/* Sun Angle (Time of Day) - Inspired by DART radiative transfer model */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-forest-green">Sun Angle (Time of Day)</label>
                    <span className="text-2xl font-bold text-forest-light">{controls.sunAngle || 45}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={controls.sunAngle || 45}
                    onChange={(e) => onControlChange('sunAngle', parseInt(e.target.value))}
                    className="w-full h-3 bg-forest-tan rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-xs text-gray-600 mt-1">0° = sunrise, 90° = noon, 180° = sunset</p>
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-gray-700">
                    <strong>Time:</strong> {(() => {
                      const angle = controls.sunAngle || 45;
                      if (angle < 30) return 'Dawn';
                      if (angle < 60) return 'Morning';
                      if (angle < 120) return 'Midday';
                      if (angle < 150) return 'Afternoon';
                      return 'Dusk';
                    })()}
                    <br />
                    <span className="text-gray-600">Affects light penetration efficiency</span>
                  </div>
                </div>

                {/* Canopy Gaps - Inspired by FORMIND gap dynamics */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-forest-green">Canopy Gaps</label>
                    <span className="text-2xl font-bold text-forest-light">{controls.canopyGaps || 0}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={controls.canopyGaps || 0}
                    onChange={(e) => onControlChange('canopyGaps', parseInt(e.target.value))}
                    className="w-full h-3 bg-forest-tan rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-xs text-gray-600 mt-1">Light patches from tree falls (FORMIND gap model)</p>
                  <div className="mt-2 p-2 bg-green-50 rounded text-xs text-gray-700">
                    <strong>Gap effect:</strong> Creates light patches for understory regeneration
                    <br />
                    <span className="text-gray-600">Higher gaps = more biodiversity</span>
                  </div>
                </div>

                {/* Live Indicators - Calculated dynamically based on forest model */}
                <div className="bg-forest-tan/30 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-forest-green">Live Conditions</h3>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      // Calculate automatic light penetration (synchronized) - same as RainforestSVG
                      const canopyDensityFactor = controls.canopyCover / 100;
                      const laiFactor = controls.lai / 10;
                      const basePenetration = Math.exp(-0.8 * canopyDensityFactor * (1 + laiFactor));
                      const autoPenetration = 5 + (basePenetration * 95);
                      const sunAngle = controls.sunAngle || 45;
                      const angleRad = (sunAngle * Math.PI) / 180;
                      const angleFactor = Math.abs(Math.sin(angleRad));
                      const effectivePenetration = (autoPenetration * (controls.lightPenetration / 100) * (0.7 + 0.3 * angleFactor)) / 100;
                      
                      // Calculate realistic light levels for each layer using Beer-Lambert law approximation
                      const lightAttenuationCoefficient = 0.5;
                      
                      // Emergent layer light
                      const emergentLight = Math.max(90, 100 - (controls.lai * 0.8)) * effectivePenetration;
                      
                      // Canopy layer light
                      const canopyAttenuation = Math.exp(-lightAttenuationCoefficient * controls.lai * canopyDensityFactor);
                      const canopyLight = (70 + (30 * canopyAttenuation)) * (0.7 + 0.3 * (1 - canopyDensityFactor)) * effectivePenetration;
                      
                      // Understory layer light (synchronized)
                      const understoryTransmission = Math.exp(-lightAttenuationCoefficient * controls.lai * canopyDensityFactor * 1.5);
                      const understoryLight = Math.max(2, Math.min(15, 5 + (10 * understoryTransmission * effectivePenetration)));
                      
                      // Forest floor light (synchronized)
                      const floorTransmission = Math.exp(-lightAttenuationCoefficient * controls.lai * canopyDensityFactor * 2);
                      const floorLight = Math.max(0.5, Math.min(5, 1 + (2 * floorTransmission * effectivePenetration)));
                      
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Light: Emergent</span>
                            <span className="font-semibold text-yellow-600">
                              {emergentLight.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Light: Canopy</span>
                            <span className="font-semibold text-yellow-600">
                              {canopyLight.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Light: Understory</span>
                            <span className="font-semibold text-yellow-600">
                              {understoryLight.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Light: Forest Floor</span>
                            <span className="font-semibold text-yellow-600">
                              {floorLight.toFixed(1)}%
                            </span>
                          </div>
                          <div className="pt-2 mt-2 border-t border-gray-300">
                            <div className="flex justify-between">
                              <span className="text-gray-700 text-xs">Wind Resistance</span>
                              <span className="font-semibold text-blue-600 text-xs">
                                {((1 + (controls.canopyCover / 100) * 0.5 + (controls.lai / 10) * 0.3).toFixed(2))}x
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-gray-700 text-xs">Tree Density</span>
                              <span className="font-semibold text-green-600 text-xs">
                                {Math.round((controls.canopyCover / 100) * 100 + (controls.lai / 10) * 30)}%
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-gray-700 text-xs">Biodiversity Index</span>
                              <span className="font-semibold text-purple-600 text-xs">
                                {(() => {
                                  const canopyDensityFactor = controls.canopyCover / 100;
                                  const laiFactor = controls.lai / 10;
                                  const gapFactor = Math.min(20, controls.canopyGaps || 0) / 20;
                                  const structureFactor = canopyDensityFactor * 0.4 + laiFactor * 0.3;
                                  const diversityScore = (structureFactor * 50) + (gapFactor * 30) + 20;
                                  return Math.round(Math.min(100, Math.max(20, diversityScore)));
                                })()}%
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4a7c2a;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4a7c2a;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
};

export default ModelControls;

