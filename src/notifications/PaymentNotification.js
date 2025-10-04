const { createNotify, saveAndSendNotification } = require("./tool");

const checkPaymentNotification = async (clientID, amount) => {

    const content = `Bạn đã thanh toán thành công số tiền ${amount} VND.\nCông việc đã được đăng tải.`;
    const notify = createNotify('Thanh toán thành công', content, clientID);

    await saveAndSendNotification(notify);
}

module.exports = { checkPaymentNotification }