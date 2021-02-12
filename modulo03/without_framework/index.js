async function handler(event, context) {
    console.log('AMBIENTE..', JSON.stringify(process.env, null, 2))
    console.log('EVENTO..', JSON.stringify(event, null, 2))

    return {
        hello: 'teste'
    }
}

module.exports = {
    handler
}