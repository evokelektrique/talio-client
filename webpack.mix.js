let mix = require('laravel-mix')

// Compile And Copy To Test Environment Folder
mix.js('index.js', '/dist')
mix.copy('./dist/index.js', '../talio_static/talio.js')
