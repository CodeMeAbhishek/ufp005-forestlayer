import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Download, Share2, Menu, X, Search, Bot, BookOpen, GraduationCap, MapPin, AlertTriangle, Eye, Map } from 'lucide-react';
import { forestLayers } from '../data/layerData';
import { exportToPDF } from '../utils/pdfExport';
import RainforestSVG from './RainforestSVG';
import { indianForestPresets, getPresetById } from '../data/indianForestPresets';

const LandingPage = ({
  onLayerClick,
  onControlsClick,
  onAboutClick,
  controls,
  exploredLayers,
  onModuleOpen,
  selectedPreset,
  onPresetChange,
  onPresetInfoClick
}) => {
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // On desktop, keep sidebar open state but allow manual closing
  useEffect(() => {
    const handleResize = () => {
      // On mobile, if sidebar was open and screen becomes small, keep it open
      // On desktop resize, maintain current state
      if (window.innerWidth < 768 && isSidebarOpen) {
        // Keep current state on mobile
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const handleExport = () => {
    const layers = exploredLayers.map(id => {
      const layer = forestLayers.find(l => l.id === id);
      return {
        name: layer.name,
        description: `${layer.position}. ${layer.conditions}`,
        position: layer.position
      };
    });
    exportToPDF(layers);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Forest Layers Explorer',
        text: 'Check out this interactive simulation of forest ecosystem layers!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex bg-white md:flex-row">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-4 z-50 p-2.5 sm:p-3 bg-forest-green text-white rounded-lg shadow-lg hover:bg-forest-light transition-all flex items-center justify-center ${
          isSidebarOpen 
            ? 'left-[272px] sm:left-[320px] md:left-[296px] lg:left-[336px]' 
            : 'left-2 sm:left-4 md:left-4'
        }`}
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isSidebarOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
      </motion.button>

      {/* Left Sidebar - Controls (Mobile Only) */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <>
            {/* Overlay for mobile only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
            />
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 sm:w-80 bg-gray-50 border-r border-gray-200 flex flex-col fixed left-0 top-0 h-screen z-40 shadow-lg overflow-y-auto md:hidden"
            >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-forest-green mb-1 sm:mb-2">Forest Layers Explorer</h2>
          <p className="text-xs sm:text-sm text-gray-600 break-words">
            UFP005 | Environmental Science and Climate Change
          </p>
          <p className="text-xs text-gray-500 mt-1">Group-1</p>
        </div>

        {/* Indian Forest Presets Section */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
            <Map size={14} className="text-forest-green" />
            Indian Forest Types
          </h3>
          <div className="space-y-2">
            {indianForestPresets.map((preset) => (
              <div
                key={preset.id}
                className={`w-full rounded-lg transition-all border ${
                  selectedPreset === preset.id
                    ? 'bg-forest-green text-white border-forest-green shadow-md'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onPresetChange(preset.id)}
                  className="w-full text-left p-2.5 sm:p-3 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-xs sm:text-sm">{preset.shortName}</div>
                      <div className={`text-xs mt-1 line-clamp-1 ${
                        selectedPreset === preset.id ? 'opacity-90' : 'opacity-75'
                      }`}>
                        {preset.description}
                      </div>
                      {selectedPreset === preset.id && (
                        <div className="text-xs mt-1 opacity-90 font-medium">
                          ✓ Selected
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
                      className={`p-1.5 rounded-full transition cursor-pointer ${
                        selectedPreset === preset.id
                          ? 'hover:bg-white/20 text-white'
                          : 'hover:bg-gray-100 text-gray-500'
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
                      <Info size={16} />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Panel Section - Now Above Explore Layers */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Model Controls</h3>
          
          {/* Canopy Cover */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-gray-600">Canopy Cover</label>
              <span className="text-sm font-bold text-forest-green">{controls.canopyCover}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={controls.canopyCover}
              onChange={(e) => onControlsClick({ ...controls, canopyCover: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* LAI */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-gray-600">Leaf Area Index</label>
              <span className="text-sm font-bold text-forest-green">{controls.lai.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={controls.lai}
              onChange={(e) => onControlsClick({ ...controls, lai: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Light Penetration */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-gray-600">Light Penetration</label>
              <span className="text-sm font-bold text-forest-green">{controls.lightPenetration}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={controls.lightPenetration}
              onChange={(e) => onControlsClick({ ...controls, lightPenetration: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAboutClick}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white text-forest-green rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 border border-gray-200"
          >
            <Info size={16} className="sm:w-[18px] sm:h-[18px]" /> About
          </motion.button>

          {exploredLayers.length > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white text-forest-green rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 border border-gray-200"
              >
                <Download size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Export PDF</span><span className="sm:hidden">Export</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white text-forest-green rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 border border-gray-200"
              >
                <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" /> Share
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Desktop sidebar (toggleable) */}
      {isSidebarOpen && (
        <div className="hidden md:flex w-72 lg:w-80 bg-gray-50 border-r border-gray-200 flex-col fixed left-0 top-0 h-screen z-40 shadow-lg overflow-y-auto">
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-forest-green mb-1 sm:mb-2">Forest Layers Explorer</h2>
          <p className="text-xs sm:text-sm text-gray-600 break-words">
            UFP005 | Environmental Science and Climate Change
          </p>
          <p className="text-xs text-gray-500 mt-1">Group-1</p>
        </div>

        {/* Indian Forest Presets Section */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
            <Map size={14} className="text-forest-green" />
            Indian Forest Types
          </h3>
          <div className="space-y-2">
            {indianForestPresets.map((preset) => (
              <div
                key={preset.id}
                className={`w-full rounded-lg transition-all border ${
                  selectedPreset === preset.id
                    ? 'bg-forest-green text-white border-forest-green shadow-md'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onPresetChange(preset.id)}
                  className="w-full text-left p-2.5 sm:p-3 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-xs sm:text-sm">{preset.shortName}</div>
                      <div className={`text-xs mt-1 line-clamp-1 ${
                        selectedPreset === preset.id ? 'opacity-90' : 'opacity-75'
                      }`}>
                        {preset.description}
                      </div>
                      {selectedPreset === preset.id && (
                        <div className="text-xs mt-1 opacity-90 font-medium">
                          ✓ Selected
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
                      className={`p-1.5 rounded-full transition cursor-pointer ${
                        selectedPreset === preset.id
                          ? 'hover:bg-white/20 text-white'
                          : 'hover:bg-gray-100 text-gray-500'
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
                      <Info size={16} />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Panel Section */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Model Controls</h3>
          
          {/* Canopy Cover */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-gray-600">Canopy Cover</label>
              <span className="text-sm font-bold text-forest-green">{controls.canopyCover}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={controls.canopyCover}
              onChange={(e) => onControlsClick({ ...controls, canopyCover: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* LAI */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-gray-600">Leaf Area Index</label>
              <span className="text-sm font-bold text-forest-green">{controls.lai.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={controls.lai}
              onChange={(e) => onControlsClick({ ...controls, lai: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Light Penetration */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-gray-600">Light Penetration</label>
              <span className="text-sm font-bold text-forest-green">{controls.lightPenetration}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={controls.lightPenetration}
              onChange={(e) => onControlsClick({ ...controls, lightPenetration: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAboutClick}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white text-forest-green rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 border border-gray-200"
          >
            <Info size={16} className="sm:w-[18px] sm:h-[18px]" /> About
          </motion.button>

          {exploredLayers.length > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white text-forest-green rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 border border-gray-200"
              >
                <Download size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Export PDF</span><span className="sm:hidden">Export</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white text-forest-green rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 border border-gray-200"
              >
                <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" /> Share
              </motion.button>
            </>
          )}
        </div>
      </div>
      )}

        {/* Main Content Area - SVG Visualization */}
        <div className={`flex-1 relative overflow-y-auto md:h-screen transition-all duration-300 ${isSidebarOpen ? 'md:ml-72 lg:ml-80' : 'md:ml-0'}`}>
          {/* Title Header - Above Model */}
          <div className="w-full bg-gradient-to-b from-white via-white to-gray-50 py-4 sm:py-6 md:py-8 px-4 md:px-8 border-b border-gray-200 shadow-sm sticky top-0 z-20 pt-16 sm:pt-4 md:pt-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 drop-shadow-sm">
                  Forest Ecosystem Layers Explorer
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-3">
                  Interactive Simulation
                </p>
                {selectedPreset && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-forest-green to-forest-light text-white text-sm sm:text-base rounded-lg shadow-md border border-forest-green/20"
                  >
                    <span className="text-white/90 font-medium">Selected forest type:</span>
                    <span className="font-bold">{getPresetById(selectedPreset)?.name}</span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          {/* SVG Rainforest Diagram */}
          <div className="relative h-[60vh] sm:h-[70vh] md:min-h-screen">
            <RainforestSVG 
              controls={controls} 
              onLayerClick={onLayerClick}
              hoveredLayer={hoveredLayer}
              selectedPreset={selectedPreset}
            />
          </div>

        {/* AI-Powered Modules Section - Below Layers */}
        <div className="w-full bg-gradient-to-b from-white to-gray-50 py-8 sm:py-12 md:py-16 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-forest-green mb-2 px-2">
                AI-Powered Learning Tools
              </h2>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg px-2">
                Explore interactive features powered by Gemini AI & Unsplash
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8">
              {/* Forest Simulator - First Module */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => onModuleOpen('simulator')}
                  className="w-full text-left p-4 sm:p-5 md:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-emerald-200 hover:border-emerald-400"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-emerald-200 rounded-lg">
                      <Eye size={20} className="sm:w-6 sm:h-6 text-emerald-700" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-emerald-700">Forest Simulator</h3>
                  </div>
                  <p className="text-emerald-600 text-xs sm:text-sm line-clamp-2">
                    See what your forest would look like based on current model controls with AI predictions
                  </p>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => onModuleOpen('species')}
                  className="w-full text-left p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-blue-200 hover:border-blue-400"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-blue-200 rounded-lg">
                      <Search size={20} className="sm:w-6 sm:h-6 text-blue-700" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-700">Species Explorer</h3>
                  </div>
                  <p className="text-blue-600 text-xs sm:text-sm line-clamp-2">
                    Discover rainforest species with AI-generated insights and real photos from Unsplash
                  </p>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => onModuleOpen('tutor')}
                  className="w-full text-left p-4 sm:p-5 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-purple-200 hover:border-purple-400"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-purple-200 rounded-lg">
                      <Bot size={20} className="sm:w-6 sm:h-6 text-purple-700" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-purple-700">AI Tutor</h3>
                  </div>
                  <p className="text-purple-600 text-xs sm:text-sm line-clamp-2">
                    Get instant answers to your questions about forest ecology from Gemini AI
                  </p>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => onModuleOpen('story')}
                  className="w-full text-left p-4 sm:p-5 md:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-green-200 hover:border-green-400"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-green-200 rounded-lg">
                      <BookOpen size={20} className="sm:w-6 sm:h-6 text-green-700" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-green-700">Story Generator</h3>
                  </div>
                  <p className="text-green-600 text-xs sm:text-sm line-clamp-2">
                    Create personalized educational stories about forest layers with AI
                  </p>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => onModuleOpen('study')}
                  className="w-full text-left p-4 sm:p-5 md:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-yellow-200 hover:border-yellow-400"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-yellow-200 rounded-lg">
                      <GraduationCap size={20} className="sm:w-6 sm:h-6 text-yellow-700" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-yellow-700">Study Guide</h3>
                  </div>
                  <p className="text-yellow-600 text-xs sm:text-sm line-clamp-2">
                    Generate personalized study guides tailored to your selected layers
                  </p>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => onModuleOpen('fieldtrip')}
                  className="w-full text-left p-4 sm:p-5 md:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-indigo-200 hover:border-indigo-400"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-indigo-200 rounded-lg">
                      <MapPin size={20} className="sm:w-6 sm:h-6 text-indigo-700" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-indigo-700">Virtual Field Trip</h3>
                  </div>
                  <p className="text-indigo-600 text-xs sm:text-sm line-clamp-2">
                    Take a guided tour through forest layers with AI descriptions and Unsplash images
                  </p>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => onModuleOpen('climate')}
                  className="w-full text-left p-4 sm:p-5 md:p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-red-200 hover:border-red-400"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-red-200 rounded-lg">
                      <AlertTriangle size={20} className="sm:w-6 sm:h-6 text-red-700" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-red-700">Climate Impact</h3>
                  </div>
                  <p className="text-red-600 text-xs sm:text-sm line-clamp-2">
                    Analyze climate change effects on forest ecosystems with AI-powered insights
                  </p>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4a7c2a;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4a7c2a;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
