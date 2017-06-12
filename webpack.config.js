const path = require('path');
const webpack = require('webpack');

module.exports = [{
    entry: {
        'quill-delta-markdown': './src/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist'),
        libraryTarget: 'umd'
    },
    module: {
        loaders: [
            {
                test: path.join(__dirname, 'src'),
                loader: 'babel'
            }, {
                test: /\.json$/,
                loader: 'json'
            }
        ]
    }
}];