const withCSS = require('@zeit/next-css')
const withSass = require('@zeit/next-sass')
const withFonts = require('next-fonts');

module.exports = withCSS(withSass(withFonts({
	env: {
		HOST: "localhost:3000",
		//~ HOST: "localtest.me:3000",
		MONGODB_URI: "mongodb://localhost/levecms"
	},

	enableSvg: true,

  webpack (config, options) {
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000
        }
      }
    })

    return config
  }
})))
