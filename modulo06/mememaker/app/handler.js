'use strict';

const { exec } = require('child_process')
const { promisify } = require('util')
const decoratorValidator = require('./utils/decoratorValidator')
const enums = require('./utils/enums')
const Joi = require('@hapi/joi')
const axios = require('axios')
const { promises: { writeFile, readFile, unlink } } = require('fs')

const shell = promisify(exec)

class Handler {
  constructor () {

  }

  static validator() {
    return Joi.object({
      image: Joi.string().required().uri(),
      bottomText: Joi.string().max(200),
      topText: Joi.string().required().max(200),
    })
  }

  static generatePath() {
    return `/tmp/${new Date().getTime()}-out.png`
  }

  static async getImage(url, path) {
    console.log(url, path)
    const { data } = await axios.get(url, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(data, 'base64')
    return writeFile(path, buffer)
  }

  static generateIdentifyCommand(path) {
    const value = `
      gm identify \
        -verbose \
        ${path}
    `

    const cmd = value.split('\n').join(' ')
    return cmd
  }

  static async getImageSize(path) {
    const command = Handler.generateIdentifyCommand(path)
    const { stdout } = await shell(command)
    const [line] = stdout.trim().split('\n').filter(text => ~text.indexOf('Geometry'))
    const [width, height] = line.trim().replace('Geometry: ', "").split('x')
    return {
      width: Number(width),
      height: Number(height)
    }
  }

  static setParameters(options, dimenssions, path) {
    return {
      topText: options.topText,
      bottomText: options.bottomText || '',
      font: __dirname + '/resources/impact.ttf',
      fontSize: dimenssions.width / 8,
      fontFill: '#FFF',
      textPos: 'center',
      strokeColor: '#000',
      strokeWidth: 1,
      padding: 40,
      image: path
    }
  }

  static setTextPosition(dimenssions, padding){
    const top = Math.abs((dimenssions.height / 2.1) - padding) * -1 
    const bottom = (dimenssions.height / 2.1) - padding
    return {
      top,
      bottom
    } 
  }

  static generateConvertCommand(options, finalPath) {
    const value = `
      gm convert \
      '${options.image}'
      -font '${options.font}'
      -pointsize ${options.fontSize}
      -fill '${options.fontFill}'
      -stroke '${options.strokeColor}'
      -strokewidth '${options.strokeWidth}'
      -draw 'gravity ${options.textPos} text 0,${options.top} "${options.topText}"'
      -draw 'gravity ${options.textPos} text 0,${options.bottom} "${options.bottomText}"'
      ${finalPath}
    `
    const cmd = value.split('\n').join(' ')

    return cmd
  }

  static async callGenerate(command) {
    const { stdout } = await shell(command)
    return stdout
  }

  static async generateB64Img(path) {
    return readFile(path, "base64")
  }

  static async main(event){
    try {
      console.log('get params...');
      const options = event.queryStringParameters
      console.log('get imagem...');
      const filepath = Handler.generatePath()
      await Handler.getImage(options.image, filepath)
      console.log('get imagem size...');
      const sizes = await Handler.getImageSize(filepath)
      const params = Handler.setParameters(options, sizes, filepath)
      const { top, bottom } = Handler.setTextPosition(sizes, params.padding)
      const finalFilePath = Handler.generatePath()
      const command = Handler.generateConvertCommand({ ...params, top, bottom }, finalFilePath)
      console.log('generate meme...')
      await Handler.callGenerate(command)
      console.log('generate base64...')
      const finalImgBuffer = await Handler.generateB64Img(finalFilePath)
      console.log('finish...')
      await Promise.all([
        unlink(finalFilePath),
        unlink(filepath),
      ])
      const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html'
        },
        body: `<img src="data:image/jpeg;base64,${finalImgBuffer}" />`
      }
      return response
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        body: 'Deu algum pau!'
      }
    }
  }


}

const handler = new Handler()
module.exports = { mememaker: decoratorValidator(Handler.main, Handler.validator(), enums.ARG_TYPE.QUERY_STRING_PARAMETERS) }