const withCSS = require('@zeit/next-css')
const withSass = require('@zeit/next-sass')
const withFonts = require('next-fonts');

module.exports = withCSS(withSass(withFonts({
	env: {
		HOST: "localhost:3000",

		MONGODB_URI: "mongodb://localhost/levecms",

		// sha256 hash of password
		// this is "root"
		PASSWORD_HASH: "4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2",

		// JWT token secret
		JWT_SECRET: "MY_JWT_SECRET",

		// url host of disqus domain
		DISQUS_HOST: "kodejuice.disqus.com",
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

