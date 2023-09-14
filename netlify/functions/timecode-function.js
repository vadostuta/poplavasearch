const { schedule } = require("@netlify/functions");
const { initJSON } = require("../../initJSON");

const handler = async function(event, context) {
    await initJSON()

    return {
        statusCode: 200,
    };
};

exports.handler = schedule("@daily", handler);
