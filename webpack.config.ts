/* eslint-disable no-console */
import Path from 'path'
import { DefinePlugin, Configuration, WebpackPluginInstance } from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import TerserPlugin from 'terser-webpack-plugin'
import PackageJson from './package.json'
import CopyPlugin from 'copy-webpack-plugin'

interface WebpackEnvParams {
  debug: boolean
  mode: 'production' | 'development'
  fileName: string
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
      extensions: ['.ts'],
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
  ]

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
      extensions: ['.ts'],
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

const contentscript = (env?: Partial<WebpackEnvParams>): Configuration => {
  const isProduction = env?.mode === 'production'
  const filename = 'contentscript.js'
  const entry = Path.resolve(__dirname, 'src', 'contentscript')
  const path = Path.resolve(__dirname, 'dist')
  const target = 'web'
  const plugins: WebpackPluginInstance[] = [
    new DefinePlugin({
      'process.env.ENV': env?.mode || 'development',
      'process.env.IS_WEBPACK_BUILD': 'true',
    }),
  ]

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
      extensions: ['.ts'],
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
        {
          from: 'src/popup-page/index.html',
          to: () => {
            return `${path}/[name].[ext]`
          },
        },
        {
          from: 'src/popup-page/index.css',
          to: () => {
            return `${path}/[name].[ext]`
          },
        },
      ],
    }),
  ]

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
          test: /\.(png|svg|jpg|gif)$/,
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

export default async (env?: Partial<WebpackEnvParams>): Promise<Configuration[]> => {
  // eslint-disable-next-line no-console
  console.log('env', env)

  if (env?.debug) {
    const config = {
      ...(await base(env)),
      plugins: [new BundleAnalyzerPlugin()],
      profile: true,
    }

    return [config, contentscript(env), popupPage(env)]
  }

  return [base(env), background(env), contentscript(env), popupPage(env)]
}
