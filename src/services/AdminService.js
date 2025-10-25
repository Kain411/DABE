const { db } = require("../config/firebase");
const { AdminModel } = require("../models/ClientModel");
const { formatDate } = require("../utils/formatDate");
const AccountService = require("./AccountService");

class AdminService {
    constructor() {}

    async getByUID(uid) {
        try {
            const adminDoc = await db.collection('admins').doc(uid).get();

            if (!adminDoc.exists) {
                throw new Error("Người dùng không tồn tại")
            }

            const accountDoc = await AccountService.getByUID(uid);
            const adminData = adminDoc.data();
            adminData['email'] = accountDoc.email;
            adminData['role'] = accountDoc.role;
            adminData['provider'] = accountDoc.provider

            const admin = new AdminModel({ uid: uid, ...adminData })

            return admin.getInfo();
        } catch (err) {
            console.error(err.message);
            throw new Error("Không tìm thấy thông tin")
        }
    }

    async createAdmin(validated) {
        const {uid, ...data} = validated;
        try {
            await db.collection('admins').doc(uid).set(data);
        } catch (err) {
            console.error(err.message);
            throw new Error("Đăng ký không thành công")
        }
    }

    async updateAdmin(validated) {
        const {uid, ...data} = validated;
        try {
            const adminRef = db.collection('admins').doc(uid);
            await adminRef.update(data);

            return validated;
        } catch (err) {
            console.error(err.message);
            throw new Error("Cập nhật không thành công")
        }
    }
}

module.exports = new AdminService();