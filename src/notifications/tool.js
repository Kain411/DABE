const { db, admin } = require("../config/firebase");
const NotificationService = require("../services/NotificationService");

const createNotify = (title, content, clientID) => {
    return {
        title: title,
        content: content,
        clientID: clientID,
        isRead: false,
        createdAt: new Date()
    }
}

const deleteFcmToken = async (response, clientID, devices) => {
    const tokens = [];
    console.log(response)
    for (let i = 0; i < response.responses.length; i++) {
        const res = response.responses[i];
        const validToken = devices[i];

        if (res.success) {
            tokens.push(validToken);
        }
    }
    await db.collection('devices').doc(clientID).update({
        devices: tokens
    })
}

const findDevices = async (clientID, notify) => {
    const deviceDoc = await db.collection('devices').doc(clientID).get();
    if (!deviceDoc.exists) return;

    const devices = deviceDoc.data().devices;
    if (!devices || devices.length===0) return;

    const message = {
        tokens: devices,
        notification: {
            title: notify.title,
            body: notify.content
        }
    }        
    const response = await admin.messaging().sendEachForMulticast(message);

    if (response.failureCount!==0) {
        deleteFcmToken(response, clientID, devices);
    }
}

const saveAndSendNotification = async (notify) => {
    await Promise.all([
        await NotificationService.createNotification(notify),
        await findDevices(notify.clientID, notify.content)
    ])
}

module.exports = {
    createNotify,
    deleteFcmToken,
    findDevices,
    saveAndSendNotification
}