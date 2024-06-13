import axios from 'axios';
import * as cheerio from 'cheerio';

export const fetchArticles = async (): Promise<void> => {
  try {
    const url = 'https://sxodim.com/'
    const response = await axios.get(url);
    const html = response.data;
    console.log(url);
    // Use Cheerio to parse the HTML
    const $ = cheerio.load(html);
    const categories: { name: string; link: string; imageUrl: string }[] = [];

    $('a[data-cy^="cat-"], a[data-cy^="cat-promo"]').each((_, element) => {
        const name = $(element).find('span').text().trim();
        const link = $(element).attr('href') ?? '';
        const imageUrl = $(element).find('img').attr('src') ?? '';

        categories.push({
            name,
            link,
            imageUrl
        });
    });

    // Loop through the selected elements
    categories.forEach((category) => {
      const text = $(category).text().trim();
      // Log each article's text content to the console
      console.log(text);
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
};

export const fetchCategories = async (): Promise<void> => {
    try {
      const url = 'https://www.olx.kz'
      const response = await axios.get(url);
      const html = response.data;
      console.log(url);
      // Use Cheerio to parse the HTML
      const $ = cheerio.load(html);
      const categories: { name: string; link: string; imageUrl: string }[] = [];
  
      $('a[data-cy^="cat-"], a[data-cy^="cat-promo"]').each((_, element) => {
          const name = $(element).find('span').text().trim();
          const link = $(element).attr('href') ?? '';
          const imageUrl = $(element).find('img').attr('src') ?? '';
  
          categories.push({
              name,
              link,
              imageUrl
          });
      });
  
      // Loop through the selected elements
      categories.forEach((category) => {
        const text = $(category).text().trim();
        // Log each article's text content to the console
        console.log(text);
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };
  
