const { auth, db } = require('../config/firebase');
const { failResponse } = require('../utils/response');

const checkPermission = (roles) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader?.startsWith("Bearer ")) {
            return failResponse(res, 401, "Missing token");
        }
    
        const idToken = authHeader.split('Bearer ')[1];
    
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            req.client = decodedToken;

            const accountDoc = await db.collection('accounts').doc(req.client.uid).get();
            if (!accountDoc.exists) {
                return failResponse(res, 400, "Không tìm thấy thông tin");
            }

            const accountData = accountDoc.data();
            
            if (!roles.includes(String(accountData.role).trim())) {
                return failResponse(res, 403, "Không được phép truy cập");
            }

            next();
        } catch (error) {
            return failResponse(res, 401, "Token không hợp lệ");
        }
    }
}

module.exports = { checkPermission };