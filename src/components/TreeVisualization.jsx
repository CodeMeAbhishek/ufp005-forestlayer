import React from 'react';

const TreeVisualization = ({ controls }) => {
  // Calculate tree heights and positions based on layers (as percentages of viewport)
  // These align with the layer zones defined in LandingPage
  // Layer zones: Emergent (5-20%), Canopy (20-45%), Understory (45-70%), Floor (70-95%)
  const viewportHeight = 100; // Using percentage-based positioning
  const emergentTop = 5; // Starts at 5% from top
  const emergentHeight = 15; // 15% height
  const canopyTop = 20; // Starts at 20%
  const canopyHeight = 25; // 25% height
  const understoryTop = 45; // Starts at 45%
  const understoryHeight = 25; // 25% height
  const floorTop = 70; // Starts at 70%
  const floorHeight = 25; // 25% height (extends to 95%)

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Tree Silhouettes - Multiple trees across the width */}
      {[10, 25, 40, 55, 70, 85].map((leftPos, treeIndex) => (
        <svg
          key={treeIndex}
          className="absolute"
          style={{
            left: `${leftPos}%`,
            bottom: 0,
            width: `${8 + (treeIndex % 3) * 2}%`,
            height: '100%',
            opacity: 0.4 + (controls.lightPenetration / 200),
            filter: `brightness(${60 + controls.lightPenetration * 0.4}%)`
          }}
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
        >
          {/* Forest Floor - Ground layer (70-95% of viewport) */}
          <rect x="45" y="85" width="10" height="15" fill="#6b4423" opacity="0.8" />
          
          {/* Tree Trunk - extends from floor through all layers */}
          <rect 
            x="47" 
            y="15" 
            width="6" 
            height="70" 
            fill="#4a3728"
            opacity={0.7 - (controls.lightPenetration / 300)}
          />

          {/* Understory - Shrubs and small trees (45-70%) */}
          {treeIndex % 3 === 0 && (
            <g opacity={0.6}>
              {/* Small bush on left */}
              <ellipse cx="30" cy="55" rx="12" ry="8" fill="#2d5016" />
              {/* Small bush on right */}
              <ellipse cx="70" cy="60" rx="10" ry="7" fill="#1a2e0a" />
            </g>
          )}

          {/* Canopy Layer - Main tree crown (20-45%) */}
          <ellipse
            cx="50"
            cy="32"
            rx={20 + controls.lai * 2}
            ry={12 + controls.lai}
            fill="#1a5f1a"
            opacity={0.8 - (controls.canopyCover / 200)}
          />
          
          {/* Canopy detail - overlapping leaves */}
          {controls.canopyCover > 30 && (
            <>
              <ellipse cx="45" cy="30" rx="8" ry="6" fill="#2d5016" opacity="0.6" />
              <ellipse cx="55" cy="34" rx="7" ry="5" fill="#1a2e0a" opacity="0.6" />
            </>
          )}

          {/* Emergent Layer - Tallest trees (only for some trees) (5-20%) */}
          {treeIndex < 3 && (
            <g>
              {/* Extended trunk for emergent */}
              <rect 
                x="48" 
                y="8" 
                width="4" 
                height="12" 
                fill="#3d2a1f"
                opacity={0.6}
              />
              {/* Emergent crown */}
              <ellipse
                cx="50"
                cy="12"
                rx={12 + controls.lai}
                ry={5 + controls.lai / 2}
                fill="#0f4f0f"
                opacity={0.9}
              />
              {/* Sunlight on emergent */}
              <ellipse
                cx="50"
                cy="12"
                rx={8}
                ry={4}
                fill="#4a7c2a"
                opacity={0.5}
              />
            </g>
          )}

          {/* Vines hanging down (Understory) */}
          {treeIndex % 2 === 0 && (
            <line
              x1="52"
              y1="50"
              x2="48"
              y2="65"
              stroke="#1a5f1a"
              strokeWidth="1"
              opacity="0.5"
            />
          )}

          {/* Leaf litter pattern on floor */}
          {treeIndex % 3 === 0 && (
            <g opacity="0.3">
              <ellipse cx="35" cy="92" rx="3" ry="2" fill="#8b6f47" />
              <ellipse cx="65" cy="95" rx="2" ry="1.5" fill="#6b4423" />
              <ellipse cx="40" cy="97" rx="2.5" ry="2" fill="#4a3728" />
            </g>
          )}
        </svg>
      ))}

      {/* Additional canopy texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 30%, rgba(34, 139, 34, ${Math.min(0.2, controls.lai / 50)}) 0%, transparent 50%)`,
          opacity: controls.canopyCover > 50 ? 0.3 : 0.1
        }}
      />

      {/* Light rays effect (when light penetration is high) */}
      {controls.lightPenetration > 50 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(255,255,200,${(controls.lightPenetration - 50) / 200}) 0%, transparent 50%)`,
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
};

export default TreeVisualization;

