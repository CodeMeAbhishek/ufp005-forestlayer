import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Download, Printer, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateGeminiText } from '../utils/api';
import { forestLayers } from '../data/layerData';
import { getPresetById } from '../data/indianForestPresets';
import { parseSource } from '../utils/sourceParser';
import SourceCitation from './SourceCitation';

const StudyGuide = ({ isOpen, onClose, selectedPreset }) => {
  const preset = selectedPreset ? getPresetById(selectedPreset) : null;
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [studyGuide, setStudyGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState('overview'); // overview, exam, detailed
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

  const toggleLayer = (layerId) => {
    setSelectedLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const generateStudyGuide = async () => {
    if (selectedLayers.length === 0) {
      alert('Please select at least one layer to study!');
      return;
    }

    setLoading(true);
    setStudyGuide(null);
    setSource({ sourceName: null, sourceUrl: null });

    try {
      const layersInfo = selectedLayers
        .map(id => {
          const layer = forestLayers.find(l => l.id === id);
          return `${layer.name}: ${layer.position}, ${layer.conditions}`;
        })
        .join('\n');

      let focusPrompt = '';
      if (focus === 'exam') {
        focusPrompt = 'Focus on key facts, definitions, and potential exam questions. Include important numbers and percentages.';
      } else if (focus === 'detailed') {
        focusPrompt = 'Provide comprehensive, detailed explanations with scientific terminology and ecological relationships.';
      } else {
        focusPrompt = 'Give a balanced overview with main concepts, key characteristics, and ecological significance.';
      }

      // Build forest type context
      const forestContext = preset
        ? `\n\n**Context:** Focus on ${preset.name} forests in India (${preset.location}). Include Indian species examples, Indian locations, and characteristics specific to ${preset.name} forests. Make all examples and facts relevant to Indian forest ecosystems.`
        : `\n\n**Context:** Focus on Indian forest ecosystems. Include Indian species examples, Indian locations, and characteristics of forests found in India.`;
      
      const prompt = `Create a concise study guide for these forest layers in ${preset ? preset.name + ' forests in India' : 'Indian forest ecosystems'}:
${layersInfo}

${focusPrompt}${forestContext}

Format as clear sections with headings:
- Key Concepts (bullet points, 3-4 items) 📚
- Important Facts (bullet points, 3-4 items) 💡
- Ecological Relationships (2-3 sentences) 🌿
- Quick Review (bullet points, 3-4 items) ✅
- Study Tips (2-3 tips) 🎯

Keep total length under 350 words. Use simple language. Use **bold** for key terms. Add 1-2 relevant emojis per section.
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

      const guide = await generateGeminiText(prompt);
      const parsed = parseSource(guide);
      setStudyGuide(parsed.content);
      setSource({ sourceName: parsed.sourceName, sourceUrl: parsed.sourceUrl });
    } catch (error) {
      console.error('Error generating study guide:', error);
      setStudyGuide('Study Guide Generation Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!studyGuide) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Forest Layers Study Guide</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>Forest Layers Study Guide</h1>
          <pre style="white-space: pre-wrap; font-family: Arial;">${studyGuide}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    if (!studyGuide) return;
    const blob = new Blob([studyGuide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forest-study-guide-${selectedLayers.join('-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
              <div className="flex items-center gap-3">
                <GraduationCap size={24} />
                <div>
                  <h2 className="text-xl font-bold">AI Study Guide Generator</h2>
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
              {/* Layer Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Layers to Study:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {forestLayers.map((layer) => (
                    <motion.button
                      key={layer.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleLayer(layer.id)}
                      className={`p-4 rounded-lg border-2 transition text-left ${
                        selectedLayers.includes(layer.id)
                          ? 'border-forest-green bg-forest-tan/30'
                          : 'border-gray-200 hover:border-forest-green/50'
                      }`}
                    >
                      <div className="font-semibold text-sm">{layer.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{layer.position}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Focus Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Study Focus:
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'overview', name: 'Overview', desc: 'Balanced learning' },
                    { id: 'exam', name: 'Exam Prep', desc: 'Key facts & numbers' },
                    { id: 'detailed', name: 'Detailed', desc: 'Comprehensive study' }
                  ].map((f) => (
                    <motion.button
                      key={f.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFocus(f.id)}
                      className={`flex-1 p-4 rounded-lg border-2 transition ${
                        focus === f.id
                          ? 'border-forest-green bg-forest-tan/30'
                          : 'border-gray-200 hover:border-forest-green/50'
                      }`}
                    >
                      <div className="font-semibold">{f.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{f.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateStudyGuide}
                disabled={loading || selectedLayers.length === 0}
                className="w-full py-4 bg-gradient-to-r from-forest-green to-forest-light text-white rounded-lg font-bold text-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <GraduationCap size={24} />
                {loading ? 'Generating Study Guide...' : 'Generate Study Guide'}
              </motion.button>

              {/* Generated Guide */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 text-center py-12"
                  >
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div>
                    <p className="mt-4 text-gray-600">AI is creating your personalized study guide...</p>
                  </motion.div>
                )}

                {studyGuide && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="bg-white border-2 border-forest-green/20 rounded-lg p-6">
                      <div className="prose max-w-none text-sm text-gray-800 leading-relaxed">
                        <ReactMarkdown 
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-forest-green mt-4 mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-forest-green mt-4 mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-bold text-forest-green mt-4 mb-2" {...props} />,
                            p: ({node, ...props}) => <p className="mb-3" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-3" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-forest-green" {...props} />
                          }}
                        >
                          {studyGuide}
                        </ReactMarkdown>
                        <SourceCitation sourceName={source.sourceName} sourceUrl={source.sourceUrl} />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDownload}
                        className="flex-1 px-4 py-3 bg-forest-green text-white rounded-lg font-semibold hover:bg-forest-light transition flex items-center justify-center gap-2"
                      >
                        <Download size={20} />
                        Download PDF
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePrint}
                        className="flex-1 px-4 py-3 bg-white border-2 border-forest-green text-forest-green rounded-lg font-semibold hover:bg-forest-tan/10 transition flex items-center justify-center gap-2"
                      >
                        <Printer size={20} />
                        Print Guide
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!studyGuide && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-center py-8 text-gray-500"
                >
                  <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select layers and generate your personalized study guide!</p>
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

export default StudyGuide;

