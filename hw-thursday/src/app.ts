import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { startParsingOlx} from './cronjobs';
import axios from 'axios'
import cheerio from 'cheerio'
import connectDB from './db';

// Create Express server
const app = express(); // New express instance
const port = 3000; // Port number

connectDB()
// Express configuration
app.use(cors()); // Enable CORS
app.use(helmet()); // Enable Helmet
app.use(morgan('dev')); 
// Enable Morgan
startParsingOlx();

  app.get('/parse-categories', async (req, res) => {
    try {
      const response = await axios.get('https://www.olx.kz/');
      const html = response.data;
      const $ = cheerio.load(html);
      const categories: { name: string; link: string }[] = [];
  
      $('a[data-cy="category-link"]').each((_, element) => {
        const name = $(element).text().trim();
        const link = $(element).attr('href');
        if (link) {
          categories.push({ name, link });
        }
      });
  
      res.json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error parsing categories');
    }
  });

// Start Express server
app.listen(port, () => {
  // Callback function when server is successfully started
  console.log(`Server started at http://localhost:${port}`);
});

// Export Express app
export default app;