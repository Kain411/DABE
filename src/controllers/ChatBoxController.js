const { default: axios } = require("axios");
const { failResponse, ressponseAI } = require("../utils/response");
const dotenv = require('dotenv');
dotenv.config();

const search = async (req, res ) => {
    try {
        const { query } = req.body;

        console.log(query)

        const response = await axios.post(`${process.env.AI_URL}/chatbox`, { query: query })

        return ressponseAI(res, 200, response.data);

    } catch (err) {
        return failResponse(res, 500, err.message);
    }
}

module.exports = { search }