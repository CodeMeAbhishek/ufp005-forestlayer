import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import LayerInfoPanel from './components/LayerInfoPanel';
import ModelControls from './components/ModelControls';
import Quiz from './components/Quiz';
import About from './components/About';
import Footer from './components/Footer';
import SpeciesExplorer from './components/SpeciesExplorer';
import AITutor from './components/AITutor';
import StoryGenerator from './components/StoryGenerator';
import StudyGuide from './components/StudyGuide';
import VirtualFieldTrip from './components/VirtualFieldTrip';
import ClimateImpact from './components/ClimateImpact';
import ForestSimulator from './components/ForestSimulator';
import ForestPresetInfo from './components/ForestPresetInfo';
import { HelpCircle } from 'lucide-react';
import { getDefaultPreset, getPresetById } from './data/indianForestPresets';

function App() {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [exploredLayers, setExploredLayers] = useState([]);
  const [presetInfoId, setPresetInfoId] = useState(null);
  const defaultPreset = getDefaultPreset();
  const [selectedPreset, setSelectedPreset] = useState(defaultPreset.id);
  const [controls, setControls] = useState({
    canopyCover: defaultPreset.canopyCover,
    lai: defaultPreset.lai,
    lightPenetration: defaultPreset.lightPenetration,
    sunAngle: defaultPreset.sunAngle,
    canopyGaps: defaultPreset.canopyGaps
  });

  const handleLayerClick = (layerId) => {
    setSelectedLayer(layerId);
    if (!exploredLayers.includes(layerId)) {
      setExploredLayers([...exploredLayers, layerId]);
    }
  };

  const handleControlChange = (key, value) => {
    setControls(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleControlsUpdate = (newControls) => {
    setControls(newControls);
  };

  const handlePresetChange = (presetId) => {
    const preset = getPresetById(presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setControls({
        canopyCover: preset.canopyCover,
        lai: preset.lai,
        lightPenetration: preset.lightPenetration,
        sunAngle: preset.sunAngle,
        canopyGaps: preset.canopyGaps
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingPage
        onLayerClick={handleLayerClick}
        onControlsClick={handleControlsUpdate}
        onAboutClick={() => setShowAbout(true)}
        onModuleOpen={(module) => setActiveModule(module)}
        controls={controls}
        exploredLayers={exploredLayers}
        selectedPreset={selectedPreset}
        onPresetChange={handlePresetChange}
        onPresetInfoClick={(presetId) => setPresetInfoId(presetId)}
      />

      <LayerInfoPanel
        layerId={selectedLayer}
        isOpen={selectedLayer !== null}
        onClose={() => setSelectedLayer(null)}
        selectedPreset={selectedPreset}
      />

      <ModelControls
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        controls={controls}
        onControlChange={handleControlChange}
        selectedPreset={selectedPreset}
        onPresetChange={handlePresetChange}
        onPresetInfoClick={(presetId) => setPresetInfoId(presetId)}
      />

      <ForestPresetInfo
        isOpen={presetInfoId !== null}
        onClose={() => setPresetInfoId(null)}
        presetId={presetInfoId}
      />

      <Quiz
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        selectedPreset={selectedPreset}
      />

      <About
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      {/* New AI-Powered Modules */}
      <ForestSimulator
        isOpen={activeModule === 'simulator'}
        onClose={() => setActiveModule(null)}
        controls={controls}
        selectedPreset={selectedPreset}
      />
      <SpeciesExplorer
        isOpen={activeModule === 'species'}
        onClose={() => setActiveModule(null)}
        selectedPreset={selectedPreset}
      />
      <AITutor
        isOpen={activeModule === 'tutor'}
        onClose={() => setActiveModule(null)}
        selectedPreset={selectedPreset}
      />
      <StoryGenerator
        isOpen={activeModule === 'story'}
        onClose={() => setActiveModule(null)}
        selectedPreset={selectedPreset}
      />
      <StudyGuide
        isOpen={activeModule === 'study'}
        onClose={() => setActiveModule(null)}
        selectedPreset={selectedPreset}
      />
      <VirtualFieldTrip
        isOpen={activeModule === 'fieldtrip'}
        onClose={() => setActiveModule(null)}
        selectedPreset={selectedPreset}
      />
      <ClimateImpact
        isOpen={activeModule === 'climate'}
        onClose={() => setActiveModule(null)}
        selectedPreset={selectedPreset}
      />

      {/* Floating Quiz Button */}
      {!showQuiz && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowQuiz(true)}
          className="fixed bottom-24 sm:bottom-28 right-4 md:right-8 z-40 p-3 sm:p-4 bg-forest-green text-white rounded-full shadow-2xl hover:bg-forest-light transition-all flex items-center gap-2 group"
          title="Start Quiz"
        >
          <HelpCircle size={20} className="sm:w-6 sm:h-6" />
          <span className="hidden md:block font-semibold">Quiz</span>
        </motion.button>
      )}

      <Footer />
    </div>
  );
}

export default App;

