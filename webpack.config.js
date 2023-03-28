const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require('path');
const config = {
    entry: {
        index: path.join(__dirname, '/src/main.ts'), // 入口文件,
    },
    output: {
        path: path.join(__dirname, '/dist'), //打包后的文件存放的地方
        library: '[name]',
        libraryTarget: 'umd',
        filename: '[name].js' //打包后输出文件的文件名
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader", options: { allowTsInNodeModules: false }, exclude: "/node_modules/" },
            //   { test: /\.js$/, use: ['babel-loader'], include: path.join(__dirname, 'src') },
            //   { test: [/\.vert$/, /\.frag$/, /\.glsl$/], use: 'raw-loader' }
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: "head",
            title: "Phaser example",
            template: path.join(__dirname, "./index.html"),
            chunks: ["tooqing"]
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "assets", to: "assets", toType: "dir" }
            ]
        }),
        new CleanWebpackPlugin()
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: false,
        allowedHosts: "auto",
        port: 8088,
        devMiddleware: {
            writeToDisk: true,
        }
    }
}
module.exports = (env, argv) => {
    return config;
};