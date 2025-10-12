const OrderService = require("../services/OrderService");
const { failResponse, successResponse, successDataResponse } = require("../utils/response");
const { OrderCreateValid } = require("../utils/validator/OrderValid");

const { orderStatusNotification } = require("../notifications/OrderNotification");
const JobService = require("../services/JobService");
const AccountService = require("../services/AccountService");

const createOrder = async (req, res) => {
    try {
        const rawData = req.body;

        const validated = await OrderCreateValid.validateAsync(rawData, { stripUnknown: true });

        const checkServiceType = await JobService.checkServiceType(validated.jobID, validated.serviceType);
        if (!checkServiceType) {
            return failResponse(res, 500, `ServiceType của Job khác với ServiceType body`);
        }

        const success = await OrderService.checkOrder(validated.workerID, validated.jobID);

        if (!success) {
            return failResponse(res, 500, 'Bạn đã ứng tuyển vào công việc này!')
        }

        const price = await JobService.getPrice(validated.jobID, validated.serviceType);
        validated['price'] = price;

        await OrderService.createOrder(validated);
        return successResponse(res, 200, 'Thành công')
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message)
    }
}

const getOrders = async (req, res) => {
    try {
        const orders = await OrderService.getOrders();

        return successDataResponse(res, 200, orders, 'orders');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message)
    }
}

const getOrdersByJobID = async (req, res) => {
    try {
        const { jobID } = req.params;

        const orders = await OrderService.getOrdersByJobID(jobID);

        return successDataResponse(res, 200, orders, 'orders');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message)
    }
}

const getOrdersByWorkerID = async (req, res) => {
    try {
        const { workerID } = req.params;

        const orders = await OrderService.getOrdersByWorkerID(workerID);

        return successDataResponse(res, 200, orders, 'orders');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message)
    }
}


const checkOrderQuantity = async (uid) => {
    const order = await OrderService.getByUID(uid);

    let workerQuantity = 1;
    const job = await JobService.getByUID(order.jobID, order.serviceType);
    
    if (job.serviceType==='HEALTHCARE') workerQuantity = job.workerQuantity;

    const orders = await OrderService.getOrdersByJobID(job.uid);

    const filterOrders = orders.filter(doc => doc.status==='Accepted');

    if (filterOrders.length<workerQuantity) {
        if (filterOrders.length+1==workerQuantity) {
            await OrderService.setRejectOrder(job.uid, order.uid);
        }
        return true;
    }
    return false;
}

const putStatusByUID = async (req, res) => {
    try {
        const clientID = req.client.uid;
        const { uid, status } = req.body;

        const account = await AccountService.getByUID(clientID)

        if (status!=='Accepted' && status!=='Rejected' && status!=='Cancel') {
            failResponse(res, 401, 'Sai trạng thái');
        }

        let check = true;
        if (status==='Accepted') {
            check = await checkOrderQuantity(uid);
        }

        if (status==='Cancel' && account.role==='worker') {
            const order = await OrderService.getByUID(uid);
            if (order.status!=='Waiting') {
                return failResponse(res, 200, 'Bạn không thể hủy order khi không ở trạng thái Chờ (Waiting)')
            }
        } 

        if (check) {
            const updatedOrder = await OrderService.putStatusByUID(uid, status);
            await orderStatusNotification(updatedOrder);

            return successDataResponse(res, 200, updatedOrder, 'updatedOrder');
        }
        else return failResponse(res, 500, 'Số lượng worker đạt giới hạn')
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message)
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrdersByWorkerID,
    getOrdersByJobID,
    putStatusByUID,
};