const { db } = require("../config/firebase");
const PaymentModel = require("../models/PaymentModel");

class PaymentService {
    constructor() {}

    async createPayment(userID, jobID, amount, serviceType) {
        try {
            await db.collection('payments').add({
                userID: userID,
                jobID: jobID,
                amount: amount,
                serviceType: serviceType,
                createdAt: new Date()
            })
        } catch (err) {
            console.log(err.message);
            throw new Error('Tạo thanh toán không thành công');
        }
    }

    async getPayments() {
        try {
            const snapshot = await db.collection('payments').get();
            const payments = [];

            snapshot.docs.map(doc => {
                payments.push(
                    (new PaymentModel({ uid: doc.id, ...doc.data() })).getInfo()
                )
            })

            return payments;

        } catch (err) {
            console.log(err.message);
            throw new Error('Không tìm thấy payments');
        }
    }

    async getPaymentsUser(userID) {
        try {
            const snapshot = await db.collection('payments').where('userID', '==', userID).get();
            const payments = [];

            snapshot.docs.map(doc => {
                payments.push(
                    (new PaymentModel({ uid: doc.id, ...doc.data() })).getInfo()
                )
            })

            return payments;

        } catch (err) {
            console.log(err.message);
            throw new Error('Không tìm thấy payments');
        }
    }
}

module.exports = new PaymentService();