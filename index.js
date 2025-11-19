const express = require('express')
const cors = require('cors');

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json());

const ImageRouter = require('./src/routes/ImageRouter');
app.use('/api/images', ImageRouter);

const EmailRouter = require('./src/routes/EmailRouter');
app.use('/api/emails/', EmailRouter);

const AuthRouter = require('./src/routes/AuthRouter');
app.use('/api/auth', AuthRouter);

const ClientRouter = require('./src/routes/ClientRouter');
app.use('/api/users', ClientRouter);

const ServiceRouter = require('./src/routes/ServiceRouter');
app.use('/api/services', ServiceRouter);

const JobRouter = require('./src/routes/JobRouter');
app.use('/api/jobs', JobRouter);

const OrderRouter = require('./src/routes/OrderRouter');
app.use('/api/orders', OrderRouter);

const ScheduleRouter = require('./src/routes/ScheduleRouter');
app.use('/api/schedules', ScheduleRouter);

const ReviewRouter = require('./src/routes/ReviewRouter');
app.use('/api/reviews', ReviewRouter);

const DeviceRouter = require('./src/routes/DeviceRouter');
app.use('/api/devices', DeviceRouter);

const NotificationRouter = require('./src/routes/NotificationRouter');
app.use('/api/notifications', NotificationRouter);

const PaymentRouter = require('./src/routes/PaymentRouter');
app.use('/api/payments', PaymentRouter);

const PolicyRouter = require('./src/routes/PolicyRouter');
app.use('/api/policies', PolicyRouter);

const ChatBotRouter = require('./src/routes/ChatBotRouter');
app.use('/api/chatbot', ChatBotRouter);

const { cleaningJobSchedule, healthcareJobSchedule } = require('./src/notifications/JobNotifications');
const { checkCleaningJob, checkHealthcareJob, checkMaintenanceJob } = require('./src/notifications/JobCancel');
const { getLatLon } = require('./src/utils/getLatLon');

// Promise.all([
//     cleaningJobSchedule(),
//     healthcareJobSchedule(),
//     checkCleaningJob(),
//     checkHealthcareJob(),
//     checkMaintenanceJob()
// ])

// getLatLon("Phường Bình Hòa, Thuận An, Thành phố Hồ Chí Minh, Việt Nam")
// getLatLon("181 Ng. 634 Đ. Kim Giang, Thanh Liệt, Thanh Trì, Hà Nội, Việt Nam")
getLatLon("Số 40, phố Nhà Thờ, Phường Hàng Trống, Quận Hoàn Kiếm, Hà Nội")

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running...')
});