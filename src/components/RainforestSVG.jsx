import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { getPresetById } from '../data/indianForestPresets';

const RainforestSVG = ({ controls, onLayerClick, hoveredLayer, selectedPreset }) => {
  const svgRef = useRef(null);
  const preset = selectedPreset ? getPresetById(selectedPreset) : null;
  
  // Layer positions (from top to bottom, as percentages)
  const layers = [
    { id: 'emergent', top: 0, height: 15, label: 'Emergent Layer' },
    { id: 'canopy', top: 15, height: 30, label: 'Canopy Layer' },
    { id: 'understory', top: 45, height: 25, label: 'Understory Layer' },
    { id: 'forest-floor', top: 70, height: 30, label: 'Forest Floor' }
  ];
  
  // Get colors from preset or use defaults
  const getPresetColor = (colorKey) => {
    return preset?.colors?.[colorKey] || {
      trunk: '#4A3728',
      canopy: '#1A5F1A',
      understory: '#2D5016',
      floor: '#3D5F1F'
    }[colorKey];
  };
  
  // Get tree characteristics from preset
  const getTreeCharacteristics = () => {
    if (!preset) return { height: 'medium', density: 'moderate', sparse: false };
    const chars = preset.characteristics;
    return {
      height: chars.treeHeight || 'medium',
      density: chars.density || 'moderate',
      sparse: chars.density === 'very-sparse' || chars.density === 'sparse'
    };
  };
  
  // Helper function to adjust color brightness
  const adjustColorBrightness = (hex, percent) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return "#" + ((R << 16) | (G << 8) | B).toString(16).padStart(6, '0');
  };

  // Calculate automatic light penetration from canopy cover and LAI
  // This ensures layers are truly synchronized: dense canopy = less penetration automatically
  // Enhanced with DART radiative transfer principles: sun angle affects penetration
  const calculateAutomaticLightPenetration = () => {
    const canopyDensityFactor = controls.canopyCover / 100;
    const laiFactor = controls.lai / 10;
    
    // Higher canopy cover and LAI = less automatic penetration
    // Formula: base penetration decreases exponentially with density
    const basePenetration = Math.exp(-0.8 * canopyDensityFactor * (1 + laiFactor));
    
    // Convert to 0-100% scale, with minimum 5% and maximum 100%
    // High canopy cover (100%) and high LAI (10) = ~5% penetration
    // Low canopy cover (0%) and low LAI (0) = ~100% penetration
    const autoPenetration = 5 + (basePenetration * 95);
    
    // Sun angle effect (inspired by DART model)
    // 90 degrees = overhead (maximum penetration)
    // 0 or 180 degrees = horizon (minimum penetration, light hits at angle)
    const sunAngle = controls.sunAngle || 45; // Default 45 if not set
    const angleRad = (sunAngle * Math.PI) / 180;
    // Sin of angle: 1 at 90° (overhead), 0 at 0°/180° (horizon)
    // Adjust for view: we want angle 0-180, where 90 is overhead
    const angleFactor = Math.abs(Math.sin(angleRad));
    // Overhead (90°) = 1.0, low angles (30-150°) = 0.5-0.87, horizon (0/180°) = 0
    
    // The lightPenetration control acts as a solar intensity modifier (0-100%)
    // It multiplies the automatic penetration to account for time of day, weather, etc.
    return (autoPenetration * (controls.lightPenetration / 100) * (0.7 + 0.3 * angleFactor));
  };

  // Calculate biodiversity index based on forest structure (inspired by FVS models)
  // Higher canopy cover + moderate LAI + gaps = higher biodiversity
  const calculateBiodiversity = () => {
    const canopyDensityFactor = controls.canopyCover / 100;
    const laiFactor = controls.lai / 10;
    const gapFactor = Math.min(20, controls.canopyGaps || 0) / 20; // Gaps create diversity
    
    // Biodiversity is highest with:
    // - Moderate-high canopy cover (provides habitat)
    // - Moderate LAI (allows some light through)
    // - Some gaps (creates edge habitat and light patches)
    // Formula: combination of structure factors
    const structureFactor = canopyDensityFactor * 0.4 + laiFactor * 0.3;
    const diversityScore = (structureFactor * 50) + (gapFactor * 30) + 20; // Base diversity
    
    return Math.min(100, Math.max(20, diversityScore));
  };

  // Calculate realistic light levels for each layer based on forest model
  // Using Beer-Lambert law approximation: I = I0 * e^(-k*LAI*canopyDensity)
  const calculateLayerLight = (layerId) => {
    const lightAttenuationCoefficient = 0.5; // Standard for broadleaf forests
    const canopyDensityFactor = controls.canopyCover / 100; // 0-1
    
    // Calculate synchronized light penetration (automatic from structure + user modifier)
    const effectivePenetration = calculateAutomaticLightPenetration() / 100;
    
    // Light at emergent layer (above canopy): ~100% of incident light
    let lightLevel = 100;
    
    if (layerId === 'emergent') {
      // Emergent gets full sunlight, modified by lightPenetration (solar intensity)
      lightLevel = Math.max(90, 100 - (controls.lai * 0.8)) * effectivePenetration;
    } else if (layerId === 'canopy') {
      // Canopy intercepts most light, attenuation based on LAI and canopy cover
      const attenuation = Math.exp(-lightAttenuationCoefficient * controls.lai * canopyDensityFactor);
      lightLevel = (70 + (30 * attenuation)) * (0.7 + 0.3 * (1 - canopyDensityFactor));
      // Also modified by solar intensity
      lightLevel *= effectivePenetration;
    } else if (layerId === 'understory') {
      // Understory gets light that penetrates canopy - fully synchronized with canopy structure
      const canopyTransmission = Math.exp(-lightAttenuationCoefficient * controls.lai * canopyDensityFactor * 1.5);
      // Light penetration is now calculated automatically, not independent
      lightLevel = 5 + (10 * canopyTransmission * effectivePenetration);
      // Minimum light even with dense canopy
      lightLevel = Math.max(2, Math.min(15, lightLevel));
    } else if (layerId === 'forest-floor') {
      // Forest floor gets least light - fully synchronized with canopy structure
      const floorTransmission = Math.exp(-lightAttenuationCoefficient * controls.lai * canopyDensityFactor * 2);
      // Light penetration is now calculated automatically
      lightLevel = 1 + (2 * floorTransmission * effectivePenetration);
      // Minimum floor light
      lightLevel = Math.max(0.5, Math.min(5, lightLevel));
    }
    
    return lightLevel;
  };

  const getLayerOpacity = (layerId) => {
    if (layerId === 'canopy') {
      // Higher canopy cover and LAI = denser = more opaque
      const densityFactor = (controls.canopyCover / 100) * 0.7 + (controls.lai / 10) * 0.3;
      return Math.min(0.95, Math.max(0.3, 0.3 + densityFactor * 0.65));
    }
    // Other layers: opacity inversely related to their light levels
    const lightLevel = calculateLayerLight(layerId);
    if (layerId === 'emergent') {
      return 0.9; // Always relatively visible
    }
    // Lower light = more visible (paradoxical but makes sense for visualization)
    // Actually: higher light penetration = more visible layers below
    const effectivePenetration = calculateAutomaticLightPenetration() / 100;
    return 0.7 + (0.3 * effectivePenetration);
  };

  const getLayerBrightness = (layerId) => {
    const lightLevel = calculateLayerLight(layerId);
    // Brightness directly corresponds to light level
    // Map light level (0-100%) to brightness (10-100%)
    return Math.max(10, Math.min(100, 10 + (lightLevel * 0.9)));
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const tl = gsap.timeline({ repeat: -1, paused: false }); // Infinite loop

    // Calculate dynamic wind effects based on forest structure
    // Higher LAI and canopy cover = more wind resistance = less sway
    // Emergent layer experiences more wind than canopy
    const windResistance = 1 + (controls.canopyCover / 100) * 0.5 + (controls.lai / 10) * 0.3;
    const emergentWindForce = 1.5 / windResistance; // Emergent gets more wind
    const canopyWindForce = 1.0 / windResistance;
    const understoryWindForce = 0.5 / windResistance; // Understory protected
    
    // Wind duration increases with density (denser forests respond slower)
    const windDuration = 2 + (controls.canopyCover / 100) * 2;
    
    // Master timeline: Staggered wind cycle (dynamic based on density)
    tl.to('.tree-trunk.emergent-tree', {
      rotation: () => -emergentWindForce - controls.lai * 0.05,
      duration: windDuration,
      ease: 'power2.inOut',
      stagger: { amount: 1, from: 'random' }
    })
    .to('.tree-trunk.canopy-tree', {
      rotation: () => -canopyWindForce - controls.lai * 0.03,
      duration: windDuration * 1.2,
      ease: 'power2.inOut',
      stagger: { amount: 1.2, from: 'random' }
    }, '-=1')
    .to('.tree-trunk.understory-tree', {
      rotation: () => -understoryWindForce - controls.lai * 0.02,
      duration: windDuration * 1.5,
      ease: 'power2.inOut',
      stagger: { amount: 1.5, from: 'random' }
    }, '-=1.5')
    .to('.tree-crown.emergent-crown', {
      scaleY: 1 + (0.08 / windResistance), // Less sway in dense forests
      y: -5 / windResistance,
      duration: 1.5,
      ease: 'elastic.out(1, 0.3)'
    }, '-=1')
    .to('.tree-crown.canopy-crown', {
      scaleY: 1 + (0.05 / windResistance),
      y: -3 / windResistance,
      duration: 1.5 * windResistance,
      ease: 'elastic.out(1, 0.3)'
    }, '-=1')
    .to('.tree-crown.understory-crown', {
      scaleY: 1 + (0.03 / windResistance),
      y: -2 / windResistance,
      duration: 1.8 * windResistance,
      ease: 'elastic.out(1, 0.3)'
    }, '-=1.2')
    .to('.light-ray', {
      scaleY: 1 + controls.lightPenetration / 100,
      opacity: 0.8,
      duration: 3,
      ease: 'sine.inOut'
    }, 0)
    .to('.sun-core', {
      scale: 1.1,
      fill: '#FFEB3B',
      duration: 4,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut'
    }, 1)
    .to('.tree-trunk', {
      rotationX: 2 / windResistance,
      transformOrigin: '50% 100%',
      duration: 3 + controls.canopyCover / 20,
      ease: 'back.out(1.7)',
      stagger: 0.2
    }, 0)
    .to('.fog', {
      scaleX: 1.2,
      x: -50,
      duration: 8 + (controls.lai / 2), // Fog moves slower in dense forests
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    }, 0)
    .to('.cloud', {
      x: '+=100',
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: 'none'
    }, 0);

    // Animate falling leaves with stagger (separate animation for repeat)
    gsap.fromTo('.falling-leaf', 
      { y: 0, rotation: 0, opacity: 1, scale: 0 },
      { 
        y: 600, 
        rotation: 720, 
        opacity: 0, 
        scale: 1,
        duration: 4,
        stagger: 0.5,
        ease: 'power2.in',
        repeat: -1,
        repeatDelay: 2
      }
    );

    // Animate light rays with stagger
    gsap.to('.light-ray', {
      opacity: 0.8,
      duration: 1,
      stagger: 0.1,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });


    // Cleanup
    return () => {
      tl.kill();
      gsap.killTweensOf('.tree-trunk, .tree-crown, .light-ray, .sun-core, .fog, .cloud, .falling-leaf, .sun-halo, .emergent-tree, .emergent-crown, .canopy-tree, .canopy-crown, .understory-tree, .understory-crown');
    };
  }, [controls]); // Re-run on controls change

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50">
      <svg
        ref={svgRef}
        viewBox="0 0 1000 800"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        {/* Background sky gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="50%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </linearGradient>
          
          {/* Tree trunk gradient - dynamic based on preset */}
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={getPresetColor('trunk')} />
            <stop offset="100%" stopColor={getPresetColor('trunk')} stopOpacity="0.8" />
          </linearGradient>

          {/* Sun gradient */}
          <radialGradient id="sunGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="70%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF8C00" />
          </radialGradient>

          {/* Light ray gradient */}
          <linearGradient id="lightRayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFACD" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFE4B5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFE4B5" stopOpacity="0.2" />
          </linearGradient>

          {/* Canopy filter for density */}
          <filter id="canopyDensity">
            <feGaussianBlur stdDeviation={controls.canopyCover / 20} />
          </filter>

          {/* Leaf shape for falling leaves - dynamic based on preset */}
          <path id="leaf" d="M0 0 Q5 3 10 0 T20 0 Q15 -3 10 -6 T0 0 Z" fill={getPresetColor('canopy')} />
        </defs>

        {/* Sky background */}
        <rect x="0" y="0" width="1000" height="800" fill="url(#skyGradient)" />

        {/* Drifting Clouds */}
        <ellipse
          className="cloud"
          cx="200"
          cy="100"
          rx="40"
          ry="20"
          fill="white"
          opacity="0.7"
        />
        <ellipse
          className="cloud"
          cx="700"
          cy="80"
          rx="30"
          ry="15"
          fill="white"
          opacity="0.6"
        />

        {/* Sun - Position based on sun angle (inspired by DART model) */}
        {(() => {
          const sunAngle = controls.sunAngle || 45; // 0-180, where 90 = overhead
          // Convert angle to sun position
          // 90° = overhead (center top), 0° = far left, 180° = far right
          const angleRad = ((sunAngle - 90) * Math.PI) / 180; // Offset so 90° = 0 rad
          const sunX = 500 + Math.cos(angleRad) * 400; // Move along arc
          const sunY = 50 + Math.abs(Math.sin(angleRad)) * 100; // Vertical position
          const sunIntensity = Math.abs(Math.sin((sunAngle * Math.PI) / 180)); // Intensity based on angle
          
          return (
        <g id="sun" ref={(el) => { if (el) gsap.set(el, { rotation: 0 }); }}>
          <circle
                cx={sunX}
                cy={sunY}
                r={35 * (0.7 + 0.3 * sunIntensity)}
            fill="url(#sunGradient)"
            className="sun-core"
                opacity={0.8 + 0.2 * sunIntensity}
          />
          <circle
                cx={sunX}
                cy={sunY}
                r={45 * (0.7 + 0.3 * sunIntensity)}
            fill="#FFD700"
                opacity={0.3 * sunIntensity}
            className="sun-halo"
          />
          {/* Rays as paths for smoother animation */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
                const x1 = sunX + Math.cos(rad) * 35;
                const y1 = sunY + Math.sin(rad) * 35;
                const effectivePenetration = calculateAutomaticLightPenetration() / 100;
                const x2 = sunX + Math.cos(rad) * (50 + effectivePenetration * 50);
                const y2 = sunY + Math.sin(rad) * (50 + effectivePenetration * 50);
            return (
              <path
                key={`sunray-${i}`}
                d={`M ${x1} ${y1} L ${x2} ${y2}`}
                stroke="#FFD700"
                strokeWidth="2"
                className="light-ray"
                    opacity={0.6 * sunIntensity * effectivePenetration}
              />
            );
          })}
        </g>
          );
        })()}
        
        {/* Canopy Gaps - Light patches from tree falls (inspired by FORMIND gap dynamics) */}
        {controls.canopyGaps > 0 && (() => {
          const gaps = Math.floor(controls.canopyGaps || 0);
          const effectivePenetration = calculateAutomaticLightPenetration();
          
          return Array.from({ length: gaps }, (_, i) => {
            // Random positions for gaps
            const gapX = 200 + (i * 150) % 600; // Spread across width
            const gapY = 250 + (i * 80) % 250; // In canopy/understory area
            const gapSize = 60 + (i % 3) * 20; // Varying sizes
            
            // Gap size affects light intensity
            const gapIntensity = 0.3 + (effectivePenetration / 100) * 0.5;
            
            return (
              <g key={`gap-${i}`}>
                {/* Light patch from gap */}
                <ellipse
                  cx={gapX}
                  cy={gapY}
                  rx={gapSize}
                  ry={gapSize * 0.6}
                  fill="#FFFACD"
                  opacity={gapIntensity}
                  style={{
                    mixBlendMode: 'screen',
                    filter: 'blur(8px)'
                  }}
                />
                {/* Light ray from gap to forest floor */}
                <ellipse
                  cx={gapX}
                  cy={650 + (i % 2) * 80}
                  rx={gapSize * 0.8}
                  ry={20}
                  fill="#FFE4B5"
                  opacity={gapIntensity * 0.6}
                  style={{
                    mixBlendMode: 'screen',
                    filter: 'blur(5px)'
                  }}
                />
                {/* Understory plants growing in gap */}
                {effectivePenetration > 20 && (
                  <ellipse
                    cx={gapX}
                    cy={650 + (i % 2) * 80}
                    rx={25 + (i % 2) * 10}
                    ry={15 + (i % 2) * 8}
                    fill="#6B8E23"
                    opacity={0.6 + (effectivePenetration / 100) * 0.3}
                  />
                )}
              </g>
            );
          });
        })()}

          {/* Light rays from sun - dynamic based on realistic light attenuation */}
        {/* Rays are drawn before trees so they appear to shine through */}
        <g id="lightRays">
            {/* Calculate realistic light penetration based on canopy cover and LAI */}
          {(() => {
              // Calculate actual light transmission through layers
              const emergentLight = calculateLayerLight('emergent');
              const canopyLight = calculateLayerLight('canopy');
              const understoryLight = calculateLayerLight('understory');
              const floorLight = calculateLayerLight('forest-floor');
              
              // Ray depths based on actual light levels (in pixels)
            const emergentStop = 120;
              const canopyStop = 400;
              const understoryStop = 600;
            const floorStop = 750;
              
              // Calculate effective penetration depth based on light levels
              // Light penetration is now automatically calculated from canopy structure
              const effectivePenetration = calculateAutomaticLightPenetration() / 100;
              const penetrationModifier = effectivePenetration;
              
              // Canopy transmission based on LAI and canopy cover (realistic attenuation)
              const lightAttenuationCoefficient = 0.5;
              const canopyDensityFactor = controls.canopyCover / 100;
              const canopyTransmission = Math.exp(-lightAttenuationCoefficient * controls.lai * canopyDensityFactor);
              
              // Calculate ray depth based on effective light penetration
              let rayDepth;
              if (floorLight * penetrationModifier > 2) {
                rayDepth = emergentStop + (floorStop - emergentStop) * (floorLight * penetrationModifier / 5);
              } else if (understoryLight * penetrationModifier > 2) {
                rayDepth = emergentStop + (understoryStop - emergentStop) * (understoryLight * penetrationModifier / 15);
              } else if (canopyLight * penetrationModifier > 50) {
                rayDepth = emergentStop + (canopyStop - emergentStop) * ((canopyLight * penetrationModifier - 50) / 50);
              } else {
                rayDepth = emergentStop + (canopyStop - emergentStop) * 0.3;
              }
              
              // Blockage factor based on canopy cover and LAI
              const blockageFactor = Math.max(0.2, canopyTransmission * (1 - canopyDensityFactor * 0.5));
              
              // Number of rays based on available light
              const rayCount = Math.floor(5 + (emergentLight / 100) * 5);
              const raySpread = 350;
            
            return Array.from({ length: rayCount }, (_, i) => {
              const offset = (i - (rayCount - 1) / 2) * (raySpread / (rayCount - 1));
              const startX = 500 + offset * 0.3;
              const endX = 500 + offset;
                const endY = Math.min(rayDepth, floorStop);
                
                // Opacity based on depth and light transmission
                const depthRatio = (endY - emergentStop) / (floorStop - emergentStop);
                const depthFade = 1 - depthRatio * 0.6; // Fade with depth
                
                // Base opacity depends on light level at that depth
                let layerOpacity;
                if (endY < canopyStop) {
                  layerOpacity = emergentLight / 100;
                } else if (endY < understoryStop) {
                  layerOpacity = canopyLight / 100;
                } else if (endY < floorStop) {
                  layerOpacity = understoryLight / 100;
                } else {
                  layerOpacity = floorLight / 100;
                }
                
                const baseOpacity = Math.min(0.8, layerOpacity * blockageFactor * depthFade * penetrationModifier);
                const rayOpacity = Math.max(0.15, baseOpacity);
                
                // Ray width decreases with depth
                const rayWidth = 5 - (depthRatio * 2) - Math.abs(offset) / 100;
              
              return (
                <line
                  key={`ray-${i}`}
                  x1={startX}
                  y1={50}
                  x2={endX}
                  y2={endY}
                  stroke="#FFE4B5"
                    strokeWidth={Math.max(1, rayWidth)}
                  strokeLinecap="round"
                  opacity={rayOpacity}
                  style={{
                      filter: endY > understoryStop ? 'blur(2px)' : 'blur(1px)'
                  }}
                />
              );
            });
          })()}
          
          {/* Additional scattered light rays - based on actual light levels */}
          {(() => {
            const understoryLight = calculateLayerLight('understory');
            const floorLight = calculateLayerLight('forest-floor');
            const penetrationModifier = calculateAutomaticLightPenetration() / 100;
            
            // Show scattered rays if there's sufficient light in understory
            if (understoryLight * penetrationModifier > 5) {
              const lightAttenuationCoefficient = 0.5;
              const canopyDensityFactor = controls.canopyCover / 100;
              const canopyTransmission = Math.exp(-lightAttenuationCoefficient * controls.lai * canopyDensityFactor);
              const blockageFactor = Math.max(0.2, canopyTransmission * (1 - canopyDensityFactor * 0.5));
              
              return (
            <>
              {[-180, -120, -60, 60, 120, 180].map((offset, i) => {
                    // Ray depth based on actual light penetration
                    const rayDepth = understoryLight * penetrationModifier > 10 
                      ? 600 + (floorLight * penetrationModifier / 5) * 150
                      : 500 + (understoryLight * penetrationModifier / 5) * 100;
                    
                    const baseOpacity = (understoryLight / 100) * blockageFactor * penetrationModifier * 0.6;
                    const opacity = Math.max(0.1, baseOpacity);
                
                return (
                  <line
                    key={`scattered-ray-${i}`}
                    x1={500 + offset * 0.2}
                    y1={50}
                    x2={500 + offset * 0.8}
                        y2={Math.min(rayDepth, 750)}
                    stroke="#FFFACD"
                        strokeWidth={Math.max(1.5, 3 - Math.abs(offset) / 100)}
                    strokeLinecap="round"
                    opacity={opacity}
                    style={{
                          filter: rayDepth > 550 ? 'blur(2.5px)' : 'blur(2px)'
                    }}
                  />
                );
              })}
            </>
              );
            }
            return null;
          })()}
          
          {/* Ambient light glow - extends based on actual light penetration */}
          {(() => {
            const floorLight = calculateLayerLight('forest-floor');
            const penetrationModifier = calculateAutomaticLightPenetration() / 100;
            
            if (floorLight * penetrationModifier > 1) {
              const lightAttenuationCoefficient = 0.5;
              const canopyDensityFactor = controls.canopyCover / 100;
              const canopyTransmission = Math.exp(-lightAttenuationCoefficient * controls.lai * canopyDensityFactor);
              const blockageFactor = Math.max(0.3, canopyTransmission * (1 - canopyDensityFactor * 0.5));
              
              const glowDepth = 50 + (floorLight * penetrationModifier / 5) * 350;
              const glowSize = 150 + (floorLight * penetrationModifier / 5) * 200;
              
              return (
            <ellipse
              cx="500"
                  cy={glowDepth}
                  rx={glowSize}
                  ry={(floorLight * penetrationModifier / 5) * 300}
              fill="#FFFACD"
                  opacity={0.1 * blockageFactor * penetrationModifier}
              style={{
                mixBlendMode: 'screen'
              }}
            />
              );
            }
            return null;
          })()}
        </g>

        {/* Main tall tree (center-left) - Dynamic based on LAI */}
        <g id="mainTree">
          {/* Trunk - size based on LAI */}
          <rect 
            className="tree-trunk" 
            x={480 - controls.lai * 0.5} 
            y={400 - controls.lai * 2} 
            width={40 + controls.lai * 1} 
            height={350 + controls.lai * 10} 
            fill="url(#trunkGradient)" 
          />
          
          {/* Forest Floor - Dynamic based on light penetration */}
          <g id="groundPlants">
            {/* Ground plants appear based on light penetration (more light = more vegetation) */}
            {(() => {
              const floorLight = calculateLayerLight('forest-floor');
              const effectivePenetration = calculateAutomaticLightPenetration();
              const plantOpacity = 0.5 + (floorLight / 5) * 0.3; // More light = more visible plants
              const plantSizeMultiplier = 1 + (effectivePenetration / 100) * 0.5;
              
              return (
                <>
                  {/* Large leaves - density based on light (synchronized with floor light) */}
                  {floorLight > 1.5 && (
                    <ellipse cx="400" cy="750" rx={50 * plantSizeMultiplier} ry={30 * plantSizeMultiplier} fill={getPresetColor('floor')} opacity={plantOpacity} />
                  )}
                  
                  {floorLight > 2.5 && (
                    <ellipse cx="560" cy="760" rx={45 * plantSizeMultiplier} ry={35 * plantSizeMultiplier} fill={adjustColorBrightness(getPresetColor('floor'), -5)} opacity={plantOpacity} />
                  )}
                  
                  {floorLight > 3.5 && (
                    <ellipse cx="520" cy="770" rx={40 * plantSizeMultiplier} ry={25 * plantSizeMultiplier} fill={adjustColorBrightness(getPresetColor('floor'), 10)} opacity={plantOpacity * 0.9} />
                  )}
                  
                  {/* Ferns - appear with moderate light (synchronized) */}
                  {floorLight > 2 && (
                    <path d={`M 350 750 Q 350 ${730 - controls.lai * 2} 360 ${720 - controls.lai * 2} Q 350 ${730 - controls.lai * 2} 340 ${720 - controls.lai * 2} Q 350 ${730 - controls.lai * 2} 350 750`} 
                          fill={getPresetColor('floor')} opacity={plantOpacity * 0.8} />
                  )}
                  
                  {floorLight > 3 && (
                    <path d={`M 620 760 Q 620 ${740 - controls.lai * 2} 630 ${730 - controls.lai * 2} Q 620 ${740 - controls.lai * 2} 610 ${730 - controls.lai * 2} Q 620 ${740 - controls.lai * 2} 620 760`} 
                          fill={adjustColorBrightness(getPresetColor('floor'), -10)} opacity={plantOpacity * 0.8} />
                  )}
                  
                  {/* Leaf litter - increases with LAI and canopy cover */}
                  {controls.lai > 1 && (
                    <g opacity={0.3 + (controls.lai / 10) * 0.3}>
                      <ellipse cx="380" cy="775" rx={3 + controls.lai * 0.3} ry={2 + controls.lai * 0.2} fill={adjustColorBrightness(getPresetColor('trunk'), 20)} />
                      <ellipse cx="540" cy="778" rx={2.5 + controls.lai * 0.25} ry={1.5 + controls.lai * 0.15} fill={adjustColorBrightness(getPresetColor('trunk'), 10)} />
                      <ellipse cx="485" cy="780" rx={3 + controls.lai * 0.3} ry={2 + controls.lai * 0.2} fill={getPresetColor('trunk')} />
                    </g>
                  )}
                </>
              );
            })()}
          </g>

          {/* Understory Layer (45-70%) - Dynamic based on light penetration */}
          <g 
            id="understory" 
            className="layer-group understory"
            opacity={getLayerOpacity('understory')} 
            style={{ filter: `brightness(${getLayerBrightness('understory')}%)`, transformOrigin: '500px 550px' }}
          >
            {/* Understory trees - appear based on calculated light levels (synchronized) */}
            {(() => {
              const understoryLight = calculateLayerLight('understory');
              return (
                <>
                  {understoryLight > 3 && (
                    <>
                      <rect className="tree-trunk understory-tree" x="300" y="500" width={25 + controls.lai * 0.5} height={200 + controls.lai * 5} fill={getPresetColor('trunk')} />
                      <ellipse className="tree-crown understory-crown" cx="312" cy="550" rx={35 + controls.lai * 1.5} ry={25 + controls.lai} fill={getPresetColor('understory')} opacity={0.7 + (understoryLight / 15) * 0.2} />
                    </>
                  )}
                  
                  {understoryLight > 6 && (
                    <>
                      <rect className="tree-trunk understory-tree" x="650" y="520" width={30 + controls.lai * 0.6} height={180 + controls.lai * 4} fill={getPresetColor('trunk')} />
                      <ellipse className="tree-crown understory-crown" cx="665" cy="570" rx={40 + controls.lai * 2} ry={30 + controls.lai * 1.2} fill={adjustColorBrightness(getPresetColor('understory'), -10)} opacity={0.6 + (understoryLight / 15) * 0.25} />
                    </>
                  )}
                  
                  {/* Palm-like plants - density based on calculated light (synchronized) */}
                  {understoryLight > 5 && (
                    <>
                      <ellipse className="tree-crown understory-crown" cx="420" cy="580" rx={20 + controls.lai * 1} ry={60 + controls.lai * 2} fill={getPresetColor('understory')} opacity={0.5 + (understoryLight / 15) * 0.3} />
                    </>
                  )}
                  
                  {understoryLight > 8 && (
                    <ellipse className="tree-crown understory-crown" cx="580" cy="590" rx={18 + controls.lai * 0.8} ry={55 + controls.lai * 1.8} fill={adjustColorBrightness(getPresetColor('understory'), -10)} opacity={0.4 + (understoryLight / 15) * 0.3} />
                  )}
                </>
              );
            })()}
            
            {/* Vines hanging - more vines with higher LAI and canopy cover */}
            {controls.lai > 2 && (
              <>
            <path d="M 500 400 Q 480 450 460 500 Q 440 550 420 600" 
                      stroke={getPresetColor('understory')} strokeWidth={2 + controls.lai * 0.2} fill="none" opacity={0.4 + (controls.canopyCover / 100) * 0.2} />
              </>
            )}
            
            {controls.lai > 3 && controls.canopyCover > 40 && (
            <path d="M 520 420 Q 540 470 560 520 Q 580 570 600 620" 
                    stroke={adjustColorBrightness(getPresetColor('understory'), -15)} strokeWidth={1.5 + controls.lai * 0.15} fill="none" opacity={0.3 + (controls.canopyCover / 100) * 0.2} />
            )}
          </g>

          {/* Canopy Layer (15-45%) - Animated with sway */}
          <g 
            id="canopy" 
            className="layer-group canopy"
            opacity={getLayerOpacity('canopy')} 
            style={{ filter: `brightness(${getLayerBrightness('canopy')}%)`, transformOrigin: '500px 400px' }}
            filter={controls.canopyCover > 50 ? "url(#canopyDensity)" : ""}
          >
            {/* Main tree crown - size based on LAI, opacity based on canopy cover */}
            <ellipse 
              className="tree-crown canopy-crown"
              cx="500" 
              cy="280" 
              rx={80 + controls.lai * 5} 
              ry={60 + controls.lai * 3} 
              fill={getPresetColor('canopy')} 
              opacity={0.3 + (controls.canopyCover / 100) * 0.6}
            />
            
            {/* Dynamic overlapping crowns - number and size based on canopy cover and LAI */}
            {(() => {
              // Calculate number of overlapping crowns based on canopy cover
              const baseCrownCount = 10;
              const densityMultiplier = controls.canopyCover / 100;
              const laiMultiplier = controls.lai / 10;
              const totalCrowns = Math.floor(baseCrownCount * (0.5 + densityMultiplier * 0.5) * (0.7 + laiMultiplier * 0.3));
              
              // Generate crowns with positions and sizes that vary with LAI
              const canopyColor = getPresetColor('canopy');
              const understoryColor = getPresetColor('understory');
              // Create color variations for depth
              const colorVariations = [
                canopyColor,
                understoryColor,
                // Darker variations
                adjustColorBrightness(canopyColor, -10),
                adjustColorBrightness(canopyColor, -20),
                adjustColorBrightness(understoryColor, -10),
                adjustColorBrightness(understoryColor, -20)
              ];
              
              const crownPositions = [
                // Left overlapping crowns
                { cx: 455, cy: 285, baseRx: 58, baseRy: 45, fill: colorVariations[0], baseOpacity: 0.75 },
                { cx: 465, cy: 275, baseRx: 52, baseRy: 40, fill: colorVariations[1], baseOpacity: 0.7 },
                { cx: 475, cy: 295, baseRx: 48, baseRy: 38, fill: colorVariations[2], baseOpacity: 0.65 },
                // Right overlapping crowns
                { cx: 535, cy: 275, baseRx: 62, baseRy: 50, fill: colorVariations[2], baseOpacity: 0.8 },
                { cx: 525, cy: 265, baseRx: 56, baseRy: 42, fill: colorVariations[0], baseOpacity: 0.7 },
                { cx: 545, cy: 290, baseRx: 54, baseRy: 44, fill: colorVariations[1], baseOpacity: 0.75 },
                // Center overlapping crowns
                { cx: 490, cy: 265, baseRx: 50, baseRy: 38, fill: colorVariations[0], baseOpacity: 0.7 },
                { cx: 495, cy: 280, baseRx: 48, baseRy: 36, fill: colorVariations[1], baseOpacity: 0.75 },
                { cx: 505, cy: 270, baseRx: 52, baseRy: 40, fill: colorVariations[2], baseOpacity: 0.7 },
                { cx: 510, cy: 285, baseRx: 46, baseRy: 35, fill: colorVariations[3], baseOpacity: 0.65 },
                // Additional dense crowns
                { cx: 470, cy: 290, baseRx: 44, baseRy: 34, fill: colorVariations[3], baseOpacity: 0.6 },
                { cx: 530, cy: 285, baseRx: 50, baseRy: 40, fill: colorVariations[0], baseOpacity: 0.7 },
                { cx: 485, cy: 275, baseRx: 42, baseRy: 32, fill: colorVariations[2], baseOpacity: 0.65 },
                { cx: 515, cy: 285, baseRx: 48, baseRy: 37, fill: colorVariations[1], baseOpacity: 0.7 },
                { cx: 480, cy: 290, baseRx: 46, baseRy: 35, fill: colorVariations[0], baseOpacity: 0.68 },
                { cx: 520, cy: 280, baseRx: 49, baseRy: 38, fill: colorVariations[1], baseOpacity: 0.72 }
              ];
              
              return crownPositions.slice(0, totalCrowns).map((crown, i) => (
                <ellipse 
                  key={`canopy-crown-${i}`}
                  cx={crown.cx} 
                  cy={crown.cy} 
                  rx={crown.baseRx + controls.lai * 2} 
                  ry={crown.baseRy + controls.lai * 1.5} 
                  fill={crown.fill} 
                  opacity={crown.baseOpacity * (0.7 + densityMultiplier * 0.3)}
                />
              ));
            })()}
            
            {/* Additional trees in canopy with trunks - density based on canopy cover */}
            {controls.canopyCover > 30 && (
              <>
                <rect className="tree-trunk canopy-tree" x="200" y="350" width={30 + controls.lai * 1} height={150 + controls.lai * 10} fill={getPresetColor('trunk')} />
                <ellipse className="tree-crown canopy-crown" cx="215" cy="400" rx={45 + controls.lai * 2} ry={35 + controls.lai * 1.5} fill={adjustColorBrightness(getPresetColor('canopy'), -5)} opacity={0.6 + (controls.canopyCover / 100) * 0.2} />
                <ellipse cx="205" cy="380" rx={35 + controls.lai * 1.5} ry={25 + controls.lai} fill={getPresetColor('canopy')} opacity={0.55 + (controls.canopyCover / 100) * 0.2} />
              </>
            )}
            
            {controls.canopyCover > 50 && (
              <>
                <rect className="tree-trunk canopy-tree" x="720" y="340" width={35 + controls.lai * 1.2} height={160 + controls.lai * 12} fill={getPresetColor('trunk')} />
                <ellipse className="tree-crown canopy-crown" cx="737" cy="390" rx={50 + controls.lai * 2.5} ry={40 + controls.lai * 2} fill={getPresetColor('canopy')} opacity={0.6 + (controls.canopyCover / 100) * 0.2} />
                <ellipse cx="727" cy="370" rx={40 + controls.lai * 2} ry={30 + controls.lai * 1.5} fill={adjustColorBrightness(getPresetColor('canopy'), -15)} opacity={0.55 + (controls.canopyCover / 100) * 0.2} />
              </>
            )}
            
            {/* Even more overlapping crowns on the sides - appear with higher canopy cover */}
            {controls.canopyCover > 60 && (
              <>
                <ellipse className="tree-crown canopy-crown" cx="220" cy="395" rx={38 + controls.lai * 1.8} ry={30 + controls.lai * 1.3} fill={getPresetColor('understory')} opacity={0.45 + (controls.canopyCover / 100) * 0.2} />
                <ellipse className="tree-crown canopy-crown" cx="742" cy="385" rx={42 + controls.lai * 2} ry={33 + controls.lai * 1.5} fill={adjustColorBrightness(getPresetColor('canopy'), -5)} opacity={0.5 + (controls.canopyCover / 100) * 0.2} />
              </>
            )}
            
            {/* More vines from canopy */}
            <path d="M 500 350 Q 490 380 480 410 Q 470 440 460 470" 
                  stroke={getPresetColor('understory')} strokeWidth="2" fill="none" opacity="0.5" />

            {/* Falling Leaves in Canopy - number based on LAI and canopy cover */}
            {[...Array(Math.floor(8 + (controls.canopyCover / 100) * 10 + (controls.lai / 10) * 5))].map((_, i) => (
              <use
                key={`canopy-leaf-${i}`}
                href="#leaf"
                x={450 + (i * 50)}
                y={300 + (i * 30)}
                className="falling-leaf"
                style={{ 
                  filter: `brightness(${getLayerBrightness('canopy')}%)`,
                  transform: `scale(${1 + controls.lai * 0.05})`
                }}
              />
            ))}
          </g>

          {/* Emergent Layer (0-15%) - Dynamic based on LAI and canopy cover */}
          <g 
            id="emergent" 
            className="layer-group emergent"
            opacity={getLayerOpacity('emergent')} 
            style={{ filter: `brightness(${getLayerBrightness('emergent')}%)`, transformOrigin: '500px 400px' }}
          >
            {/* Extended trunk - size based on LAI */}
            <rect className="tree-trunk emergent-tree" x="490" y="120" width={20 + controls.lai * 0.5} height={280 + controls.lai * 8} fill={getPresetColor('trunk')} />
            
            {/* Emergent crown - size based on LAI */}
            <ellipse 
              className="tree-crown emergent-crown"
              cx="500" 
              cy="150" 
              rx={50 + controls.lai * 3} 
              ry={40 + controls.lai * 2} 
              fill={adjustColorBrightness(getPresetColor('canopy'), -15)} 
              opacity={0.85 + (controls.lai / 10) * 0.1}
            />
            
            {/* Sunlight highlights on emergent - intensity based on light level */}
            {(() => {
              const emergentLight = calculateLayerLight('emergent');
              const highlightOpacity = 0.4 + (emergentLight / 100) * 0.4;
              return (
                <>
                  <ellipse cx="495" cy="145" rx={30 + controls.lai * 1} ry={25 + controls.lai * 0.8} fill={adjustColorBrightness(getPresetColor('canopy'), 10)} opacity={highlightOpacity} />
                  <ellipse cx="505" cy="155" rx={25 + controls.lai * 0.8} ry={20 + controls.lai * 0.6} fill={adjustColorBrightness(getPresetColor('canopy'), 20)} opacity={highlightOpacity * 0.7} />
                </>
              );
            })()}
            
            {/* Additional emergent tree (left) - appears with higher canopy cover */}
            {controls.canopyCover > 40 && (
              <>
                <rect className="tree-trunk emergent-tree" x="150" y={180 - controls.lai * 2} width={25 + controls.lai * 0.6} height={220 + controls.lai * 6} fill={getPresetColor('trunk')} />
                <ellipse className="tree-crown emergent-crown" cx="162" cy={220 - controls.lai * 1} rx={45 + controls.lai * 2.5} ry={35 + controls.lai * 1.8} fill={adjustColorBrightness(getPresetColor('canopy'), -15)} opacity={0.8 + (controls.canopyCover / 100) * 0.1} />
                <ellipse cx="157" cy={200 - controls.lai * 1} rx={35 + controls.lai * 2} ry={28 + controls.lai * 1.5} fill={adjustColorBrightness(getPresetColor('canopy'), 5)} opacity={0.4 + (controls.lai / 10) * 0.1} />
              </>
            )}

            {/* Falling Leaves - number based on LAI and canopy cover */}
            {[...Array(Math.floor(5 + (controls.canopyCover / 100) * 8 + (controls.lai / 10) * 3))].map((_, i) => (
              <use
                key={`emergent-leaf-${i}`}
                href="#leaf"
                x={450 + (i * 50)}
                y={150 + (i * 30)}
                className="falling-leaf"
                style={{ 
                  filter: `brightness(${getLayerBrightness('emergent')}%)`,
                  transform: `scale(${1 + controls.lai * 0.05})`
                }}
              />
            ))}
          </g>
        </g>

        {/* Fog in Understory - density based on humidity and light (higher canopy cover = more fog) */}
        {(() => {
          // Fog is more dense with higher canopy cover (creates moisture) but less visible with more light
          const fogDensity = (controls.canopyCover / 100) * 0.15; // More canopy = more fog
          const effectivePenetration = calculateAutomaticLightPenetration() / 100;
          const fogOpacity = Math.max(0.05, fogDensity - effectivePenetration * 0.05);
          
          return (
        <rect 
          className="fog" 
          fill="rgba(139,69,19,0.1)" 
          x="0" 
          y={(layers[2].top / 100) * 800} 
          width="1000" 
          height={(layers[2].height / 100) * 800} 
              opacity={fogOpacity}
        />
          );
        })()}

        {/* Layer separation lines - Enhanced */}
        {layers.map((layer, index) => {
          if (index === 0) return null; // Skip first line
          const yPos = (layer.top / 100) * 800;
          const isHovered = hoveredLayer === layer.id;
          
          // Layer-specific colors
          const layerBorderColors = {
            'emergent': '#FFA500',
            'canopy': '#4A7C2A',
            'understory': '#556B2F',
            'forest-floor': '#8B6F47'
          };
          
          return (
            <line
              key={`divider-${index}`}
              className={`layer-divider-${layer.id}`}
              x1="0"
              y1={yPos}
              x2="980"
              y2={yPos}
              stroke={isHovered ? (layerBorderColors[layer.id] || '#4A7C2A') : '#666'}
              strokeWidth={isHovered ? 3 : 2}
              strokeDasharray="10,5"
              opacity={isHovered ? 0.8 : 0.4}
              style={{
                transition: 'all 0.3s ease'
              }}
            />
          );
        })}

        {/* Clickable layer zones - Enhanced hover effects */}
        {layers.map((layer) => {
          const yPos = (layer.top / 100) * 800;
          const height = (layer.height / 100) * 800;
          const isHovered = hoveredLayer === layer.id;
          
          // Layer-specific hover colors
          const hoverColors = {
            'emergent': { light: 'rgba(255, 248, 220, 0.1)', border: '#FFA500' },
            'canopy': { light: 'rgba(240, 255, 240, 0.15)', border: '#4A7C2A' },
            'understory': { light: 'rgba(245, 255, 250, 0.15)', border: '#556B2F' },
            'forest-floor': { light: 'rgba(250, 240, 230, 0.15)', border: '#8B6F47' }
          };
          
          const hoverColor = hoverColors[layer.id] || { light: 'rgba(74, 124, 42, 0.1)', border: '#4A7C2A' };
          
          return (
            <g key={`zone-${layer.id}`}>
              {/* Hover highlight overlay */}
              {isHovered && (
            <rect
                  x="0"
                  y={yPos}
                  width="980"
                  height={height}
                  fill={hoverColor.light}
                  className={`layer-hover-overlay ${layer.id}`}
                  style={{
                    pointerEvents: 'none',
                    transition: 'opacity 0.3s ease'
                  }}
                />
              )}
              
              {/* Clickable area */}
              <rect
              x="0"
              y={yPos}
              width="980"
              height={height}
              fill="transparent"
              className={`layer-zone ${layer.id}`}
                onMouseEnter={() => {
                  // Animate layer separator lines (both top and bottom)
                  const layerIndex = layers.findIndex(l => l.id === layer.id);
                  // Highlight divider below this layer
                  if (layerIndex < layers.length - 1) {
                    const nextLayer = layers[layerIndex + 1];
                    gsap.to(`.layer-divider-${nextLayer.id}`, { 
                      stroke: hoverColor.border, 
                      strokeWidth: 3, 
                      opacity: 0.8,
                      duration: 0.3 
                    });
                  }
                  // Highlight divider above this layer
                  if (layerIndex > 0) {
                    gsap.to(`.layer-divider-${layer.id}`, { 
                      stroke: hoverColor.border, 
                      strokeWidth: 3, 
                      opacity: 0.8,
                      duration: 0.3 
                    });
                  }
                }}
                onMouseLeave={() => {
                  // Reset all dividers
                  layers.forEach((l, idx) => {
                    if (idx > 0) {
                      gsap.to(`.layer-divider-${l.id}`, { 
                        stroke: '#666', 
                        strokeWidth: 2, 
                        opacity: 0.4,
                        duration: 0.3 
                      });
                    }
                  });
                }}
              onClick={() => onLayerClick(layer.id)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
              
              {/* Animated border on hover */}
              {isHovered && (
                <rect
                  x="5"
                  y={yPos + 2}
                  width="970"
                  height={height - 4}
                  fill="none"
                  stroke={hoverColor.border}
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  rx="4"
                  opacity="0.6"
                  style={{
                    pointerEvents: 'none',
                    animation: 'dash 2s linear infinite'
                  }}
                />
              )}
            </g>
          );
        })}

        {/* Add CSS animation for dashed border */}
        <style>{`
          @keyframes dash {
            to {
              stroke-dashoffset: -12;
            }
          }
        `}</style>

        {/* Enhanced Layer labels on the right with improved UI */}
        {layers.map((layer) => {
          const yPos = (layer.top / 100) * 800;
          const height = (layer.height / 100) * 800;
          // For Emergent Layer, position label at the top to avoid overlapping with sun
          // Sun is typically positioned around y=50-150, so we place label at y=25 (top of emergent layer)
          const labelY = layer.id === 'emergent' ? yPos + 25 : yPos + height / 2;
          const isHovered = hoveredLayer === layer.id;
          
          // Layer-specific colors for better visual distinction
          const layerColors = {
            'emergent': { bg: 'rgba(255, 248, 220, 0.95)', border: '#FFA500', text: '#B8860B', icon: '⬆' },
            'canopy': { bg: 'rgba(240, 255, 240, 0.95)', border: '#4A7C2A', text: '#2D5016', icon: '🌳' },
            'understory': { bg: 'rgba(245, 255, 250, 0.95)', border: '#556B2F', text: '#3D5F1F', icon: '🌿' },
            'forest-floor': { bg: 'rgba(250, 240, 230, 0.95)', border: '#8B6F47', text: '#654321', icon: '🍂' }
          };
          
          const colors = layerColors[layer.id] || { bg: 'rgba(255, 255, 255, 0.95)', border: '#4A7C2A', text: '#333', icon: '📍' };
          
          // Calculate light level for this layer
          const lightLevel = calculateLayerLight(layer.id);
          
          return (
            <g key={`label-${layer.id}`}>
              {/* Drop shadow for depth */}
              <rect
                x="822"
                y={labelY - 13}
                width="160"
                height="30"
                rx="6"
                fill="rgba(0, 0, 0, 0.15)"
                opacity={isHovered ? 0.3 : 0.1}
              />
              
              {/* Main label box with gradient-like effect */}
              <rect
                x="820"
                y={labelY - 15}
                width="160"
                height="30"
                fill={isHovered ? colors.bg : 'rgba(255, 255, 255, 0.92)'}
                stroke={isHovered ? colors.border : '#ddd'}
                strokeWidth={isHovered ? '2.5' : '1'}
                rx="6"
                opacity={isHovered ? 1 : 0.85}
                style={{
                  filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
              
              {/* Icon/Indicator */}
              <text
                x="835"
                y={labelY + 2}
                fontSize="16"
                fill={isHovered ? colors.border : '#999'}
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {colors.icon}
              </text>
              
              {/* Layer name */}
              <text
                className={`label-text ${layer.id} pointer-events-none`}
                x="900"
                y={labelY + 1}
                textAnchor="middle"
                fontSize="13"
                fill={isHovered ? colors.text : '#555'}
                fontWeight={isHovered ? '600' : '500'}
                style={{
                  textShadow: isHovered ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {layer.label}
              </text>
              
              {/* Light level indicator on hover */}
              {isHovered && (
                <g opacity="0.9">
                  <rect
                    x="950"
                    y={labelY - 12}
                    width="25"
                    height="24"
                    rx="4"
                    fill={colors.border}
                    opacity="0.2"
                  />
                  <text
                    x="962"
                    y={labelY + 2}
                    textAnchor="middle"
                    fontSize="9"
                    fill={colors.text}
                    fontWeight="bold"
                  >
                    {lightLevel.toFixed(1)}%
                  </text>
                  <text
                    x="962"
                    y={labelY + 10}
                    textAnchor="middle"
                    fontSize="7"
                    fill={colors.text}
                    opacity="0.7"
                  >
                    light
              </text>
                </g>
              )}
              
              {/* Tooltip on hover with layer info */}
              {isHovered && (
                <g opacity="0.95">
                  {/* Tooltip background */}
                  <rect
                    x="700"
                    y={labelY - 45}
                    width="110"
                    height="38"
                    rx="6"
                    fill="rgba(0, 0, 0, 0.85)"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}
                  />
                  {/* Tooltip arrow */}
                  <polygon
                    points={`775,${labelY - 7} 780,${labelY - 2} 770,${labelY - 2}`}
                    fill="rgba(0, 0, 0, 0.85)"
                  />
                  {/* Tooltip text */}
                  <text
                    x="755"
                    y={labelY - 28}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#fff"
                    fontWeight="600"
                  >
                    Click to explore
                  </text>
                  <text
                    x="755"
                    y={labelY - 14}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#E0E0E0"
                  >
                    Learn more about this layer
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default RainforestSVG;