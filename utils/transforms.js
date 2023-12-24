import * as htmlmincore from 'html-minifier'
import * as criticalcore from 'critical'

const buildDir = 'dist'

const shouldTransformHTML = (outputPath) =>
    outputPath &&
    outputPath.endsWith('.html') &&
    process.env.ELEVENTY_ENV === 'production'

const isHomePage = (outputPath) => outputPath === `${buildDir}/index.html`

process.setMaxListeners(Infinity)

export default { htmlmin, critical }

    export function htmlmin(content, outputPath) {
        if (shouldTransformHTML(outputPath)) {
            return htmlmincore.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true
            })
        }
        return content
    }

    export async function critical(content, outputPath) {
        if (shouldTransformHTML(outputPath) && isHomePage(outputPath)) {
            try {
                const config = {
                    base: `${buildDir}/`,
                    html: content,
                    inline: true,
                    width: 1280,
                    height: 800
                }
                const { html } = await criticalcore.generate(config)
                return html
            } catch (err) {
                console.error(err)
            }
        }
        return content
    }

