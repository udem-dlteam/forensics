const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'forensics-plot.js',
        library: 'forensicsPlot',
        libraryTarget:"umd",
        globalObject: "this",
        path: path.resolve(__dirname, 'build')
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    }
};
