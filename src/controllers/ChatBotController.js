const { default: axios } = require("axios");
const { failResponse, ressponseAI } = require("../utils/response");
const dotenv = require('dotenv');
const UserService = require("../services/UserService");
const WorkerService = require("../services/WorkerService");
const ReviewService = require("../services/ReviewService");
const OrderService = require("../services/OrderService");
dotenv.config();

const getExperienceOfWorker = async (role, clientID) => {
    try {
        if (role=='worker') {
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

            return experiences;
        }

        return [];
    } catch (err) {
        return [];
    }
}

const getJobs = async (clientID) => {
    try {

        const scoreStatus = {
            "Accepted": 2,
            "Completed": 3,
            "Cancel": 0,
            "Rejected": -1,
            "Waiting": 1
        }

        const orders = await OrderService.getOrdersByWorkerID(clientID);

        for (let i = 0; i < orders.length; i++) {
            let score1 = scoreStatus[orders[i].status];
            for (let j = i+1; j < orders.length; j++) {
                const score2 = scoreStatus[orders[j].status];

                if (score1 < score2) {
                    let tmp = orders[i];
                    orders[i] = orders[j];
                    orders[j] = tmp;
                    score1 = score2
                }
            }
        }

        const jobs = [];
        const maxJobs = orders.length<5 ? orders.length : 5;
        for (let i = 0; i < maxJobs; i++) {
            jobs.push(orders[i].job)
        }

        return jobs;
    } catch (err) {
        return [];
    }
}

const search = async (req, res ) => {
    try {
        const { query, reference } = req.body;
        const clientID = req.client.uid;
        const role = req.client.role;

        reference['role'] = role;

        const [experiences, jobs] = await Promise.all([
                getExperienceOfWorker(role, clientID),
                getJobs(clientID)
        ])

        reference['experiences'] = experiences;
        reference['jobs'] = jobs;

        console.log(reference)

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