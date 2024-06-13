import axios from 'axios';
import cheerio from 'cheerio';
import mongoose from 'mongoose';
import Product from '../products/models/Product';

export class FarfetchSpider {
  private baseUrl = "https://www.farfetch.com";
  private startUrl = `${this.baseUrl}/ca/shopping/women/dresses-1/items.aspx`;
  private maxItems = 120;
  private parsedItems = 0;

  public async scrape(): Promise<void> {
    try {
      await this.parsePage(this.startUrl);
    } catch (error) {
      console.error('Scrape failed:', error);
    }
  }

  private async parsePage(url: string): Promise<void> {
    if (this.parsedItems >= this.maxItems) {
      console.log(`Parsed ${this.parsedItems} items. Stopping the spider.`);
      return;
    }

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const dressDetailUrls = $('li[data-testid="productCard"]').find('a');

    for (let i = 0; i < dressDetailUrls.length; i++) {
      const href = this.baseUrl + $(dressDetailUrls[i]).attr('href');
      await this.getOneDress(href);
    }
  }

  private async getOneDress(url: string): Promise<void> {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const id = $('p:contains("FARFETCH ID:")').find('span').text().trim();
    const existingProduct = await Product.findOne({ id: id });
    if (existingProduct) {
      console.log(`Product with ID ${id} already exists.`);
      return;
    }
    
    const dressData = new Product({
      id: id,
      item_group_id: $('p:contains("Brand style ID:")').find('span').text().trim(),
      mpn: $('p:contains("Brand style ID:")').find('span').text().trim(),
      title: $('p[data-testid="product-short-description"]').text(),
      description: null, // Add logic to extract description
      image_link: $('div:nth-child(5) img').first().attr('src'),
      additional_image_link: $('div:nth-child(5) img').eq(1).attr('src'),
      url: url,
      gender: this.extractGender($),
      age_group: 'adult',
      brand: $('div:nth-child(5)').find('h1 a').text(),
      color: this.extractColor($),
      size: null, // Add logic to extract size
      availability: 'in stock', // Add logic to check availability
      price: $('p[data-component="PriceLarge"]').text(),
      condition: null, // Add logic to extract condition
      product_type: this.extractProductType($),
      google_product_category: 2271
    });

    await dressData.save();
    console.log(`Saved new product with ID ${id}`);
    this.parsedItems++;
  }

  private extractGender($: cheerio.Root): string | null {
    const scriptContent = $('script:contains("window.universal_variable")').html();
    const match = scriptContent?.match(/'gender':'(.*?)'/);
    return match ? match[1] : null;
  }

  private extractColor($: cheerio.Root): string {
    return $('ul._fdc1e5').find('li[data-component="Body"]').text().trim();
  }

  private extractProductType($: cheerio.Root): string {
    return $('ol[data-component="Breadcrumbs"]').find('li').map((i, el) => {
      return $(el).find('a').text() + ';';
    }).get().join(' ');
  }
}
