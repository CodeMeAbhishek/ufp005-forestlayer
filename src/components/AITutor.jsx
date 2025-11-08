import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, Bot, User, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateGeminiText } from '../utils/api';
import { getPresetById } from '../data/indianForestPresets';
import { parseSource } from '../utils/sourceParser';
import SourceCitation from './SourceCitation';

const AITutor = ({ isOpen, onClose, selectedPreset }) => {
  const preset = selectedPreset ? getPresetById(selectedPreset) : null;
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: preset 
        ? `Hello! I'm your AI Forest Ecology Tutor specializing in ${preset.name} forests in India. Ask me anything about Indian forest layers, species, ecosystems, or environmental science! 🌳🇮🇳`
        : 'Hello! I\'m your AI Forest Ecology Tutor. Ask me anything about Indian forest layers, species, ecosystems, or environmental science! 🌳🇮🇳'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageSources, setMessageSources] = useState({});

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

  // Update greeting when preset changes (only if it's the initial greeting)
  useEffect(() => {
    if (isOpen) {
      setMessages(prev => {
        // Only update if it's still the initial greeting message
        if (prev.length === 1 && prev[0].role === 'assistant') {
          return [
            {
              role: 'assistant',
              content: preset 
                ? `Hello! I'm your AI Forest Ecology Tutor specializing in ${preset.name} forests in India. Ask me anything about Indian forest layers, species, ecosystems, or environmental science! 🌳🇮🇳`
                : 'Hello! I\'m your AI Forest Ecology Tutor. Ask me anything about Indian forest layers, species, ecosystems, or environmental science! 🌳🇮🇳'
            }
          ];
        }
        return prev;
      });
    }
  }, [selectedPreset, isOpen, preset]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build context-aware prompt with Indian forest focus
      const forestContext = preset
        ? `\n\n**Context:** The user is learning about ${preset.name} forests in India (${preset.location}). Focus your answer on Indian forest ecosystems, specifically ${preset.name} forests when relevant. Mention Indian locations, Indian species, and characteristics of Indian forests.`
        : `\n\n**Context:** Focus your answer on Indian forest ecosystems. Mention Indian locations, Indian species, and characteristics of forests found in India.`;
      
      const prompt = `As an expert forest ecologist specializing in Indian forests, answer this question clearly: ${input}. 
      Keep response to 2-4 short sentences. Be concise and informative. Relate to Indian forest layers and ecosystems when relevant.${forestContext}
      Write in simple, clear language. Use **bold** for key terms. Add 1-2 relevant emojis to make it engaging.
      IMPORTANT: Always provide context specific to Indian forests, Indian species, and Indian locations when relevant.

IMPORTANT: At the end of your response, add a source citation with URL in this exact format:
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
      const messageId = Date.now();
      
      setMessages(prev => [...prev, { role: 'assistant', content: parsed.content, id: messageId }]);
      setMessageSources(prev => ({ ...prev, [messageId]: { sourceName: parsed.sourceName, sourceUrl: parsed.sourceUrl } }));
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try asking your question again!' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = async (question) => {
    setInput(question);
    setTimeout(() => {
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      handleSend();
    }, 100);
  };

  const quickQuestions = preset
    ? [
        `How do trees in ${preset.shortName} forests affect understory growth?`,
        `What Indian species are found in ${preset.shortName} forests?`,
        `How does light penetration work in ${preset.shortName} forests?`,
        `What makes ${preset.shortName} forests unique in India?`,
        `How do forest gaps benefit ${preset.shortName} ecosystem diversity?`
      ]
    : [
        "How do trees in Indian forest canopies affect understory growth?",
        "What is the role of decomposers in Indian forest floors?",
        "How does light penetration change with canopy density in Indian forests?",
        "Why are Indian forest canopies considered biodiverse?",
        "How do forest gaps benefit Indian ecosystem diversity?"
      ];

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
              <div className="flex items-center gap-2 sm:gap-3">
                <Bot size={20} className="sm:w-6 sm:h-6" />
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold truncate">AI Forest Ecology Tutor</h2>
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

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Quick Questions */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Quick Questions:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {quickQuestions.map((q, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickQuestion(q)}
                      className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm bg-forest-tan/30 text-forest-green rounded-full hover:bg-forest-tan/50 transition"
                    >
                      <span className="line-clamp-1">{q}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-forest-green flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-forest-green text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="text-sm leading-relaxed">
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                        {msg.role === 'assistant' && msg.id && messageSources[msg.id] && (
                          <SourceCitation 
                            sourceName={messageSources[msg.id].sourceName} 
                            sourceUrl={messageSources[msg.id].sourceUrl}
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-gray-700" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-forest-green flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about forest ecology..."
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-4 sm:px-6 py-2 bg-forest-green text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-forest-light transition disabled:opacity-50 flex items-center gap-1.5 sm:gap-2 min-w-[70px] sm:min-w-auto"
                >
                  <Send size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Send</span>
                </motion.button>
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Powered by Gemini AI - Your personal Indian forest ecology tutor
              </p>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AITutor;

