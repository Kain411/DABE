const { db } = require("../config/firebase");
const { WorkerModel } = require("../models/ClientModel");
const { formatDate } = require("../utils/formatDate");
const AccountService = require("./AccountService");

class WorkerService {
    constructor() {}

    async getByUID(uid) {
        try {
            const workerDoc = await db.collection('workers').doc(uid).get();

            if (!workerDoc.exists) {
                throw new Error("Người dùng không tồn tại")
            }

            const accountDoc = await AccountService.getByUID(uid);
            const workerData = workerDoc.data();
            workerData['email'] = accountDoc.email;
            workerData['role'] = accountDoc.role;
            workerData['provider'] = accountDoc.provider

            const worker = new WorkerModel({ uid: uid, ...workerData })

            return worker.getInfo();
        } catch (err) {
            console.error(err.message);
            throw new Error("Không tìm thấy thông tin")
        }
    }

    async createWorker(validated) {
        const {uid, ...data} = validated;
        try {
            await db.collection('workers').doc(uid).set(data);
        } catch (err) {
            console.error(err.message);
            throw new Error("Đăng ký không thành công")
        }
    }

    async updateWorker(validated) {
        const {uid, ...data} = validated;
        try {
            const workerRef = db.collection('workers').doc(uid);
            await workerRef.update(data);

            return validated;
        } catch (err) {
            console.error(err.message);
            throw new Error("Cập nhật không thành công")
        }
    }
}

module.exports = new WorkerService();