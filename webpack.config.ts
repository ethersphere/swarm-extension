/* eslint-disable no-console */
import { execSync } from 'child_process'
import CopyPlugin from 'copy-webpack-plugin'
import Path from 'path'
import TerserPlugin from 'terser-webpack-plugin'
import { Compiler, Configuration, DefinePlugin, EnvironmentPlugin, WebpackPluginInstance } from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { Server } from 'ws'
import PackageJson from './package.json'

const MAIN_RELOAD_PORT = 16667
const DEPS_RELOAD_PORT = 16668
let liveReloadServer: Server

interface WebpackEnvParams {
  debug: boolean
  mode: 'production' | 'development'
  fileName: string
  /** Build extension's dependencies */
  buildDeps: boolean
}

const ExtraActionsPlugin = (callback: () => void) => ({
  apply: (compiler: Compiler) => {
    compiler.hooks.afterEmit.tap('ExtraActionsPlugin', callback)
  },
})

/**
 * Send reload signal for the extension on change
 *
 * @param plugins webpack plugins that the extraAction plugin will be added
 * @param dependency if true, main codebase will be compiled on every change, because the main codebase dependent on the given compilation
 */
const addExtraActionPlugin = (plugins: WebpackPluginInstance[], dependency?: boolean) => {
  if (liveReloadServer === undefined) return //if liveReloadServer has been not initialized, then it is in production mode

  plugins.push(
    ExtraActionsPlugin(() => {
      if (dependency) execSync('npm run compile:main')

      liveReloadServer.clients.forEach(client => {
        client.send('ping')
      })
    }),
  )
}

const base = (env?: Partial<WebpackEnvParams>): Configuration => {
  const isProduction = env?.mode === 'production'
  const filename = env?.fileName || ['index', isProduction ? '.min' : null, '.js'].filter(Boolean).join('')
  const entry = Path.resolve(__dirname, 'src')
  const path = Path.resolve(__dirname, 'dist')
  const target = 'web'
  const plugins: WebpackPluginInstance[] = [
    new DefinePlugin({
      'process.env.ENV': env?.mode || 'development',
      'process.env.IS_WEBPACK_BUILD': 'true',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'assets/**/*',
          to: path,
        },
        {
          from: 'manifest.json',
          to: path,
        },
      ],
    }),
  ]
  addExtraActionPlugin(plugins)

  return {
    bail: Boolean(isProduction),
    mode: env?.mode || 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    entry,
    output: {
      path,
      filename,
      sourceMapFilename: filename + '.map',
      library: PackageJson.name,
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.(ts|js)$/,
          // include: entry,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      fallback: {
        path: false,
        fs: false,
      },
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 2018,
            },
            compress: {
              ecma: 5,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
            },
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: true,
        }),
      ],
    },
    plugins,
    target,
    node: {
      global: true,
      __filename: 'mock',
      __dirname: 'mock',
    },
    performance: {
      hints: false,
    },
  }
}

const background = (env?: Partial<WebpackEnvParams>): Configuration => {
  const isProduction = env?.mode === 'production'
  const filename = 'background.js'
  const entry = Path.resolve(__dirname, 'src', 'background')
  const path = Path.resolve(__dirname, 'dist')
  const target = 'web'
  const plugins: WebpackPluginInstance[] = [
    new DefinePlugin({
      'process.env.ENV': env?.mode || 'development',
      'process.env.IS_WEBPACK_BUILD': 'true',
    }),
    new EnvironmentPlugin({
      SWARM_DEVELOPMENT: !isProduction,
    }),
  ]
  addExtraActionPlugin(plugins)

  return {
    bail: Boolean(isProduction),
    mode: env?.mode || 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    entry,
    output: {
      path,
      filename,
      sourceMapFilename: filename + '.map',
      library: PackageJson.name,
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.(ts|js)$/,
          // include: entry,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      fallback: {
        path: false,
        fs: false,
      },
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 2018,
            },
            compress: {
              ecma: 5,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
            },
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: true,
        }),
      ],
    },
    plugins,
    target,
    node: {
      global: true,
      __filename: 'mock',
      __dirname: 'mock',
    },
    performance: {
      hints: false,
    },
  }
}

