const webpack = require("webpack");
const config = {
    entry: {
        index: path.join(__dirname, '/src/main.js'), // 入口文件,
    },
    output: {
        path: path.join(__dirname, '/dist'), //打包后的文件存放的地方
        library: '[name]',
        libraryTarget: 'umd',
        filename: '[name].js' //打包后输出文件的文件名
    }
}