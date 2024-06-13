import axios from 'axios';
import cheerio from 'cheerio';

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

    const nextPage = `${this.baseUrl}/ca/shopping/women/dresses-1/items.aspx?page=2&view=96&sort=3`;
    if (this.parsedItems < this.maxItems) {
        await this.parsePage(nextPage);
    }
  }

  private async getOneDress(url: string): Promise<void> {
    if (this.parsedItems >= this.maxItems) {
      console.log(`Parsed ${this.maxItems} items. Stopping the spider.`);
      return;
    }

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    this.parsedItems += 1;

    const dressData = {
      id: $('p:contains("FARFETCH ID:")').find('span').text().trim(),
      item_group_id: $('p:contains("Brand style ID:")').find('span').text().trim(),
      mpn: $('p:contains("Brand style ID:")').find('span').text().trim(),
      title: $('p[data-testid="product-short-description"]').text(),
      description: null,
      image_link: $('div:nth-child(5) img').first().attr('src'),
      additional_image_link: $('div:nth-child(5) img').eq(1).attr('src'),
      url: url,
      gender: this.extractGender($),
      age_group: 'adult',
      brand: $('div:nth-child(5)').find('h1 a').text(),
      color: this.extractColor($),
      size: null,
      availability: 'in stock',
      price: $('p[data-component="PriceLarge"]').text(),
      condition: null,
      product_type: this.extractProductType($),
      google_product_category: 2271,
    };

    console.log(dressData);
  }

  private extractColor($: cheerio.Root): string {
    return $('ul._fdc1e5').find('li[data-component="Body"]').text().trim();
  }

  private extractProductType($: cheerio.Root): string {
    return $('ol[data-component="Breadcrumbs"]').find('li').map((i, el) => {
      return $(el).find('a').text() + ';';
    }).get().join(' ');
  }

  private extractGender($: cheerio.Root): string | null {
    const scriptContent = $('script:contains("window.universal_variable")').html();
    const match = scriptContent?.match(/'name':'(.*?)'/);
    return match ? match[1] : null;
  }
}
