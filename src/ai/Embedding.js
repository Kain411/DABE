const { default: axios } = require("axios");
const dotenv = require('dotenv');
dotenv.config();

const jobEmbedding = async (job) => {
    try {
        const response = await axios.post(`${process.env.AI_URL}/job-embedding`, job)

    } catch (err) {
        console.log(err.message);
    }
}

const updateMetadataStatus = async (jobID, status) => {
    try {
        const response = await axios.put(`${process.env.AI_URL}/update-metadata/status`,
            {
                uid: jobID,
                status: status
            }
        )

        return true;
    } catch (err) {
        console.log(err.message);
        return false;
    }
}

const deleteJob = async (jobID) => {
    try {
        const response = await axios.delete(`${process.env.AI_URL}/job/${jobID}`)

        console.log(response);

    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    jobEmbedding,
    updateMetadataStatus,
    deleteJob
}