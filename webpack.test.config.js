module.exports = {
  // mode: 'development',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.wasm']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { modules: false }],
              "@babel/preset-react"
            ],
            plugins: [
              "@babel/plugin-syntax-dynamic-import",
              "@babel/plugin-syntax-import-meta",
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-proposal-json-strings",
              [
                "@babel/plugin-proposal-decorators",
                {
                  "legacy": true
                }
              ],
              "@babel/plugin-proposal-function-sent",
              "@babel/plugin-proposal-export-namespace-from",
              "@babel/plugin-proposal-numeric-separator",
              "@babel/plugin-proposal-throw-expressions"
            ]
          }
        }]
        // options: {
        //   presets: [
        //     ['es2015', {modules: false}],
        //     'react',
        //     'stage-2'
        //   ]
        // }
      }
    ]
  }
};
