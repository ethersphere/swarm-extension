import * as path from 'path'
import TerserPlugin from 'terser-webpack-plugin'

const rootDir = path.resolve(__dirname)
const srcDir = path.resolve(rootDir, 'src')
const buildDir = path.resolve(rootDir, 'build')

export interface ENV {
  mode: 'production' | 'development'
}

const config = (env: ENV) => {
  const isProduction = env.mode === 'production'

  return {
    mode: env.mode || 'production',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    entry: {
      index: path.resolve(srcDir, 'index.ts'),
    },
    output: {
      filename: '[name].js',
      path: buildDir,
      sourceMapFilename: '[name][ext].map',
      libraryTarget: 'umd',
      library: ['blossom'],
      globalObject: 'this',
      clean: true,
    },
    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin({ extractComments: false })],
    },
    devServer: {
      static: {
        directory: rootDir,
      },
      compress: true,
      port: 9000,
      devMiddleware: {
        writeToDisk: true,
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
          },
        },
      ],
    },
  }
}

export default config
