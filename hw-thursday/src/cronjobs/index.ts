
import { fetchArticles, fetchCategories } from '../scraper'

var cron = require('node-cron');
// Schedule a task to run every minute
export function startParsingOlx(){
    cron.schedule('* * * * *', () => {
        fetchArticles()
          .then((articles) => {
            console.log('Running a task every minute', articles)
          })
          .catch((error) => {
            console.error('Error fetching articles:', error)
          })
      })
}

export function startParsingOlx1(){
    cron.schedule('* * * * *', () => {
        fetchCategories()
          .then((articles) => {
            console.log('Running a task every minute', articles)
          })
          .catch((error) => {
            console.error('Error fetching articles:', error)
          })
      })
}