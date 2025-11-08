# API Keys Setup Guide

This guide will help you set up the Gemini and Unsplash API keys for the Forest Layers Explorer app.

## Quick Setup

### Step 1: Create a `.env` file

Create a `.env` file in the root directory of the project (same level as `package.json`):

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

**Important:** 
- Do NOT commit the `.env` file to version control (it's already in `.gitignore`)
- Restart your development server after creating/updating `.env`

### Step 2: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey) or [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the generated API key
5. Paste it in your `.env` file as `VITE_GEMINI_API_KEY`

**Free tier:** Gemini API offers free usage with generous limits.

### Step 3: Get Your Unsplash API Key (Optional)

1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Sign up or log in to your Unsplash account
3. Click "Your apps" → "New Application"
4. Fill in the application details (name, description)
5. Accept the API Use and Guidelines
6. On the Keys page, copy your **"Access Key"** (not the Secret Key)
7. Paste it in your `.env` file as `VITE_UNSPLASH_ACCESS_KEY`

**Important:** Use the **Access Key**, not the Secret Key. The Secret Key is only needed for server-side write operations, which this app doesn't require.

**Free tier:** Unsplash API offers 50 requests per hour for free, which is sufficient for this app.

## File Locations

### `.env` file (Root directory)
```
UFP005/
├── .env                    ← Create this file here
├── package.json
├── src/
└── ...
```

### API Configuration Files

The API keys are used in:
- `src/utils/api.js` - Contains the API integration code

**Current setup:**
- **Gemini API**: Reads from `VITE_GEMINI_API_KEY` environment variable
- **Unsplash API**: Reads from `VITE_UNSPLASH_ACCESS_KEY` environment variable

## Example `.env` File

```env
# Google Gemini API Key (works with ALL Gemini models)
VITE_GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Choose Gemini model (default: gemini-1.5-pro)
# Available models: gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp
# Note: The API automatically uses v1 endpoint first, with v1beta as fallback
# VITE_GEMINI_MODEL=gemini-1.5-pro

# Unsplash API Access Key (use the "Access Key", NOT the Secret Key)
VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
```

### Gemini Model Options

**Your API key works with ANY Gemini model!** You can optionally specify which model to use:

- **`gemini-1.5-pro`** (default) - More capable model with longer context, better quality responses
- **`gemini-1.5-flash`** - Faster, lighter model for quick responses, good for most use cases
- **`gemini-2.0-flash-exp`** - Newest experimental model, fastest response times

**Note:** The API automatically tries the v1 endpoint first, then falls back to v1beta if needed. The older `gemini-pro` model is deprecated.

To use a different model, add `VITE_GEMINI_MODEL=model-name` to your `.env` file.

## Testing Your API Keys

After setting up your keys:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test Gemini API:
   - Click on any layer
   - Click "Generate Fun Fact" button
   - You should see an AI-generated fact (not the fallback)

3. Test Unsplash API:
   - Check if layer images load properly in the info panels
   - Background image should load on the landing page

## Fallback Behavior

The app works **without API keys** using:
- **Gemini**: Fallback pre-written facts and quiz questions
- **Unsplash**: Public placeholder images via `source.unsplash.com`

However, full functionality requires API keys for:
- Dynamic AI-generated fun facts
- AI-generated quiz questions
- High-quality curated images

## Troubleshooting

### "API key not working"

1. **Check your `.env` file exists** in the root directory
2. **Verify variable names** start with `VITE_` (required for Vite)
3. **Restart dev server** after creating/updating `.env`
4. **Check for typos** in the API keys
5. **Verify API key is active** in the provider's dashboard

### Environment Variables Not Loading

- Make sure the `.env` file is in the **root directory** (not in `src/`)
- Variable names must start with `VITE_` for Vite to expose them
- Restart the development server after changes

### For Production Deployment

When deploying to Vercel/Netlify:

1. **Vercel**: Go to Project Settings → Environment Variables
2. **Netlify**: Go to Site Settings → Environment Variables

Add both:
- `VITE_GEMINI_API_KEY`
- `VITE_UNSPLASH_ACCESS_KEY`

## Security Notes

⚠️ **Never commit API keys to version control!**
- The `.env` file is already in `.gitignore`
- Never share your API keys publicly
- If a key is exposed, regenerate it immediately

## Need Help?

- **Gemini API Issues**: [Google AI Studio Help](https://aistudio.google.com/)
- **Unsplash API Issues**: [Unsplash Developers Docs](https://unsplash.com/documentation)
- **Vite Env Variables**: [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

