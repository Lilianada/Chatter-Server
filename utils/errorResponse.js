class errorResponse extends Error {
    constructor(message, statusCode, data) {
        console.log(message)
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
}

module.exports = errorResponse;