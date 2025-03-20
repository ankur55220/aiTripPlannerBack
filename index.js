import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();

// Enable CORS for your React app
app.use(cors({
  origin: 'http://localhost:5173' // Your Vite dev server port
}));

app.use(express.json());

// Proxy endpoint for Places API text search
app.get('/api/places/textsearch', async (req, res) => {
  try {
    const { query, location, radius } = req.query;
    
    const params = new URLSearchParams({
      query,
      key: process.env.VITE_GOOGLE_PLACES_API_KEY,
      ...(location && { location }),
      ...(radius && { radius })
    });

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error proxying Places API request:', error);
    res.status(500).json({ error: 'Failed to fetch place data' });
  }
});

// Proxy endpoint for Place Photos
app.get('/api/places/photo', async (req, res) => {
  try {
    const { maxwidth, photo_reference } = req.query;
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photo_reference}&key=${process.env.VITE_GOOGLE_PLACES_API_KEY}`,
      { responseType: 'arraybuffer' }
    );

    // Set the content type to image
    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error('Error proxying photo request:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