const contentscript = (
  scriptType: 'document-start' | 'swarm-library' | 'swarm-html',
  env?: Partial<WebpackEnvParams>,
): Configuration => {
  const dependencies = ['swarm-library', 'swarm-html']
  const isProduction = env?.mode === 'production'
  const filename = `${scriptType}.js`
  const entry = Path.resolve(__dirname, 'src', 'contentscript', scriptType)
  const path = Path.resolve(__dirname, 'dist')
  const target = 'web'
  const plugins: WebpackPluginInstance[] = [
    new DefinePlugin({
      'process.env.ENV': env?.mode || 'development',
      'process.env.IS_WEBPACK_BUILD': 'true',
    }),
  ]
  addExtraActionPlugin(plugins, dependencies.includes(scriptType))

  return {
    bail: Boolean(isProduction),
    mode: env?.mode || 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    entry,
    output: {
      path,
      filename,
      sourceMapFilename: filename + '.map',
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /(?<!\.string)\.(ts|js)$/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.string\.(ts|js)$/,
          use: [
            {
              loader: 'raw-loader',
            },
            {
              loader: 'babel-loader',
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      fallback: {
        path: false,
        fs: false,
      },
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 2018,
            },
            compress: {
              ecma: 5,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
            },
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: true,
        }),
      ],
    },
    plugins,
    target,
    node: {
      global: true,
      __filename: 'mock',
      __dirname: 'mock',
    },
    performance: {
      hints: false,
    },
  }
}

const popupPage = (env?: Partial<WebpackEnvParams>): Configuration => {
  const isProduction = env?.mode === 'production'
  const filename = 'index.js'
  const entry = Path.resolve(__dirname, 'src', 'popup-page', 'index.tsx')
  const path = Path.resolve(__dirname, 'dist', 'popup-page')
  const assetsPath = Path.resolve(path, 'assets')
  const target = 'web'
  const plugins: WebpackPluginInstance[] = [
    new DefinePlugin({
      'process.env.ENV': env?.mode || 'development',
      'process.env.IS_WEBPACK_BUILD': 'true',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'assets/**/*',
          to: assetsPath,
        },
        {
          from: 'node_modules/@ethersphere/bee-dashboard/lib/assets/*',
          to: assetsPath + Path.sep + '[name].[ext]',
        },
        {
          from: 'node_modules/@ethersphere/bee-dashboard/lib/assets/fonts/*',
          to: Path.resolve(assetsPath, 'fonts') + Path.sep + '[name].[ext]',
        },
        {
          from: 'manifest.json',
          to: path,
        },
        {
          from: 'src/popup-page/index.html',
          to: () => {
            return `${path}/[name].[ext]`
          },
        },
        // {
        //   from: 'src/popup-page/index.css',
        //   to: () => {
        //     return `${path}/[name].[ext]`
        //   },
        // },
      ],
    }),
  ]

  addExtraActionPlugin(plugins)

  return {
    bail: Boolean(isProduction),
    mode: env?.mode || 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    entry,
    output: {
      path,
      filename,
      sourceMapFilename: filename + '.map',
      library: PackageJson.name,
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.(tsx|ts|jsx|js)$/,
          // include: entry,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jp(e*)g|svg|gif|ttf)$/,
          use: ['file-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      fallback: {
        path: false,
        fs: false,
      },
      alias: {
        react: Path.join(__dirname, 'node_modules', 'react'),
        'react-dom': Path.join(__dirname, 'node_modules', 'react-dom'),
      },
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 2018,
            },
            compress: {
              ecma: 5,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
            },
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: true,
        }),
      ],
    },
    plugins,
    target,
    node: {
      global: true,
      __filename: 'mock',
      __dirname: 'mock',
    },
    performance: {
      hints: false,
    },
  }
}

export default (env?: Partial<WebpackEnvParams>): Configuration[] => {
  let baseConfig: Configuration[]

  // if environment node is undefined then it always build in production mode
  if (!env?.mode) {
    env = { ...env, mode: 'production' }
  }

  // eslint-disable-next-line no-console
  console.log('env', env)

  if (env?.buildDeps) {
    if (env?.mode === 'development') liveReloadServer = new Server({ port: DEPS_RELOAD_PORT })

    baseConfig = [contentscript('swarm-library', env), contentscript('swarm-html', env)]
  } else {
    if (env?.mode === 'development') liveReloadServer = new Server({ port: MAIN_RELOAD_PORT })

    baseConfig = [base(env), background(env), contentscript('document-start', env), popupPage(env)]
  }

  if (env?.debug) {
    baseConfig.forEach(config => {
      if (config.plugins) config.plugins.push(new BundleAnalyzerPlugin())
      else config.plugins = [new BundleAnalyzerPlugin()]
      config.profile = true
    })
  }

  return baseConfig
}
