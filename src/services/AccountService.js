const { db } = require("../config/firebase");
const AccountModel = require("../models/AccountModel");

class AccountService {
    constructor() {}

    async getAccounts() {
        try {  
            const snapshot = await db.collection('accounts').get();

            const accounts = [];
            snapshot.docs.map(doc => {
                accounts.push((new AccountModel({ uid: doc.id, ...doc.data() })).getInfo());
            })

            return accounts;

        } catch (err) {
            throw new Error("Không thể get")
        }
    }

    async getByUID(uid) {
        try {
            const accountDoc = await db.collection('accounts').doc(uid).get();

            if (!accountDoc.exists) {
                throw new Error("Tài khoản không tồn tại")
            }

            const accountModel = new AccountModel({ uid: accountDoc.id, ...accountDoc.data() })

            return accountModel.getInfo();
        } catch (err) {
            console.error(err);
            throw new Error("Không tìm thấy tài khoản")
        }
    }

    async createAccount(validated) {
        try {
            const {uid, ...data} = (new AccountModel(validated)).getInfo();
            await db.collection('accounts').doc(uid).set(data);

            return validated;
        } catch (err) {
            console.error(err.message);
            throw new Error("Đăng ký không thành công")
        }
    }
}

module.exports = new AccountService();