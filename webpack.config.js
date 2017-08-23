const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HtmlPlugin = require('html-webpack-plugin');

const isDev = (process.env.DEV === true);

let htmlPluginConfig = {
    filename: 'index.html',
    template: path.join(__dirname, 'src/index.html'),
};

if (!isDev) {
    htmlPluginConfig.inlineSource = '.(js|css)$';
}

let webpackConfig = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'app.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            'es2015',
                            'stage-3' // for spread props
                        ],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader',
                }),
            },
        ],
    },
    plugins: [
        new ExtractTextPlugin('app.css'),
        new HtmlPlugin(htmlPluginConfig),
        new HtmlInlineSourcePlugin()
    ],
};

if (process.env.DEV === true) {
    webpackConfig.devtool = 'eval-source-map';

} else {
    webpackConfig.plugins.push(
        //new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin()
    );
}

module.exports = webpackConfig;
