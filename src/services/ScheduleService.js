const { db } = require("../config/firebase");
const JobService = require('./JobService');

class ScheduleService {
    constructor() {}

    async getScheduleOfWorker(workerID, date) {
        const snapshotOrders = await db.collection('orders').where('workerID', '==', workerID).get();

        const result = [];
        await Promise.all(snapshotOrders.docs.map(async (doc) => {
            const order = { uid: doc.id, ...doc.data() };

            const db_name = `${order.serviceType.toLowerCase()}Jobs`;
            const jobDoc = await db.collection(db_name).doc(order.jobID).get();

            if (jobDoc.exists && jobDoc.data().listDays.includes(date)) {
                const job = await JobService.getJob(jobDoc.id, jobDoc.data());
                result.push(job);
            }
        }))

        return result;
    }
}

module.exports = new ScheduleService();