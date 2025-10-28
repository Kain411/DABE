const { default: axios } = require("axios");
const { failResponse, ressponseAI } = require("../utils/response");
const dotenv = require('dotenv');
const { ref } = require("joi");
dotenv.config();

const search = async (req, res ) => {
    try {
        const { query, reference } = req.body;


        console.log(process.env.AI_URL)

        const response = await axios.post(
            `${process.env.AI_URL}/chatbot`, 
            { query: query, reference: reference },
            {
                headers: {
                    'Content-Type': 'apllication/json; charset=utf-8',
                },
                transformRequest: [(data, headers) => {
                    return JSON.stringify(data)
                }]
            }
        )

        console.log(response)

        let result = response.data;

        if ("output" in result) result = result.data;

        return ressponseAI(res, 200, result);

    } catch (err) {
        return failResponse(res, 500, err.message);
    }
}

module.exports = { search }