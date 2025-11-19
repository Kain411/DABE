const { formatDate } = require("../utils/formatDate");

class JobModel {
    constructor(data) {
        this.uid = data.uid;
        this.userID = data.userID;
        this.price = data.price;
        this.startTime = data.startTime;
        this.listDays = data.listDays;
        this.status = data.status;
        this.serviceType = data.serviceType;
        this.location = data.location;
        this.lat = data.lat;
        this.lon = data.lon;
        this.createdAt = formatDate(typeof data.createdAt.toDate==='function' ? data.createdAt.toDate() : data.createdAt);
    }

    getInfo() {
        return {
            uid: this.uid,
            userID: this.userID,
            price: this.price,
            startTime: this.startTime,
            listDays: this.listDays,
            status: this.status,
            serviceType: this.serviceType,
            location: this.location,

        }
    }
}

// ----------------------------------------------------

class CleaningJobModel extends JobModel {
    constructor(data) {
        super(data);
        this.durationID = data.durationID;
        this.isCooking = data.isCooking;
        this.isIroning = data.isIroning;
    }

    getInfo() {
        return {
            ...super.getInfo(),
            durationID: this.durationID,
            isCooking: this.isCooking,
            isIroning: this.isIroning
        }
    }
}

// ----------------------------------------------------

class HealthcareJobModel extends JobModel {
    constructor(data) {
        super(data);
        this.workerQuantity = data.workerQuantity;
        this.shiftID = data.shiftID;
        this.services = data.services;
    }

    getInfo() {
        return {
            ...super.getInfo(),
            workerQuantity: this.workerQuantity,
            shiftID: this.shiftID,
            services: this.services
        }
    }
}

// ----------------------------------------------------

class MaintenanceJobModel extends JobModel {
    constructor(data) {
        super(data);
        this.services = data.services;
    }

    getInfo() {
        return {
            ...super.getInfo(),
            services: this.services
        }
    }
}

module.exports = {
    CleaningJobModel,
    HealthcareJobModel,
    MaintenanceJobModel
}