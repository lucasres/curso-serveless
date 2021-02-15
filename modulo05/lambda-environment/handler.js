'use strict';
const settings = require('./config/settings')
const axios = require('axios')
const cheerio = require('cheerio')
const uuid = require('uuid')
const aws = require('aws-sdk')

const dynamoDB = new aws.DynamoDB.DocumentClient()

class Handler {
  static async main(event) {
    // console.log('at', new Date().toISOString(), JSON.stringify(event, null, 2))
    console.log('get data...')
    const { data } = await axios.get(settings.commitMessageUrl)
    const $ = cheerio.load(data)
    const [ commitMessage ] = $("#content").text().trim().split('\n')
    console.log('commit message', commitMessage)
    console.log('insert into dynamoDB...')
    await dynamoDB.put({
      TableName: settings.dbTableName,
      Item: {
        id: uuid.v4(),
        commitMessage: commitMessage,
        createdAt: new Date().toISOString()
      }
    }).promise()
    return {
      statusCode: 200
    }
  }
}

module.exports = {
  scheduler: Handler.main
}