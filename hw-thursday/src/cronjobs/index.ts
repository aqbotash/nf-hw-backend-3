
import { FarfetchSpider } from '../scraper'

var cron = require('node-cron');
// Schedule a task to run every minute
export function startParsingOlx(){
    cron.schedule('* * * * *', () => {
      const spider = new FarfetchSpider ();
      spider.scrape()
          .then((articles) => {
            console.log('Running a task every minute', articles)
          })
          .catch((error) => {
            console.error('Error fetching articles:', error)
          })
      })
}
