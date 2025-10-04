const { db } = require("../config/firebase");
const { CleaningServiceModel, HealthcareServiceModel, MaintenanceServiceModel } = require("../models/ServiceModel");
const { CleaningServiceValid, HealthcareServiceValid, MaintenanceServiceValid } = require("../utils/validator/ServiceValid");

class ServiceService {
    constructor() {}

    async getCleaningServiceByUID(uid) {
        try {
            const serviceDoc = await db.collection('cleaningServices').doc(uid).get();

            if (!serviceDoc.exists) {
                throw new Error("Không tìm thấy thông tin");
            }

            return { uid: uid, ...serviceDoc.data() };
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }

    async getHealthcareServiceByUID(uid) {
        try {
            const healthcareDoc = await db.collection('healthcareServices').doc(uid).get();

            if (!healthcareDoc.exists) {
                throw new Error("Không tìm thấy thông tin");
            }

            return (new HealthcareServiceModel({ uid: uid, ...healthcareDoc.data() })).getInfo();

        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }


    async getMaintenanceServiceByUID(uid) {
        try {
            const maintenanceDoc = await db.collection('maintenanceServices').doc(uid).get();

            if (!maintenanceDoc.exists) {
                throw new Error("Không tìm thấy thông tin");
            }

            const powers = [];
            for (let powerID of maintenanceDoc.data().powers) {
                const powerDoc = await db.collection('powers').doc(powerID).get();
                if (!powerDoc.exists) continue;

                powers.push({ uid: powerDoc.id, ...powerDoc.data() })
            }

            const service = { uid: uid, ...maintenanceDoc.data(), powers: powers };

            return (new MaintenanceServiceModel(service)).getInfo();

        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }

    async getCleaningService() {
        try {
            const snapshot = await db.collection('cleaningServices').get();
            const services = [];

            for (const doc of snapshot.docs) {
                const serviceDoc = new CleaningServiceModel({ uid: doc.id, ...doc.data() });
                const validated = await CleaningServiceValid.validateAsync(serviceDoc.getInfo(), { stripUnknown: true });
                services.push(validated);
            }

            return services;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }

    async getHealthcareService() {
        try {
            const snapshot = await db.collection('healthcareServices').get();
            const services = [];

            for (const doc of snapshot.docs) {
                const serviceDoc = new HealthcareServiceModel({ uid: doc.id, ...doc.data() });
                const validated = await HealthcareServiceValid.validateAsync(serviceDoc.getInfo(), { stripUnknown: true });
                services.push(validated);
            }

            return services;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }

    async getMaintenanceService() {
         try {
            const snapshot = await db.collection('maintenanceServices').get();
            const services = [];

            await Promise.all(snapshot.docs.map(async (doc) => {

                const powers = [];
                for (let powerID of doc.data().powers) {
                    const powerDoc = await db.collection('powers').doc(powerID).get();
                    if (!powerDoc.exists) return;

                    powers.push({ uid: powerDoc.id, ...powerDoc.data() });
                    
                }

                const service = { uid: doc.id, ...doc.data(), powers: powers };

                const serviceDoc = new MaintenanceServiceModel(service);
                const validated = await MaintenanceServiceValid.validateAsync(serviceDoc.getInfo(), { stripUnknown: true });
                services.push(validated);
            }))

            return services;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }
}

module.exports = new ServiceService();