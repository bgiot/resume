// This file handles the CSS build.
// It will run Sass and compile all styles defined in the main entry file.

// main entry point name

import path from 'path'
import sass from 'node-sass'
import CleanCSS from 'clean-css'
import cssesc  from 'cssesc'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ENTRY_FILE_NAME = 'main.scss'

const isProd = process.env.ELEVENTY_ENV === 'production'

export default { data, compile, minify, render, renderError }

 export async function data() {
        const entryPath = path.join(__dirname, `/${ENTRY_FILE_NAME}`)
        return {
            permalink: `/assets/styles/main.css`,
            eleventyExcludeFromCollections: true,
            entryPath
        }
    }

    // Compile Sass to CSS,
    // Embed Source Map in Development
 export  async function compile(config) {
        return new Promise((resolve, reject) => {
            if (!isProd) {
                config.sourceMap = true
                config.sourceMapEmbed = true
                config.outputStyle = 'expanded'
            }
            return sass.render(config, (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result.css.toString())
            })
        })
    }

    // Minify & Optimize with CleanCSS in Production
export  async  function minify(css) {
        return new Promise((resolve, reject) => {
            if (!isProd) {
                resolve(css)
            }
            const minified = new CleanCSS().minify(css)
            if (!minified.styles) {
                return reject(minified.error)
            }
            resolve(minified.styles)
        })
    }

    // display an error overlay when CSS build fails.
    // this brilliant idea is taken from Mike Riethmuller / Supermaya
    // @see https://github.com/MadeByMike/supermaya/blob/master/site/utils/compile-scss.js
 export function  renderError(error) {
        return `
        /* Error compiling stylesheet */
        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }
        html,
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            font-family: monospace;
            font-size: 1.25rem;
            line-height:1.5;
        } 
        body::before { 
            content: ''; 
            background: #000;
            top: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            opacity: 0.7;
            position: fixed;
        }
        body::after { 
            content: '${cssesc(error)}'; 
            white-space: pre;
            display: block;
            top: 0; 
            padding: 30px;
            margin: 50px;
            width: calc(100% - 100px);
            color:#721c24;
            background: #f8d7da;
            border: solid 2px red;
            position: fixed;
        }`
    }

    // render the CSS file
 export async function render({ entryPath }) {
        try {
            const css = await this.compile({ file: entryPath })
            const result = await this.minify(css)
            return result
        } catch (err) {
            // if things go wrong
            if (isProd) {
                // throw and abort in production
                throw new Error(err)
            } else {
                // otherwise display the error overlay
                console.error(err)
                const msg = err.formatted || err.message
                return this.renderError(msg)
            }
        }
    }

