'use strict';
const settings = require('./config/settings')
const axios = require('axios')
const cheerio = require('cheerio')

class Handler {
  static async main(event) {
    // console.log('at', new Date().toISOString(), JSON.stringify(event, null, 2))
    console.log('get data...')
    const { data } = await axios.get(settings.commitMessageUrl)
    const $ = cheerio.load(data)
    const [ commitMessage ] = $("#content").text().trim().split('\n')
    console.log('commit message', commitMessage)
    return {
      statusCode: 200
    }
  }
}

module.exports = {
  scheduler: Handler.main
}