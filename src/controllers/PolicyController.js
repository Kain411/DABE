const fs = require('fs').promises;
const path = require('path');

const { failResponse, successDataResponse } = require("../utils/response");


const getPolicies = async (req, res) => {
    try {
        const { marked } = await import('marked');
        const filePath = path.join(__dirname, "..", "utils", "policies", 'cleaning.md');

        const markdown = await fs.readFile(filePath, "utf-8");
        // res.type("text/plain").send(markdown);
        const html = marked(markdown);
        // res.type("text/html").send(html);

        return successDataResponse(res, 200, { markdownContent: markdown, htmlContent: html });
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

module.exports = {
    getPolicies
}