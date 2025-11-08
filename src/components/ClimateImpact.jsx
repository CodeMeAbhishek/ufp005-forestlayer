import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, TrendingUp, TrendingDown, Activity, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateGeminiText } from '../utils/api';
import { getPresetById } from '../data/indianForestPresets';
import { parseSource } from '../utils/sourceParser';
import SourceCitation from './SourceCitation';

const ClimateImpact = ({ isOpen, onClose, selectedPreset }) => {
  const preset = selectedPreset ? getPresetById(selectedPreset) : null;
  const [scenario, setScenario] = useState('temperature');
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState({ sourceName: null, sourceUrl: null });

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

  const scenarios = [
    { 
      id: 'temperature', 
      name: 'Temperature Rise', 
      icon: '🌡️',
      description: 'Effects of global warming on forest layers'
    },
    { 
      id: 'deforestation', 
      name: 'Deforestation', 
      icon: '🪓',
      description: 'Impact of habitat loss on ecosystems'
    },
    { 
      id: 'rainfall', 
      name: 'Rainfall Changes', 
      icon: '🌧️',
      description: 'Effects of altered precipitation patterns'
    },
    { 
      id: 'pollution', 
      name: 'Air Pollution', 
      icon: '💨',
      description: 'Impact of contaminants on forest health'
    },
    { 
      id: 'invasive', 
      name: 'Invasive Species', 
      icon: '🐛',
      description: 'Effects of non-native species introduction'
    },
    { 
      id: 'habitat', 
      name: 'Habitat Fragmentation', 
      icon: '🔗',
      description: 'Impact of forest fragmentation'
    }
  ];

  const analyzeImpact = async () => {
    setLoading(true);
    setImpact(null);
    setSource({ sourceName: null, sourceUrl: null });

    try {
      const scenarioData = scenarios.find(s => s.id === scenario);
      // Build forest type context
      const forestContext = preset
        ? `\n\n**Context:** Focus on ${preset.name} forests in India (${preset.location}). Analyze how ${scenarioData.name.toLowerCase()} specifically affects Indian forest ecosystems, Indian species, and Indian locations. Include examples from Indian forests and mention Indian conservation efforts.`
        : `\n\n**Context:** Focus on Indian forest ecosystems. Analyze how ${scenarioData.name.toLowerCase()} affects Indian forests, Indian species, and Indian locations. Include examples from Indian forests and mention Indian conservation efforts.`;
      
      const prompt = `Analyze the impact of ${scenarioData.name.toLowerCase()} on ${preset ? preset.name + ' forests in India' : 'Indian forest ecosystems'} and forest layers. Provide:
      
      - Immediate Effects (2-3 sentences) - focus on Indian forests ⚠️
      - Long-term Consequences (2-3 sentences) - mention Indian species and locations 📉
      - Layer-Specific Impacts (one sentence each for: Emergent, Canopy, Understory, Forest Floor) - relate to ${preset ? preset.name + ' forests' : 'Indian forests'} 🌿
      - Mitigation Strategies (2-3 actionable solutions) - include Indian conservation approaches ✅${forestContext}
      
      Keep total response under 300 words. Write in clear, simple language. Use **bold** for key terms. Add relevant emojis naturally.
      IMPORTANT: Always include Indian examples, Indian species, Indian locations, and make it specific to Indian forest ecosystems.

IMPORTANT: At the end of your response, add a source citation with URL in this exact format:
*Source: [Source Name] (https://example.com)*

Use credible sources such as:
- India State of Forest Report (https://fsi.nic.in)
- Ministry of Environment, Forest and Climate Change, India (https://moef.gov.in)
- National Geographic (https://www.nationalgeographic.com)
- World Wildlife Fund - WWF India (https://www.wwfindia.org)
- Scientific journals or research institutions

Always include a valid URL for the source.`;

      const analysis = await generateGeminiText(prompt);
      const parsed = parseSource(analysis);
      setImpact(parsed.content);
      setSource({ sourceName: parsed.sourceName, sourceUrl: parsed.sourceUrl });
    } catch (error) {
      console.error('Error analyzing impact:', error);
      setImpact('Climate impact analysis generation encountered an error. Please try again.');
    } finally {
      setLoading(false);
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
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-500 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} />
                <div>
                  <h2 className="text-xl font-bold">Climate Impact Analyzer</h2>
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
              {/* Scenario Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Climate Scenario to Analyze:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {scenarios.map((s) => (
                    <motion.button
                      key={s.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setScenario(s.id)}
                      className={`p-4 rounded-lg border-2 transition text-left ${
                        scenario === s.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="font-semibold text-sm mb-1">{s.name}</div>
                      <div className="text-xs text-gray-600">{s.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Analyze Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeImpact}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-bold text-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <Activity size={24} />
                {loading ? 'Analyzing Impact...' : 'Analyze Climate Impact'}
              </motion.button>

              {/* Impact Analysis */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 text-center py-12"
                  >
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    <p className="mt-4 text-gray-600">AI is analyzing climate impacts...</p>
                  </motion.div>
                )}

                {impact && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-lg border-2 border-red-200">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingDown className="text-red-600" size={24} />
                        <h3 className="text-xl font-bold text-red-900">Impact Analysis</h3>
                      </div>
                      <div className="prose max-w-none text-gray-800 leading-relaxed">
                        <ReactMarkdown 
                          components={{
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-red-900 mt-4 mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-bold text-red-900 mt-4 mb-2" {...props} />,
                            p: ({node, ...props}) => <p className="mb-3" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-3" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-red-900" {...props} />
                          }}
                        >
                          {impact}
                        </ReactMarkdown>
                        <SourceCitation sourceName={source.sourceName} sourceUrl={source.sourceUrl} />
                      </div>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="text-green-600" size={18} />
                          <h4 className="font-semibold text-green-800">Positive Actions</h4>
                        </div>
                        <p className="text-sm text-green-700">
                          Consider reforestation, conservation efforts, and sustainable practices to mitigate these impacts.
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="text-blue-600" size={18} />
                          <h4 className="font-semibold text-blue-800">Research Needed</h4>
                        </div>
                        <p className="text-sm text-blue-700">
                          Further monitoring and research can help track changes and develop effective responses.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!impact && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-center py-8 text-gray-500"
                >
                  <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a climate scenario and analyze its impact on forest ecosystems!</p>
                  <p className="text-sm mt-2">Powered by Gemini AI for comprehensive environmental analysis</p>
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

export default ClimateImpact;

