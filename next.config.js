/*  @type {import('next').NextConfig}  */

const withPWA = require('next-pwa')({
  dest: 'public'
})


const nextConfig = {
  reactStrictMode: true,
  env: {
    'MYSQL_HOST': 'db.unitedwayatlantaefsp.org',
    'MYSQL_DATABASE': 'unitedwayatlantaefsp',
    'MYSQL_USER': 'efsp_mngr',
    'MYSQL_PASSWORD':'TKL72wvu$',
    'NODEMAILER_EMAIL': 'c4g.efsp.main@gmail.com',
	  'NODEMAILER_PW': 'wjmfdwkkospweksp',
  },
}

module.exports = process.env.NODE_ENV === 'development' ? nextConfig : withPWA(nextConfig);
