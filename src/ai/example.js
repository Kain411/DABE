const { db } = require("../config/firebase");
const JobService = require("../services/JobService");
const ServiceService = require("../services/ServiceService");
const { jobEmbedding } = require("./Embedding");

const getJob = async (jobID, serviceType) => {

    const job = await JobService.getByUID(jobID, serviceType);
    
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

    await jobEmbedding(job);
}

const example = async () => {
    const [snapshotCleaning, snapshotHealthcare, snapshotMaintenance] = await Promise.all([
        db.collection('cleaningJobs').where('status', '==', 'Hiring').get(),
        db.collection('healthcareJobs').where('status', '==', 'Hiring').get(),
        db.collection('maintenanceJobs').where('status', '==', 'Hiring').get()
    ])

    const allJobs = [
        ...snapshotCleaning.docs.map((doc) => ({ uid: doc.id, data: doc.data() })),
        ...snapshotHealthcare.docs.map((doc) => ({ uid: doc.id, data: doc.data() })),
        ...snapshotMaintenance.docs.map((doc) => ({ uid: doc.id, data: doc.data() }))
    ]

    Promise.all(
        allJobs.map(async (doc) => {
            try {
                const job = await getJob(doc.uid, doc.data.serviceType);
            } catch (err) {
                console.error(err.message);
            }
        })
    )
}

const run = () => {
    example();
}



module.exports = { run };