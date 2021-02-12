exports.handler = async (event) => {
    // TODO implement
    const {num1, num2} = event.queryStringParameters
    const response = {
        statusCode: 200,
        body: `A soma eh ${parseInt(num1) + parseInt(num2)}`,
    };
    return response;
};
