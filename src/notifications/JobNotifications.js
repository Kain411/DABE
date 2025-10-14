const { updateMetadataStatus, deleteJob } = require("../ai/Embedding");
const { db } = require("../config/firebase");
const JobService = require("../services/JobService");
const OrderService = require("../services/OrderService");
const TimeService = require("../services/TimeService");
const { createNotify, saveAndSendNotification } = require("./tool");

let cleaningJobInterval = null;
let healthcareJobInterval = null;

const title = 'Thông báo công việc';

const pad = (n) => n.toString().padStart(2, '0');

const getTimeNotication = () => {
    const now = new Date();

    const day = pad(now.getDate());
    const month = pad((now.getMonth() + 1));
    const year = now.getFullYear();
    const hour = now.getHours();
    const minute = now.getMinutes();

    let hour30 = hour, minute30 = minute;

    if (minute30<30) {
        hour30 = (hour30 - 1 + 24) % 24;
        minute30 += 30;
    }
    else minute30 -= 30;

    return {
        date: `${day}/${month}/${year}`,
        time: `${pad(hour)}:${pad(minute)}`,
        time30: `${pad(hour30)}:${pad(minute30)}`
    }
}

const getEndTime = async (startTime, uid, serviceType) => {

    let hour = parseInt(startTime.split(':')[0]);
    const minute = startTime.split(':')[1];
    if (serviceType==='CLEANING') {
        const { workingHour } = await TimeService.getDurationByID(uid);
        hour = (hour + workingHour) % 24;
    }
    else if (serviceType==='HEALTHCARE') {
        const { workingHour } = await TimeService.getShiftByID(uid);
        hour = (hour + workingHour) % 24;
    }

    return `${pad(hour)}:${minute}`;
}

const findUserOfJob = async (job, content) => {

    const notify = createNotify(title, content, job.userID)
    await saveAndSendNotification(notify);
}

const findWorkerAndNotify = async (job, content) => {
    const snapshotOrder = await db.collection("orders").where('jobID', '==', job.uid).get();
    if (snapshotOrder.empty) return;

    const docs = snapshotOrder.docs.filter(d => d.data().status==='Accepted' || d.data().status==='Processing');
    if (docs.length==0) return;

    await Promise.allSettled(docs.map(async (doc) => {
        if (doc.data().status!=job.status) {
            await OrderService.putStatusByUID(doc.id, job.status);
        }

        const notify = createNotify(title, content, job.userID)
        await saveAndSendNotification(notify);
    }))
}

const jobSchedule = (serviceType, collectionName, intervalRef) => {
    if (intervalRef.value) return;

    intervalRef.value = setInterval(async () => {
        
        const { date, time, time30 } = getTimeNotication();

        const snapshot = await db.collection(collectionName).where('status', 'not-in', ['Not Payment', 'Completed']).get();

        await Promise.all(snapshot.docs.map(async (doc) => {
            const job = { uid: doc.id, ...doc.data() }

            let endTime;
            try {
                if (serviceType==='CLEANING') {
                    endTime = await getEndTime(job.startTime, job.durationID, job.serviceType);
                }
                else if (serviceType==='HEALTHCARE') {
                    endTime = await getEndTime(job.startTime, job.shiftID, job.serviceType);
                }
            } catch (err) {
                return;
            }

            const isToday = job.listDays.includes(date);
            if (!isToday) return;

            let content = '';

            if (job.startTime===time30) {
                content = 'Công việc sẽ bắt đầu sau 30 phút.\n Vui lòng sắp xếp di chuyển để thực hiện công việc.';
                
            }
            else if (job.startTime===time) {
                if (job.status!=='Processing') {
                    await JobService.putStatusByUID(job.uid, job.serviceType, 'Processing');
                    await deleteJob(job.uid);
                    job['status'] = 'Processing';
                }
                content = 'Công việc đã bắt đầu.';
            }
            else if (endTime===time) {
                if (job.listDays.indexOf(date)===job.listDays.length-1) {
                    await JobService.putStatusByUID(job.uid, job.serviceType, 'Completed');
                    job['status'] = 'Completed'
                }
                content = 'Công việc đã kết thúc';
            }

            if (content!=='') {
                await Promise.all([
                    findWorkerAndNotify(job, content),
                    findUserOfJob(job, content)
                ])
            }
        }))
    }, 60000);
};

const cleaningJobSchedule = () => jobSchedule('CLEANING', 'cleaningJobs', { value: cleaningJobInterval });
const healthcareJobSchedule = () => jobSchedule('HEALTHCARE', 'healthcareJobs', { value: healthcareJobInterval });

module.exports = { cleaningJobSchedule, healthcareJobSchedule };