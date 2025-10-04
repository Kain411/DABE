const Joi = require('joi');

const JobValid = Joi.object({
    startTime: Joi.string().required(),
    serviceType: Joi.string().valid('CLEANING', 'HEALTHCARE', 'MAINTENANCE').required(),
    price: Joi.number().required(),
    listDays: Joi.array().items(Joi.string()).min(1).required(),
    status: Joi.string().default('Not Payment'),
    location: Joi.string().required(),
})


const CleaningJobValid = JobValid.keys({
    isCooking: Joi.boolean().required(),
    isIroning: Joi.boolean().required(),
    duration: Joi.object({
        uid: Joi.string().required(),
        fee: Joi.number().required(),
        workingHour: Joi.number().required(),
        description: Joi.string().required()
    }),
})

const HealthcareJobValid = JobValid.keys({
    workerQuantity: Joi.number().required(),
    shift: Joi.object({
        uid: Joi.string().required(),
        fee: Joi.number().required(),
        workingHour: Joi.number().required()
    }),
    services: Joi.array().items(
        Joi.object({
            uid: Joi.string().required(),
            quantity: Joi.number().valid(1, 2).required()
        })
    ).min(1).required()
})

const MaintenanceJobValid = JobValid.keys({
    services: Joi.array().items(
        Joi.object({
            uid: Joi.string().required(),
            powers: Joi.array().items(
                Joi.object({
                    uid: Joi.string().required(),
                    quantity: Joi.number().required(),
                    quantityAction: Joi.number().required()
                })
            ),
        })
    )
})

const CleaningJobCreateValid = CleaningJobValid.keys({
    userID: Joi.string().required(),
})

const HealthcareJobCreateValid = HealthcareJobValid.keys({
    userID: Joi.string().required(),
})

const MaintenanceJobCreateValid = MaintenanceJobValid.keys({
    userID: Joi.string().required(),
})

const CleaningJobGetvalid = CleaningJobValid.keys({
    uid: Joi.string().required(),
    user: Joi.object({
        uid: Joi.string().required(),
        username: Joi.string().required(),
        gender: Joi.string().required(),
        dob: Joi.string().required(),
        avatar: Joi.string().required(),
        email: Joi.string().email().required(),
        tel: Joi.string().required(),
        location: Joi.string().required(),
        role: Joi.string().valid('user').required()
    }).required(),
    createdAt: Joi.string().required(),
})

const HealthcareJobGetValid = HealthcareJobValid.keys({
    uid: Joi.string().required(),
    user: Joi.object({
        uid: Joi.string().required(),
        username: Joi.string().required(),
        gender: Joi.string().required(),
        dob: Joi.string().required(),
        avatar: Joi.string().required(),
        email: Joi.string().email().required(),
        tel: Joi.string().required(),
        location: Joi.string().required(),
        role: Joi.string().valid('user').required()
    }).required(),
    createdAt: Joi.string().required(),
})

const MaintenanceJobGetValid = MaintenanceJobValid.keys({
    uid: Joi.string().required(),
    user: Joi.object({
        uid: Joi.string().required(),
        username: Joi.string().required(),
        gender: Joi.string().required(),
        dob: Joi.string().required(),
        avatar: Joi.string().required(),
        email: Joi.string().email().required(),
        tel: Joi.string().required(),
        location: Joi.string().required(),
        role: Joi.string().valid('user').required()
    }).required(),
    createdAt: Joi.string().required()
})

module.exports = {
    CleaningJobCreateValid,
    HealthcareJobCreateValid,
    MaintenanceJobCreateValid,
    CleaningJobGetvalid,
    HealthcareJobGetValid,
    MaintenanceJobGetValid,
};