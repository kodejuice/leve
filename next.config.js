const withCSS = require('@zeit/next-css')
const withSass = require('@zeit/next-sass')
const withFonts = require('next-fonts');

module.exports = withCSS(withSass(withFonts({
    /*
        // To my future self:
        //  create a .env file with the following variables
        //  nextjs 9.4+ automatically loads the config file

        env: {
            SCHEME: "http",
            HOST: "localhost:3000",

            MONGODB_URI: "mongodb://localhost/levecms",

            // sha256 hash of password
            // this is "root"
            PASSWORD_HASH: "4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2",

            // JWT token secret
            JWT_SECRET: "MY_JWT_SECRET",

            // url host of disqus domain
            DISQUS_HOST: "kodejuice.disqus.com",

            // google analytics track code
            GA_TRACK_CODE: "UA-75709223-4",
        },
    */

    target: 'serverless',

    enableSvg: true,

    webpack(config, options) {
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