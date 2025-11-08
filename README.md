# Forest Layers Explorer

An interactive web-based simulation application for exploring the vertical structure of forest ecosystems. Built for UFP005 - Environmental Science and Climate Change by Group-1.

## Features

- **Interactive Cross-Section Visualization**: Full-screen vertical cross-section of a rainforest with clickable layer zones
- **Four Forest Layers**: Explore Emergent Layer, Canopy, Understory, and Forest Floor
- **Real-time Model Controls**: Adjust canopy cover, leaf area index (LAI), and light penetration with live visualization updates
- **Dynamic Content**: AI-powered fun facts and quiz questions using Gemini API
- **Image Integration**: Real-life forest images from Unsplash API
- **Educational Tools**: 
  - Detailed layer information panels
  - Biodiversity statistics on hover
  - Interactive quiz mode
  - PDF export functionality

## Tech Stack

- **React 18** with **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Google Gemini API** for AI text generation
- **Unsplash API** for nature/forest images
- **jsPDF** for PDF export

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd UFP005
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

**Note**: The app will work without API keys using fallback images and default content, but full functionality requires API keys.

📖 **See `API_KEYS_SETUP.md` for detailed instructions on getting API keys.**

## Getting API Keys

### Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Add it to your `.env` file

**Note:** Your API key works with ALL Gemini models (gemini-pro, gemini-1.5-pro, gemini-1.5-flash, etc.). The default is `gemini-pro`. You can optionally set `VITE_GEMINI_MODEL` in `.env` to use a different model.

### Unsplash API Key (Optional)
1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Copy your Access Key
4. Update `src/utils/api.js`

## Running the Application

### Development
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## Deployment

The app is ready to deploy on platforms like Vercel or Netlify:

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Add environment variables in Vercel dashboard

### Netlify
1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard

## Usage

1. **Start Exploration**: Click "Start Exploration" to begin
2. **Explore Layers**: Click on any layer zone (Emergent, Canopy, Understory, Forest Floor) to view detailed information
3. **Adjust Controls**: Click "Model Controls" to adjust canopy cover, LAI, and light penetration
4. **Take Quiz**: Click the floating quiz button to test your knowledge
5. **Export Data**: After exploring layers, use "Export PDF" to download a summary

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx      # Main cross-section visualization
│   │   ├── LayerInfoPanel.jsx    # Layer detail modal
│   │   ├── ModelControls.jsx    # Interactive sliders panel
│   │   ├── Quiz.jsx              # Quiz component
│   │   ├── About.jsx             # About modal
│   │   └── Footer.jsx            # Footer component
│   ├── data/
│   │   └── layerData.js          # Forest layer data
│   ├── utils/
│   │   ├── api.js                # API integration (Unsplash, Gemini)
│   │   └── pdfExport.js          # PDF export functionality
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Educational Goals

This application helps students understand:
- The vertical stratification of forest ecosystems
- How environmental factors (light, temperature, humidity) vary across layers
- Unique adaptations of flora and fauna to each layer's conditions
- The ecological roles of each layer in forest health

## Credits

- **Course**: UFP005 - Environmental Science and Climate Change
- **Team**: Group-1
- **Images**: Unsplash (with API integration)
- **AI Text Generation**: Google Gemini API

## License

This project is created for educational purposes as part of UFP005 course.

