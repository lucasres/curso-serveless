const uuid = require('uuid')
const Joi = require('@hapi/joi')
const decoratorValidator = require('./utils/decoratorValidator')
const Enums = require('./utils/enums')

class Handler {

    constructor({ dynamoDbScv }) {
        this.dynamoDbScv = dynamoDbScv
        this.dynamoTable = process.env.DYNAMODB_TABLE
    }

    async insertItem(params){
        return await this.dynamoDbScv.put(params).promise()
    }

    static validator() {
        return Joi.object({
            name: Joi.string().min(2).max(100).required(),
            power: Joi.string().max(20).required(),
        })
    }

    prepareData(data){
        const params = {
            TableName: this.dynamoTable,
            Item: {
                ...data,
                id: uuid.v1(),
                createdAt: new Date().toISOString()
            }
        }

        return params
    }

    handleSucces(data) {
        const result = {
            statusCode: 200,
            body: JSON.stringify(data)
        }

        return result
    }

    handleError(data) {
        const result = {
            statusCode: data.statusCode || 500,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Internal Error'
        }
        return result
    }

    async main(event){
        try {
            console.log('get data...')
            const data = event.body
            console.log('prepare data to insert...')
            const params = this.prepareData(data)
            console.log('insert into dynamoDB...')
            await this.insertItem(params)
            return this.handleSucces(params.Item)
        } catch (error) {
            console.log('Deu pau**', error.stack)
            return this.handleError({ statusCode: 500 })
        }
    }
}

//factory
const AWS = require('aws-sdk')
const { required } = require('@hapi/joi')
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const handler = new Handler({ dynamoDbScv: dynamoDB })

module.exports = decoratorValidator(
    handler.main.bind(handler),
    Handler.validator(),
    Enums.ARG_TYPE.BODY
)