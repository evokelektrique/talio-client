let mix = require('laravel-mix')

// Compile To Test Environment Folder
mix.js('talio.js', '../talio_static').setPublicPath('../') 
