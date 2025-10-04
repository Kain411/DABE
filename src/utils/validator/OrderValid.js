const Joi = require('joi');

const OrderCreateValid = Joi.object({
    jobID: Joi.string().required(),
    workerID: Joi.string().required(),
    status: Joi.string().default('Waiting'),
    isReview: Joi.boolean().default(false),
    serviceType: Joi.string().valid('CLEANING', 'HEALTHCARE', 'MAINTENANCE').required(),
    createdAt: Joi.date().default(new Date()),
})

const OrderUpdateStatusValid = Joi.object({
    uid: Joi.string().required(),
    status: Joi.string().valid('Accepted', 'Rejected')
})

module.exports = { OrderCreateValid, OrderUpdateStatusValid };