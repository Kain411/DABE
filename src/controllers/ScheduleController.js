const ScheduleService = require("../services/ScheduleService");
const { failResponse, successDataResponse } = require("../utils/response");

const getScheduleOfWorker = async (req, res) => {
    try {
        const workerID = req.client.uid;
        const { date } = req.query;

        const result = await ScheduleService.getScheduleOfWorker(workerID, date);

        return successDataResponse(res, 200, result, 'jobs');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

module.exports = {
    getScheduleOfWorker,
}