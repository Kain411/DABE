const dayjs = require('dayjs');
const JobService = require("../services/JobService");
const { failResponse, successDataResponse, successResponse } = require("../utils/response");
const { CleaningJobCreateValid, HealthcareJobCreateValid, MaintenanceJobCreateValid } = require("../utils/validator/JobValid");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const OrderService = require('../services/OrderService');
const { saveAndSendNotification, createNotify } = require('../notifications/tool');
const { deleteJob } = require('../ai/Embedding');

dayjs.extend(customParseFormat);

const createJob = async (req, res) => {
    try {
        const { serviceType } = req.params;
        const rawData = req.body;

        const type = serviceType.toUpperCase();

        const configs = {
            CLEANING: {
                validator: CleaningJobCreateValid,
                creator: JobService.createCleaningJob
            },
            HEALTHCARE: {
                validator: HealthcareJobCreateValid,
                creator: JobService.createHealthcareJob
            },
            MAINTENANCE: {
                validator: MaintenanceJobCreateValid,
                creator: JobService.createMaintenanceJob
            },
        }

        const config = configs[type]
        if (!config) {
            return failResponse(res, 400, `Invalid serviceType: ${serviceType}`);
        }

        const validated = await config.validator.validateAsync(rawData, { stripUnknown: true });
        const job = await config.creator(validated);

        return successDataResponse(res, 200, job, 'newJob');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

const getJobNew = async (req, res) => {
    try {
        const jobs = await JobService.getJobNew();

        return successDataResponse(res, 200, jobs, 'jobs');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

const getByUID = async (req, res) => {
    try {
        const { jobID, serviceType } = req.params;

        const job = await JobService.getByUID(jobID, serviceType.toUpperCase());
        return successDataResponse(res, 200, job, 'job');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

const getJobsByUserID = async (req, res) => {
    try {
        const { userID } = req.params;

        const jobs = await JobService.getJobsByUserID(userID);

        return successDataResponse(res, 200, jobs, 'jobs');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

const getJobsByServiceType = async (req, res) => {
    try {
        const { serviceType } = req.params;

        const jobs = await JobService.getJobsByServiceType(serviceType); 
        return successDataResponse(res, 200, jobs, 'jobs');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

const cancelJob = async (req, res) => {
    try {
        console.log('in')
        const { jobID, serviceType } = req.params;

        const orders = await OrderService.getOrdersByJobID(jobID);
        await deleteJob(jobID);
        await Promise.all(orders.map(async (doc) => {
            console.log(doc)
            const order = await OrderService.putStatusByUID(doc.uid, 'Cancel');
            const notify = createNotify(
                'Thông báo công việc',
                'Công việc đã bị hủy',
                doc.worker.uid
            )
            await saveAndSendNotification(notify);
        }))
        await JobService.putStatusByUID(jobID, serviceType, 'Cancel');

        return successResponse(res, 200, 'Thành công');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

module.exports = {
    createJob,
    getJobNew,
    getByUID,
    getJobsByUserID,
    getJobsByServiceType,
    cancelJob
}