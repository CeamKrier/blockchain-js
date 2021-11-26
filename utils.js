const crypto = require("crypto");

exports.generateHash = data => crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");

exports.sleep = (duration = 1000) =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, duration);
    });
