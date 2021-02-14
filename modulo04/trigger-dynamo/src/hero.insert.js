const uuid = require('uuid')

class Handler {

    constructor({ dynamoDbScv }) {
        this.dynamoDbScv = dynamoDbScv
        this.dynamoTable = process.env.DYNAMODB_TABLE
    }

    async insertItem(params){
        return await this.dynamoDbScv.put(params).promise()
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
            const data = JSON.parse(event.body)
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
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const handler = new Handler({ dynamoDbScv: dynamoDB })

module.exports = handler.main.bind(handler)