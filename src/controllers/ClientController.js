const UserService = require("../services/UserService");
const WorkerService = require("../services/WorkerService");
const AdminService = require("../services/AdminService");
const { failResponse, successDataResponse, successResponse } = require("../utils/response");
const { UserValid, WorkerValid, AdminValid } = require("../utils/validator/ClientValid");
const { ForgotPasswordValid, ChangePasswordValid } = require("../utils/validator/AuthValid");
const { auth } = require("../config/firebase");
const AccountService = require("../services/AccountService");
const { formatDate } = require("../utils/formatDate");

const getClients = async (req, res) => {
    try {
        const accounts = await AccountService.getAccounts();

        const users = [];
        const workers = [];
        const admins = [];
        await Promise.all(accounts.map(async (account) => {
            try {
                if (account.role==='user') {
                    const user = await UserService.getByUID(account.uid);
                    users.push({ ...user, ban: account.ban });
                }
                else if (account.role==='worker') {
                    const worker = await WorkerService.getByUID(account.uid);
                    workers.push({ ...worker, ban: account.ban });
                }
                else if (account.role==='admin') {
                    const admin = await AdminService.getByUID(account.uid);
                    admins.push({ ...admin, ban: account.ban });
                }
            } catch (err) {
                return;
            }
        }))

        return successDataResponse(res, 200, { admins: admins, users: users, workers: workers });
    } catch (err) {
        return failResponse(res, 500, err.message)
    }
}

const forgotPassword = async (req, res) => {
    try {
        const rawData = req.body;
        const validated = await ForgotPasswordValid.validateAsync(rawData, { stripUnknown: true });

        const userRecord = await auth.getUserByEmail(validated.email);
        await auth.updateUser(userRecord.uid, {
            password: validated.newPassword
        })

        return successResponse(res, 200, "Mật khẩu đã được thay đổi")

    } catch (err) {
        return failResponse(res, 500, err.message)
    }
}

const changePassword = async (req, res) => {
    try {
        const emailToken = req.client.email;
        const rawData = req.body;
        const validated = await ChangePasswordValid.validateAsync({email: emailToken, ...rawData}, { stripUnknown: true });

        const clientRecord = await auth.getUserByEmail(validated.email);
        await auth.updateUser(clientRecord.uid, {
            password: validated.newPassword
        })

        return successResponse(res, 200, "Mật khẩu đã được thay đổi")

    } catch (err) {
        return failResponse(res, 500, err.message)
    }
}

const updateClient = async (req, res) => {
    try {
        const rawData = req.body;

        let clientData;
        if (req.body.role==='user') {
            const validated = await UserValid.validateAsync(rawData, { stripUnknown: true });
            clientData = await UserService.updateUser(validated);
        }
        else if (req.body.role==='worker') {
            const validated = await WorkerValid.validateAsync(rawData, { stripUnknown: true });
            clientData = await WorkerService.updateWorker(validated);
        }
        else if (req.body.role==='admin') {
            const validated = await AdminValid.validateAsync(rawData, { stripUnknown: true });
            clientData = await AdminService.updateAdmin(validated);
        }
        clientData['dob'] = formatDate(typeof clientData['dob']==='function' ? clientData['dob'].toDate() : clientData['dob'])
        clientData["email"] = req.body.email;
        clientData["role"] = req.body.role;
        return successDataResponse(res, 200, clientData, 'user')
    } catch (err) {
        return failResponse(res, 500, err.message)
    }
}

module.exports = {
    getClients,
    forgotPassword,
    changePassword,
    updateClient,
}