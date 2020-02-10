const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

const mode = process.env.NODE_ENV || 'development'
const prod = mode === 'production'
const dev = mode === 'development'
const { sass } = require('svelte-preprocess')

function appResolve(filename) {
  return path.resolve(__dirname, filename)
}

module.exports = {
	entry: {
		bundle: ['./src/main.js']
	},
	resolve: {
		alias: {
			svelte: path.resolve('node_modules', 'svelte'),
			'@components': appResolve('./src/components/index.js'),
			'@helpers': appResolve('./src/utils/helpers'),
			'@stores': appResolve('./src/stores'),
		},
		extensions: ['.mjs', '.js', '.json', '.svelte', '.html'],
		mainFields: ['svelte', 'browser', 'module', 'main']
	},
	output: {
		path: __dirname + '/public',
		filename: '[name].js',
		chunkFilename: '[name].[id].js'
	},
	module: {
		rules: [
			{
				test: /\.(svelte|html|sass)$/,
				use: {
					loader: 'svelte-loader',
					options: {
						dev,
						hydratable: true,
						hotReload: false, // pending https://github.com/sveltejs/svelte/issues/2377
						preprocess: require('svelte-preprocess')([sass()]),
					},
				},
			},
			{
				test: /\.css$/,
				use: [
					/**
					 * MiniCssExtractPlugin doesn't support HMR.
					 * For developing, use 'style-loader' instead.
					 * */
					prod ? MiniCssExtractPlugin.loader : 'style-loader',
					'css-loader'
				]
			}
		]
	},
	mode,
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		})
	],
	devtool: prod ? false: 'source-map'
};
