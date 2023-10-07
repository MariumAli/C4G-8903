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
  },
  devIndicators: {
    autoPrerender: false,
  },
}

module.exports = process.env.NODE_ENV === 'development' ? nextConfig : withPWA(nextConfig);
