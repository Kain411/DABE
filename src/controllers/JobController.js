const dayjs = require('dayjs');
const JobService = require("../services/JobService");
const { failResponse, successDataResponse } = require("../utils/response");
const { CleaningJobCreateValid, HealthcareJobCreateValid, MaintenanceJobCreateValid } = require("../utils/validator/JobValid");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const ServiceService = require('../services/ServiceService');
const { jobEmbedding } = require('../ai/Embedding');

dayjs.extend(customParseFormat);

const jobEmbed = async (job) => {
    if (job.serviceType==='HEALTHCARE') {
        job.services = await Promise.all(job.services.map(async (service) => {
            const doc = await ServiceService.getHealthcareServiceByUID(service.uid);
            return {
                ...service,
                serviceName: doc.serviceName
            }
        }))
    }
    else if (job.serviceType==='MAINTENANCE') {
        job.services = await Promise.all(job.services.map(async (service) => {
            const doc = await ServiceService.getMaintenanceServiceByUID(service.uid);
            return {
                ...service,
                serviceName: doc.serviceName,
                maintenance: doc.maintenance
            }
        }))
    }

    return await jobEmbedding(job);
}

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

        const embed = await jobEmbed(job);

        if (!embed) {
            console.log(job)
            await JobService.deleteJob(job.uid, job.serviceType);
            return failResponse(res, 500, 'Embed job không thành công');
        }

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

module.exports = {
    createJob,
    getJobNew,
    getByUID,
    getJobsByUserID,
    getJobsByServiceType,
}