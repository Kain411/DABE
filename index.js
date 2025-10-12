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

const ChatBoxRouter = require('./src/routes/ChatBoxRouter');
app.use('/api/chatbox', ChatBoxRouter);

const { cleaningJobSchedule, healthcareJobSchedule } = require('./src/notifications/JobNotifications');
const { checkCleaningJob, checkHealthcareJob, checkMaintenanceJob } = require('./src/notifications/JobCancel');

// Promise.all([
//     cleaningJobSchedule(),
//     healthcareJobSchedule(),
//     checkCleaningJob(),
//     checkHealthcareJob(),
//     checkMaintenanceJob()
// ])

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running...')
});