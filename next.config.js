/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS 설정 파일 */
const { withContentlayer } = require('next-contentlayer2')
const siteMetadata = require('./articles/siteMetadata')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), {
    reactStrictMode: true,
    basePath: siteMetadata.basePath,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    images: {
      unoptimized: true,
    },
    trailingSlash: true,
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      return config
    },
    output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  })
}
