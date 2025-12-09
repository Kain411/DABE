const { formatDate } = require("../utils/formatDate");

class ClientModel {
    constructor(data) {
        this.uid = data.uid;
        this.username = data.username;
        this.gender = data.gender;
        this.dob = formatDate(typeof data.dob.toDate==='function' ? data.dob.toDate() : data.dob);
        this.avatar = data.avatar;
        this.email = data.email;
        this.tel = data.tel;
        this.location = data.location;
        this.role = data.role;
        this.provider = data.provider;
    }

    getInfo() {
        return {
            uid: this.uid,
            username: this.username,
            gender: this.gender,
            dob: this.dob,
            avatar: this.avatar,
            email: this.email,
            tel: this.tel,
            location: this.location,
            role: this.role,
            provider: this.provider
        }
    }
}

// ------------------------------------------------

class UserModel extends ClientModel {
    constructor(data) {
        super(data);
    }

    getInfo() {
        return { ...super.getInfo() }
    }
}

// ------------------------------------------------

class AdminModel extends ClientModel {
    constructor(data) {
        super(data);
    }

    getInfo() {
        return { ...super.getInfo() }
    }
}

// ------------------------------------------------

class WorkerModel extends ClientModel {
    constructor(data) {
        super(data);
        this.description = data.description;
    }

    getInfo() {
        return {
            ...super.getInfo(),
            description: this.description
        }
    }
}

module.exports = {
    UserModel,
    WorkerModel,
    AdminModel
};