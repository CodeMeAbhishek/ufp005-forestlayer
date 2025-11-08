// Unsplash API for images
// Set your Unsplash API key in .env file: VITE_UNSPLASH_ACCESS_KEY=your_key_here
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'YOUR_UNSPLASH_ACCESS_KEY';
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

export const fetchUnsplashImage = async (query, orientation = 'portrait') => {
  try {
    // If no API key, use placeholder service as fallback
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
      // Fallback to a placeholder service or default image
      return `https://source.unsplash.com/800x600/?${query}`;
    }
    
    const response = await fetch(
      `${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=1`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Unsplash API error');
    }
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    
    return `https://source.unsplash.com/800x600/?${query}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    return `https://source.unsplash.com/800x600/?${query}`;
  }
};

// Fetch multiple images for visual characteristics
export const fetchUnsplashImages = async (queries, orientation = 'landscape', count = 2) => {
  try {
    // If no API key, use placeholder service as fallback
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
      return queries.slice(0, count).map(query => `https://source.unsplash.com/800x600/?${query}`);
    }
    
    // Fetch images for each query
    const imagePromises = queries.slice(0, count).map(async (query) => {
      try {
        const response = await fetch(
          `${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=1`,
          {
            headers: {
              'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Unsplash API error');
        }
        
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.regular;
        }
        
        return `https://source.unsplash.com/800x600/?${query}`;
      } catch (error) {
        console.error(`Error fetching image for query "${query}":`, error);
        return `https://source.unsplash.com/800x600/?${query}`;
      }
    });
    
    return await Promise.all(imagePromises);
  } catch (error) {
    console.error('Error fetching images:', error);
    return queries.slice(0, count).map(query => `https://source.unsplash.com/800x600/?${query}`);
  }
};

// Gemini API for text generation
// Uses ONLY the model specified in VITE_GEMINI_MODEL environment variable
// If not set, defaults to gemini-1.5-pro
// Example: VITE_GEMINI_MODEL=gemini-2.0-flash-exp
export const generateGeminiText = async (prompt) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
    // Use ONLY the model from environment variable (or default if not set)
    // No fallback models - uses exactly what you specify in .env
    const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-pro';
    
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      // Fallback response if no API key
      return "As an environmental expert, here's a fascinating fact about forest ecosystems: They are home to over 80% of the world's terrestrial biodiversity!";
    }

    // Use REST API - try v1beta first (more stable for newer models)
    // Only use the model specified in VITE_GEMINI_MODEL (or default if not set)
    let response;
    let apiVersion = 'v1beta'; // Start with v1beta as it's more reliable for newer models
    
    // Try v1beta API first with the specified model
    response = await fetch(
      `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `As an environmental expert, ${prompt}`
            }]
          }]
        })
      }
    );
    
    // If v1beta fails with 404, try v1 as fallback
    if (!response.ok && response.status === 404) {
      apiVersion = 'v1';
      response = await fetch(
        `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `As an environmental expert, ${prompt}`
              }]
            }]
          })
        }
      );
    }
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error (${apiVersion}, model: ${model}): ${errorData}`);
    }
    
    // Parse successful response
    const data = await response.json();
    // Response format is the same for both v1 and v1beta
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      console.log(`✓ Successfully used ${model} via ${apiVersion} API`);
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error(`Invalid response format from ${apiVersion} API`);
  } catch (error) {
    console.error('Error generating text:', error);
    // Fallback responses based on prompt type
    if (prompt.includes('fun fact')) {
      return 'Forest layers create unique microhabitats that support diverse life forms, each adapted to specific light and moisture conditions.';
    } else if (prompt.includes('quiz') || prompt.includes('question')) {
      // Return fallback quiz structure
      return JSON.stringify([
        {
          question: "Which forest layer receives the most direct sunlight?",
          options: { A: "Emergent Layer", B: "Canopy", C: "Understory", D: "Forest Floor" },
          correct: "A"
        },
        {
          question: "Approximately what percentage of sunlight does the canopy layer block?",
          options: { A: "50%", B: "75%", C: "95%", D: "100%" },
          correct: "C"
        },
        {
          question: "Which layer has the highest biodiversity?",
          options: { A: "Emergent Layer", B: "Canopy", C: "Understory", D: "Forest Floor" },
          correct: "B"
        },
        {
          question: "The Forest Floor receives approximately what percentage of light?",
          options: { A: "10-20%", B: "5-10%", C: "1-2%", D: "0%" },
          correct: "C"
        },
        {
          question: "Which layer is primarily responsible for nutrient cycling?",
          options: { A: "Emergent Layer", B: "Canopy", C: "Understory", D: "Forest Floor" },
          correct: "D"
        }
      ]);
    }
    return 'Forest ecosystems are incredibly complex and interconnected, supporting an amazing diversity of life.';
  }
};

