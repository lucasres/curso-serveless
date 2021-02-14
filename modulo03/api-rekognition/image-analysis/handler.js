'use strict';
const { get } = require('axios')

class Handler {
  constructor ({ rekoSrvc, translateSrv }) {
    this.rekoSrvc = rekoSrvc
    this.translateSrv = translateSrv
  }

  async translateNames (text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }

    const { TranslatedText } = await this.translateSrv.translateText(params).promise()

    return TranslatedText.split(' e ')
  }

  async detectImageLabels(buffer) {
    const result = await this.rekoSrvc.detectLabels({
      Image: {
        Bytes: buffer
      }
    }).promise()

    const workingItems = result.Labels.filter(({ Confidence }) => Confidence > 80)
    const names = workingItems.map(({ Name }) => Name).join(' and ')

    return { names, workingItems }
  }

  makeResult (texts, workingItems) {
    const result = []
    for(const index in texts){
      const nameInPortugues = texts[index]
      const confidence = workingItems[index].Confidence
      result.push(`${confidence.toFixed(2)}% de ser do tipo ${nameInPortugues}`)
    }
    return result.join('\n')
  }

  async getBufferImg(url){
    const response = await get(url, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data)
    return buffer
  }

  async main(event){
    try {
      const { imgUrl } = event.queryStringParameters
      console.log('get buffer img...')
      const imgBuffer = await this.getBufferImg(imgUrl)
      console.log('detect labels...')
      const { names, workingItems } = await this.detectImageLabels(imgBuffer)
      console.log('translate...')
      const texts = await this.translateNames(names)
      console.log('generate result...')
      const result = this.makeResult(texts, workingItems)
      return {
        statusCode: 200,
        body: JSON.stringify(result)
      }
    } catch (error) {
      console.log('ERROR***', error.stack)
      return {
        statusCode: 500,
        body: 'Internal server error'
      }
    }
  }
}
//factory
const aws = require('aws-sdk')
const reko = new aws.Rekognition()
const transalet = new aws.Translate()
const handler = new Handler({ rekoSrvc: reko, translateSrv: transalet  })
module.exports.main = handler.main.bind(handler);
