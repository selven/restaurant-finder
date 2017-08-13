var path = require('path');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	devtool: "#inline-source-map",
	module: {
		rules: [
			{
				test: /\.handlebars$/,
				loader: "handlebars-loader"
			}
		]
	}
};