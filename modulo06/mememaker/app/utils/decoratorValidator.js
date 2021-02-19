const decoratorValidator = (fn, schema, argsType) => {
    return async function (event) {
        const item = event[argsType]
        const data = argsType === 'body' ? JSON.parse(item) : item
        const { error, value } = await schema.validate(data, { abortEarly: false })
        //isso altera o event que chegou na classe
        event[argsType] = value
        //se passou continua o fluxo
        if (!error) return fn.apply(this, arguments)
        //se nao passou
        return {
            statusCode: 422, //entrada improcessavel
            body: error.message
        }
    }
}

module.exports = decoratorValidator