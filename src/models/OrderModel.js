const { formatDateAndTime } = require("../utils/formatDate");

class OrderModel {
    constructor(data) {
        this.uid = data.uid;
        this.workerID = data.workerID;
        this.jobID = data.jobID;
        this.price = data.price;
        this.isReview = data.isReview;
        this.status = data.status;
        this.createdAt = formatDateAndTime(typeof data.createdAt.toDate==='function' ? data.createdAt.toDate() : data.createdAt);
        this.serviceType = data.serviceType;
    }

    getInfo() {
        return {
            uid: this.uid,
            workerID: this.workerID,
            jobID: this.jobID,
            price: this.price,
            isReview: this.isReview,
            status: this.status,
            createdAt: this.createdAt,
            serviceType: this.serviceType
        }
    }
}

module.exports = OrderModel;