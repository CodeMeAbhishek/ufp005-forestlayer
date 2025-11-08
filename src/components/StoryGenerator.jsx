import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles, Download, Share2, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateGeminiText } from '../utils/api';
import { getPresetById } from '../data/indianForestPresets';
import { parseSource } from '../utils/sourceParser';
import SourceCitation from './SourceCitation';

const StoryGenerator = ({ isOpen, onClose, selectedPreset }) => {
  const preset = selectedPreset ? getPresetById(selectedPreset) : null;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storyType, setStoryType] = useState('adventure');
  const [layer, setLayer] = useState('all');
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

  const storyTypes = [
    { id: 'adventure', name: 'Adventure Story', icon: '🌳' },
    { id: 'scientific', name: 'Scientific Journey', icon: '🔬' },
    { id: 'narrative', name: 'Ecological Narrative', icon: '📚' },
    { id: 'exploration', name: 'Discovery Tale', icon: '🗺️' }
  ];

  const layers = [
    { id: 'all', name: 'All Layers' },
    { id: 'emergent', name: 'Emergent Layer' },
    { id: 'canopy', name: 'Canopy Layer' },
    { id: 'understory', name: 'Understory Layer' },
    { id: 'forest-floor', name: 'Forest Floor' }
  ];

  const generateStory = async () => {
    setLoading(true);
    setStory(null);
    setSource({ sourceName: null, sourceUrl: null });

    try {
      const layerContext = layer === 'all' 
        ? 'all four forest layers (Emergent, Canopy, Understory, and Forest Floor)'
        : `the ${layers.find(l => l.id === layer)?.name}`;

      // Build forest type context
      const forestContext = preset
        ? `\n\n**Context:** The story should be set in ${preset.name} forests in India (${preset.location}). Include Indian species, Indian locations, and characteristics specific to ${preset.name} forests. Make it relevant to Indian forest ecosystems.`
        : `\n\n**Context:** The story should be set in Indian forest ecosystems. Include Indian species, Indian locations, and characteristics of forests found in India.`;
      
      const prompt = `Create a short, engaging ${storyType} story for students about ${layerContext} in ${preset ? preset.name + ' forests in India' : 'Indian forest ecosystems'}. 
      Requirements:
      - Educational and scientifically accurate
      - Exactly 3-4 short paragraphs (200-300 words total)
      - Include interactions between different Indian species
      - Highlight unique characteristics of ${layerContext} in ${preset ? preset.name + ' forests' : 'Indian forests'}
      - Make it fun and memorable with emojis throughout (3-5 emojis total)
      - Write in simple, clear language
      - Use **bold** for important terms and names${forestContext}
      IMPORTANT: Always include Indian species names, Indian locations, and make it specific to Indian forest ecosystems.

IMPORTANT: At the end of your response, add a source citation with URL in this exact format:
*Source: [Source Name] (https://example.com)*

Use credible sources such as:
- India State of Forest Report (https://fsi.nic.in)
- Ministry of Environment, Forest and Climate Change, India (https://moef.gov.in)
- National Geographic (https://www.nationalgeographic.com)
- World Wildlife Fund - WWF India (https://www.wwfindia.org)
- Scientific journals or research institutions

Always include a valid URL for the source.`;

      const generatedStory = await generateGeminiText(prompt);
      const parsed = parseSource(generatedStory);
      setStory(parsed.content);
      setSource({ sourceName: parsed.sourceName, sourceUrl: parsed.sourceUrl });
    } catch (error) {
      console.error('Error generating story:', error);
      setStory('Once upon a time, in the depths of a tropical rainforest, an explorer discovered the amazing world of forest layers...');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!story) return;
    const blob = new Blob([story], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forest-story-${storyType}-${layer}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (!story) return;
    if (navigator.share) {
      navigator.share({
        title: `Forest ${storyType} Story`,
        text: story,
      });
    } else {
      navigator.clipboard.writeText(story);
      alert('Story copied to clipboard!');
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
              className="w-full h-full sm:h-auto sm:max-h-[calc(100vh-2rem)] md:w-[90%] md:max-w-3xl md:h-auto md:max-h-[90vh] bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-forest-green to-forest-light text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <BookOpen size={24} />
                <div>
                  <h2 className="text-xl font-bold">Interactive Story Generator</h2>
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
              {/* Story Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Story Type:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {storyTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStoryType(type.id)}
                      className={`p-4 rounded-lg border-2 transition ${
                        storyType === type.id
                          ? 'border-forest-green bg-forest-tan/30'
                          : 'border-gray-200 hover:border-forest-green/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-sm font-medium">{type.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Layer Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Focus on Layer:
                </label>
                <div className="flex flex-wrap gap-2">
                  {layers.map((l) => (
                    <motion.button
                      key={l.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLayer(l.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        layer === l.id
                          ? 'bg-forest-green text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {l.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateStory}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-forest-green to-forest-light text-white rounded-lg font-bold text-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <Sparkles size={24} />
                {loading ? 'Crafting Your Story...' : 'Generate Story'}
              </motion.button>

              {/* Generated Story */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 text-center py-12"
                  >
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div>
                    <p className="mt-4 text-gray-600">AI is crafting your educational story...</p>
                  </motion.div>
                )}

                {story && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="bg-gradient-to-br from-forest-tan/30 to-green-50 p-6 rounded-lg border border-forest-green/20">
                      <div className="prose max-w-none text-gray-800 leading-relaxed text-base">
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-forest-green" {...props} />
                          }}
                        >
                          {story}
                        </ReactMarkdown>
                        <SourceCitation sourceName={source.sourceName} sourceUrl={source.sourceUrl} />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExport}
                        className="flex-1 px-4 py-3 bg-white border-2 border-forest-green text-forest-green rounded-lg font-semibold hover:bg-forest-tan/10 transition flex items-center justify-center gap-2"
                      >
                        <Download size={20} />
                        Download Story
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleShare}
                        className="flex-1 px-4 py-3 bg-white border-2 border-forest-green text-forest-green rounded-lg font-semibold hover:bg-forest-tan/10 transition flex items-center justify-center gap-2"
                      >
                        <Share2 size={20} />
                        Share Story
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!story && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-center py-8 text-gray-500"
                >
                  <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a story type and layer, then generate your personalized educational story!</p>
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

export default StoryGenerator;

