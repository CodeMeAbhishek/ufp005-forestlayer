import React from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Users, GraduationCap, Info } from 'lucide-react';

const About = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
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
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-forest-green text-white p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Info size={20} /> About
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-forest-dark rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 text-forest-green">
            <GraduationCap size={24} />
            <h3 className="text-xl font-bold">Course Information</h3>
          </div>
          <p className="text-gray-700">
            <strong>UFP005 - Environmental Science and Climate Change</strong>
          </p>
          <p className="text-gray-600">
            This interactive simulation is designed to educate students and researchers about the vertical structure of Indian forest ecosystems, 
            focusing on the four key layers: Emergent Layer, Canopy, Understory, and Forest Floor. Explore six different types of Indian forests 
            with context-aware AI-powered educational content.
          </p>

          <div className="flex items-center gap-2 text-forest-green">
            <Users size={24} />
            <h3 className="text-xl font-bold">Project Team</h3>
          </div>
          <p className="text-gray-700">
            <strong>Group-1</strong>
          </p>

          <div className="flex items-center gap-2 text-forest-green">
            <BookOpen size={24} />
            <h3 className="text-xl font-bold">Features</h3>
          </div>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Interactive cross-section visualization of Indian forest layers</li>
            <li>Six Indian forest type presets (Wet Evergreen, Semi-Evergreen, Moist Deciduous, Dry Deciduous, Thorn Forests, Montane)</li>
            <li>Detailed information panels for each layer with Indian context</li>
            <li>Real-time model controls (Canopy Cover, LAI, Light Penetration, Sun Angle, Canopy Gaps)</li>
            <li>AI-powered modules with source citations:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-sm">
                <li>Forest Simulator - Visualize forest conditions</li>
                <li>Species Explorer - Discover Indian forest species</li>
                <li>AI Tutor - Get instant answers about Indian forests</li>
                <li>Story Generator - Create educational stories</li>
                <li>Study Guide - Generate personalized study materials</li>
                <li>Virtual Field Trip - Guided tours through Indian forests</li>
                <li>Climate Impact Analyzer - Analyze climate effects</li>
                <li>Interactive Quiz - Test your knowledge</li>
              </ul>
            </li>
            <li>AI-generated fun facts with clickable source links</li>
            <li>Biodiversity statistics and hover interactions</li>
            <li>Context-aware content based on selected Indian forest type</li>
            <li>All AI-generated content includes source citations with clickable links</li>
          </ul>

          <div className="bg-forest-tan/30 p-4 rounded-lg">
            <h3 className="font-semibold text-forest-green mb-2">Educational Goals</h3>
            <p className="text-gray-700 text-sm">
              This application aims to help students understand the complex vertical stratification of Indian forest ecosystems, 
              how different environmental factors (light, temperature, humidity) vary across layers, and the unique 
              adaptations of Indian flora and fauna to each layer's conditions. Students can explore different types of Indian forests 
              and learn about species, locations, and characteristics specific to India's diverse forest ecosystems.
            </p>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default About;

