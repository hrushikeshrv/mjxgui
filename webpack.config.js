const path = require("path");
module.exports = {
    entry: {
        expressions: "./src/modules/expression-backend.js",
        controller: "./src/modules/controller.js",
        ui: "./src/modules/ui.js"
    },
    output: {
        filename: "mjxgui.js",
        path: path.resolve(__dirname, "dist")
    }
}