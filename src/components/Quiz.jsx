import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { generateGeminiText } from '../utils/api';
import { getPresetById } from '../data/indianForestPresets';
import { parseSource } from '../utils/sourceParser';
import SourceCitation from './SourceCitation';

const Quiz = ({ isOpen, onClose, selectedPreset }) => {
  const preset = selectedPreset ? getPresetById(selectedPreset) : null;
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState({ sourceName: null, sourceUrl: null });

  useEffect(() => {
    if (isOpen) {
      generateQuiz();
    } else {
      resetQuiz();
    }
  }, [isOpen, selectedPreset]);

  const generateQuiz = async () => {
    setLoading(true);
    setSource({ sourceName: null, sourceUrl: null });
    try {
      // Build forest type context
      const forestContext = preset
        ? `\n\n**Context:** Focus questions on ${preset.name} forests in India (${preset.location}). Include Indian species examples, Indian locations, and characteristics specific to ${preset.name} forests. Make questions relevant to Indian forest ecosystems.`
        : `\n\n**Context:** Focus questions on Indian forest ecosystems. Include Indian species examples, Indian locations, and characteristics of forests found in India.`;
      
      const prompt = `Create 5 multiple-choice questions about forest layers (Emergent, Canopy, Understory, Forest Floor) in ${preset ? preset.name + ' forests in India' : 'Indian forest ecosystems'}. For each question, provide:
1. The question text - mention Indian forests, Indian species, or Indian locations when relevant
2. Four answer options (A, B, C, D) - include Indian examples where appropriate
3. The correct answer letter${forestContext}

IMPORTANT: Always include Indian context, Indian species names, Indian locations, and make questions specific to Indian forest ecosystems.
Format as JSON array with objects: {question: "...", options: {A: "...", B: "...", C: "...", D: "..."}, correct: "A"}

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
      
      // Try to extract JSON from response
      let jsonMatch = parsed.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questionsParsed = JSON.parse(jsonMatch[0]);
        setQuestions(questionsParsed);
        setSource({ sourceName: parsed.sourceName, sourceUrl: parsed.sourceUrl });
      } else {
        // Fallback questions if parsing fails
        setQuestions(getFallbackQuestions());
        setSource({ sourceName: null, sourceUrl: null });
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setQuestions(getFallbackQuestions());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackQuestions = () => {
    return [
      {
        question: `Which forest layer receives the most direct sunlight in ${preset ? preset.name + ' forests' : 'Indian forests'}?`,
        options: {
          A: "Emergent Layer",
          B: "Canopy",
          C: "Understory",
          D: "Forest Floor"
        },
        correct: "A"
      },
      {
        question: "Approximately what percentage of sunlight does the canopy layer block in dense Indian forests?",
        options: {
          A: "50%",
          B: "75%",
          C: "95%",
          D: "100%"
        },
        correct: "C"
      },
      {
        question: `Which layer has the highest biodiversity in ${preset ? preset.name + ' forests' : 'Indian forests'} (50%+ of plant species)?`,
        options: {
          A: "Emergent Layer",
          B: "Canopy",
          C: "Understory",
          D: "Forest Floor"
        },
        correct: "B"
      },
      {
        question: "The Forest Floor in Indian forests receives approximately what percentage of light?",
        options: {
          A: "10-20%",
          B: "5-10%",
          C: "1-2%",
          D: "0%"
        },
        correct: "C"
      },
      {
        question: "Which layer is primarily responsible for nutrient cycling through decomposition in Indian forest ecosystems?",
        options: {
          A: "Emergent Layer",
          B: "Canopy",
          C: "Understory",
          D: "Forest Floor"
        },
        correct: "D"
      }
    ];
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setQuestions([]);
  };

  const handleAnswer = (option) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(option);
    const isCorrect = option === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-forest-green text-white p-4 flex justify-between items-center rounded-t-xl">
            <div>
              <h2 className="text-xl font-bold">Forest Layers Quiz</h2>
              {preset && (
                <p className="text-xs sm:text-sm opacity-90 mt-1 flex items-center gap-1">
                  <MapPin size={12} />
                  {preset.name}
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-forest-dark rounded-full transition">
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div>
                <p className="mt-4 text-gray-600">Generating quiz questions...</p>
              </div>
            ) : showResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-forest-green mb-2">Quiz Complete!</h3>
                <p className="text-xl text-gray-700 mb-6">
                  You scored <span className="font-bold text-forest-green">{score}</span> out of {questions.length}
                </p>
                <div className="mb-6">
                  <SourceCitation sourceName={source.sourceName} sourceUrl={source.sourceUrl} className="justify-center" />
                </div>
                <button
                  onClick={() => {
                    resetQuiz();
                    generateQuiz();
                  }}
                  className="px-6 py-3 bg-forest-green text-white rounded-lg font-semibold hover:bg-forest-light transition"
                >
                  Take Another Quiz
                </button>
              </motion.div>
            ) : questions.length > 0 && currentQuestion < questions.length ? (
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <span className="text-sm font-semibold text-forest-green">
                      Score: {score}/{currentQuestion}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                      className="bg-forest-green h-2 rounded-full"
                    />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  {questions[currentQuestion].question}
                </h3>

                <div className="space-y-3 mb-6">
                  {Object.entries(questions[currentQuestion].options).map(([key, value]) => {
                    const isSelected = selectedAnswer === key;
                    const isCorrect = key === questions[currentQuestion].correct;
                    const showFeedback = selectedAnswer !== null;

                    return (
                      <motion.button
                        key={key}
                        onClick={() => handleAnswer(key)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          showFeedback && isCorrect
                            ? 'border-green-500 bg-green-50'
                            : showFeedback && isSelected && !isCorrect
                            ? 'border-red-500 bg-red-50'
                            : isSelected
                            ? 'border-forest-green bg-forest-tan/30'
                            : 'border-gray-300 hover:border-forest-green hover:bg-forest-tan/10'
                        }`}
                        whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                        whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">
                            <span className="font-bold mr-2">{key}.</span> {value}
                          </span>
                          {showFeedback && (
                            <>
                              {isCorrect && <CheckCircle className="text-green-500" size={24} />}
                              {isSelected && !isCorrect && <XCircle className="text-red-500" size={24} />}
                            </>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {selectedAnswer !== null && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext}
                    className="w-full py-3 bg-forest-green text-white rounded-lg font-semibold hover:bg-forest-light transition"
                  >
                    {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
                  </motion.button>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Failed to load quiz. Please try again.</p>
                <button
                  onClick={generateQuiz}
                  className="mt-4 px-6 py-3 bg-forest-green text-white rounded-lg font-semibold hover:bg-forest-light transition"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Quiz;

