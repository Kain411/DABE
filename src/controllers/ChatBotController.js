const { default: axios } = require("axios");
const { failResponse, ressponseAI } = require("../utils/response");
const dotenv = require('dotenv');
const UserService = require("../services/UserService");
const WorkerService = require("../services/WorkerService");
const ReviewService = require("../services/ReviewService");
dotenv.config();

const search = async (req, res ) => {
    try {
        const { query, reference } = req.body;
        const clientID = req.client.uid;
        const role = req.client.role;

        // if (role==='user') {
        //     const clientData = await UserService.getByUID(clientID);
        //     reference['location'] = clientData.location;
        // }
        // else if (role==='worker') {
        //     const clientData = await WorkerService.getByUID(clientID);
        //     reference['location'] = clientData.location;
        // }

        reference['role'] = role;

        if (role==='worker') {
            const experiencesData = await ReviewService.getExperienceOfWorker(clientID);

            const experiences = {
                'CLEANING': 0,
                'HEALTHCARE': 0,
                'MAINTENANCE': 0
            };
            for (const type in experiencesData) {
                if (experiencesData[type]?.rating !== undefined) {
                    experiences[type] = experiencesData[type].rating;
                }
            }

            reference['experiences'] = experiences;
        }

        console.log(reference)

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