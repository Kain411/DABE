const { db } = require("../config/firebase");
const OrderModel = require("../models/OrderModel");
const { orderStatusNotification } = require("../notifications/OrderNotification");
const { formatDate, formatDateAndTime, formatDateAndTimeNow } = require("../utils/formatDate");
const AccountService = require("./AccountService");
const JobService = require("./JobService");
const ReviewService = require("./ReviewService");
const WorkerService = require("./WorkerService");

class OrderService {
    constructor() {}

    async createOrder(data) {
        try {
            await db.collection('orders').add(data);
        } catch (err) {
            console.log(err.message);
            throw new Error("Tạo order không thành công")
        }
    }

    async getByUID(uid) {
        const orderDoc = await db.collection('orders').doc(uid).get();
        if (!orderDoc.exists) throw new Error('Order không tồn tại');

        return { uid: orderDoc.id, ...orderDoc.data() }
    }

    async checkOrder(workerID, jobID) {
        const orderRef = await db.collection('orders')
            .where('workerID', '==', workerID)
            .where('jobID', '==', jobID)
            .get()
        
        if (orderRef.empty) return true;
        return false;
    }

    async updatePayment(workerID, jobID) {
        const snapshot = await db.collection('orders').where('workerID', '==', workerID).where('jobID', '==', jobID).get();
        if (snapshot.empty) throw new Error('Không tồn tại order');
        const order = snapshot.docs[1];

        await db.collection('orders').doc(order.id).update({
            isPayment: true
        })
    }

    async getOrders() {
        try {
            const snapshot = await db.collection('orders').get();

            const orders = [];
            await Promise.all(snapshot.docs.map(async (doc) => {
                try {
                    const [ jobDoc, workerDoc ] = await Promise.all([
                        JobService.getByUID(doc.data().jobID, doc.data().serviceType),
                        WorkerService.getByUID(doc.data().workerID)
                    ])
                    
                    const order = {
                        uid: doc.id,
                        jobID: doc.data().jobID,
                        worker: workerDoc,
                        user: jobDoc.user,
                        price: doc.data().price,
                        status: doc.data().status,
                        isReview: doc.data().isReview,
                        serviceType: doc.data().serviceType,
                        createdAt: formatDateAndTime(doc.data().createdAt.toDate())
                    }

                    orders.push(order);
                } catch (err) {
                    console.log(err.message);
                    return;
                }
            }))

            return orders;
        } catch (err) {
            console.log(err.message);
            throw new Error("Get order không thành công")
        }
    }

    async getOrdersByWorkerID(workerID) {
        try {
            const snapshot = await db.collection('orders').where('workerID', '==', workerID).get();
            const orders = [];
            await Promise.all(snapshot.docs.map(async (doc) => {
                const jobDoc = await JobService.getByUID(doc.data().jobID, doc.data().serviceType);

                const tmp = {
                    uid: doc.id,
                    job: jobDoc,
                    price: doc.data().price,
                    status: doc.data().status,
                    isReview: doc.data().isReview,
                    serviceType: doc.data().serviceType,
                    createdAt: formatDateAndTime(doc.data().createdAt.toDate()),
                }

                if (tmp.isReview) {
                    const review = await ReviewService.getReviewByOrderID(tmp.uid);
                    tmp['review'] = review;
                }
                orders.push(tmp);
            }))

            return orders;
        } catch (err) {
            console.log(err.message);
            throw new Error("Thất bại")
        }
    }

    async getOrdersByJobID(jobID) {
        try {
            const snapshot = await db.collection('orders').where('jobID', '==', jobID).get();

            const orders = [];
            await Promise.all(snapshot.docs.map(async (doc) => {
                console.log(doc.data())
                if (doc.data().status!=='Waiting' && doc.data().status!=='Accepted' && doc.data().status!=='Completed') return;
                const workerDoc = await WorkerService.getByUID(doc.data().workerID);

                const tmp = {
                    uid: doc.id,
                    worker: workerDoc,
                    price: doc.data().price,
                    status: doc.data().status,
                    isReview: doc.data().isReview,
                    serviceType: doc.data().serviceType,
                    createdAt: formatDateAndTimeNow(doc.data().createdAt.toDate()),
                }

                if (tmp.isReview) {
                    const review = await ReviewService.getReviewByOrderID(tmp.uid);
                    tmp['review'] = review;
                }

                orders.push(tmp);
            }))

            return orders;
        } catch (err) {
            console.log(err.message);
            throw new Error("Thất bại")
        }
    }

    async putStatusByUID(uid, status) {
        await db.collection('orders').doc(uid).update({
            status: status
        })

        const updatedOrder = await db.collection('orders').doc(uid).get();
        const order = new OrderModel({ uid: updatedOrder.id, ...updatedOrder.data() })

        return order.getInfo()
    }

    async setRejectOrder(jobID, orderID) {
        const snapshot = await db.collection('orders').where('jobID', '==', jobID).where('status', '==', 'Waiting').get();

        await Promise.all(snapshot.docs.map(async (doc) => {
            if (doc.id!==orderID) {
                const order = await this.putStatusByUID(doc.id, 'Rejected');
                await orderStatusNotification(order);
            }
        }))
    }

    async updatePayment(orderID) {
        try {
            const orderDoc = await db.collection('orders').doc(orderID).get();
            if (!orderDoc.exists) throw new Error('Order không tồn tại');

            await db.collection('orders').doc(orderID).update({
                isPayment: true
            })
        } catch (err) {
            throw new Error('Cập nhật không thành công')
        }
    }
}

module.exports = new OrderService();