const { db } = require("../config/firebase");
const NotificationModel = require("../models/NotificationModel");

class NotificationService {
    constructor() {}

    async createNotification(notify) {
        await db.collection('notifications').add(notify);
    }

    async getByClientID(clientID) {
        try {
            const snapshot = await db.collection('notifications').where('clientID', '==', clientID).get();
            if (snapshot.empty) return [];

            const res = [
                ...snapshot.docs.map(doc => new NotificationModel({ uid: doc.id, ...doc.data() }))
            ]

            res.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

            for (let i = 0; i < res.length; i++) {
                res[i] = res[i].getInfo();
            }

            return res;
        } catch (err) {
            console.log(err.message);
            throw new Error('Không lấy được các thông báo')
        }
    }

    async putClientReaded(clientID, notificationID) {
        try {
            const notificationDoc = await db.collection('notifications').doc(notificationID).get();
            if (!notificationDoc.exists) throw new Error('Thông báo không tồn tại');

            const notificationData = {
                uid: notificationDoc.uid,
                ...notificationDoc.data()
            }
            if (notificationData.clientID!=clientID) throw new Error('ClientID của thông báo không trùng khớp');

            if (notificationDoc.data.isRead) throw new Error('Bạn đã cập nhật thông báo sang trạng thái đã đọc');

            await db.collection('notifications').doc(notificationID).update({
                isRead: true
            })

            notificationData['isRead'] = true;

            return (new NotificationModel(notificationData)).getInfo();

        } catch (err) {
            console.log(err.message);
            throw new Error('Lỗi cập nhật thông tin')
        }
    }
}

module.exports = new NotificationService();