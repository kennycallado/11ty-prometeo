import fs from 'node:fs'
import htmlmin from 'html-minifier'

import pluginWebc from '@11ty/eleventy-plugin-webc'
import pluginBundle from '@11ty/eleventy-plugin-bundle'

export const config = {
  templateFormats: ['html', 'md'],
  htmlTemplateEngine: 'webc',
  dir: {
    input: 'src',
    output: 'dist',
    layouts: '_includes/layouts',
  },
}

export default function (eleventyConfig) {
  eleventyConfig.setWatchThrottleWaitTime(500)

  eleventyConfig.addPlugin(pluginWebc, {
    components: 'src/_includes/components/**/*.webc',
  })

  eleventyConfig.addBundle('global')

  eleventyConfig.addPlugin(pluginBundle, {
    toFileDirectory: '../dist/assets/bundle',
  })

  // Watch CSS files for changes
  eleventyConfig.setBrowserSyncConfig({
    files: './dist/assets/css/**/*.css',
  })

  eleventyConfig.addPassthroughCopy({
    'src/_includes/assets': 'assets',
  })

  eleventyConfig.addPassthroughCopy({
    './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js':
      'assets/js/bootstrap.bundle.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map':
      'assets/js/bootstrap.bundle.min.js.map',
  })

  eleventyConfig.addPassthroughCopy({
    './node_modules/@auth0/auth0-spa-js/dist/auth0-spa-js.development.js':
      'assets/js/auth0-spa-js.development.js',
    './node_modules/@auth0/auth0-spa-js/dist/auth0-spa-js.development.js.map':
      'assets/js/auth0-spa-js.development.js.map',
    './node_modules/@auth0/auth0-spa-js/dist/auth0-spa-js.production.js':
      'assets/js/auth0-spa-js.production.js',
    './node_modules/@auth0/auth0-spa-js/dist/auth0-spa-js.production.js.map':
      'assets/js/auth0-spa-js.production.js.map',
  })

  eleventyConfig.on('eleventy.after', async (ctx) => {
    const pattern = '/../dist/assets'

    ctx.results.forEach((result) => {
      if (result.content.includes(pattern)) {
        result.content = result.content.replaceAll(pattern, '/assets')

        if (ctx.outputMode === 'fs') {
          fs.writeFile(result.outputPath, result.content, (err) => {
            if (err) console.error(err)
            else console.log(`Assets path updated: ${result.outputPath}`)
          })
        }
      }
    })
  })

  eleventyConfig.addTransform('htmlmin', async function (content, outputPath) {
    if ((outputPath || '').endsWith('.html')) {
      return htmlmin.minify(content, {
        collapseWhitespace: true,
        preserveLineBreaks: false,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
      })
    }

    return content
  })
}
