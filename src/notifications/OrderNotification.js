const { createNotify, saveAndSendNotification } = require("./tool");

const orderStatusNotification = async (order) => {
    if (order.status!=='Completed') {
       
        let content = '';
        if (order.status==='Accepted') content = 'Yêu cầu của bạn đã được chấp nhận';
        else if (order.status==='Rejected') content = 'Yêu cầu công việc của bạn bị từ chối';
        else if (order.status==='Cancel') content = 'Công việc bị hủy';

        const notify = createNotify(
            'Thông báo công việc',
            content,
            order.workerID
        )

        await saveAndSendNotification(notify);
    }
}

module.exports = { orderStatusNotification }