const { deleteJob } = require("../ai/Embedding");
const { db } = require("../config/firebase");
const JobService = require("../services/JobService");
const OrderService = require("../services/OrderService");
const { orderStatusNotification } = require("./OrderNotification");
const { createNotify, saveAndSendNotification } = require("./tool");

let cleaningJobCancel = null;
let healthcareJobCancel = null;
let maintenanceJobCancel = null;

const dayOfMonth = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
}

const getNotPaymentDayCancle = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');

    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    day += 2;
    if (day > dayOfMonth[month]) {
        day = day - dayOfMonth[month];
        month += 1;

        if (month>12) {
            month = 1;
            year += 1;
        }
    }

    return `${pad(day)}/${pad(month)}/${year}`;
}

const getHiringDayCancel = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');

    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    day += 1;
    if (day > dayOfMonth[month]) {
        day = 1;
        month += 1;

        if (month>12) {
            month = 1;
            year += 1;
        }
    }

    return `${pad(day)}/${pad(month)}/${year}`;
}

const sendNotify = async (clientID) => {
    const notify = createNotify(
        'Thông báo công việc',
        'Công việc đã bị hủy',
        clientID
    )
    await saveAndSendNotification(notify);
}

const checkJob = (serviceType, collectionName, intervalRef) => {
    if (intervalRef.value) return;

    intervalRef.value = setInterval(async () => {
        const notPaymentDayCancel = getNotPaymentDayCancle();
        const hiringDayCancel = getHiringDayCancel();
        
        const snapshot = await db.collection(collectionName).where('status', 'in', ['Not Payment', 'Hiring']).get();
        
        await Promise.all(snapshot.docs.map(async (doc) => {
            const job = { uid: doc.id, ...doc.data() };

            if (job.status==='Not Payment' && job.listDays.includes(notPaymentDayCancel)) {
                await JobService.putStatusByUID(job.uid, serviceType, 'Cancel');
                await deleteJob(job.uid);
                await sendNotify(job.userID);
            } 
            else if (job.status==='Hiring' && job.listDays.includes(hiringDayCancel)) {
                const snapshotOrders = await db.collection('orders').where('jobID', '==', job.uid).get();
                let workerQuanity = 1;
                if (serviceType==='HEALTHCARE') workerQuanity = job.workerQuanity;

                const filterOrder = snapshotOrders.docs.filter(doc => doc.status==='Accepted');
                if (filterOrder>=workerQuanity) return;

                await Promise.all([
                    await JobService.putStatusByUID(job.uid, serviceType, 'Cancel'),
                    await deleteJob(job.uid),
                    await sendNotify(job.userID),
                    snapshotOrders.docs.map(async (orderDoc) => {
                        const order = { uid: orderDoc.id, ...orderDoc.data() };

                        if (order.status==='Rejected') return;

                        const updatedOrder = await OrderService.putStatusByUID(order.uid, 'Cancel');
                        await orderStatusNotification(updatedOrder);
                    })
                ])
            }
        }))
    }, 24*60*60000);
}

const checkCleaningJob = () => checkJob('CLEANING', 'cleaningJobs', { value: cleaningJobCancel });
const checkHealthcareJob = () => checkJob('HEALTHCARE', 'healthcareJobs', { value: healthcareJobCancel });
const checkMaintenanceJob = () => checkJob('MAINTENANCE', 'maintenanceJobs', { value: maintenanceJobCancel });

module.exports = { checkCleaningJob, checkHealthcareJob, checkMaintenanceJob };