/**
 * execute from the project root directory:
 * > node compile/javascript
 *
 * @file combines and minifies javascript source files
 * @requires NodeJS (nodejs.org)
 * @requires UglifyJS (npmjs.com/package/uglify-js)
 */

"use strict";

// get filesystem
let fs = require('fs');
let path = require('path');

// JavaScript files in order
let files = [
    'utility.js',
    'main.js'
];

// combine content of the JavaScript files into a string
let total_content = '';
files.forEach(file => {
    
    // add space between files
    if (total_content != '') {
        total_content += "\n\n\n\n\n\n";
    }
    
    // read file and add content to string
    let file_path = path.join(__dirname, '..', 'js', 'source', file);
    total_content += fs.readFileSync(file_path, 'utf-8');
    
});
total_content = '"use strict";\n\n' + total_content;

// minify string using Uglify
let minified = require('uglify-js').minify(total_content, {
    compress : {},
    mangle : {},
    output : {
        ast : false,
        code : true
    }
});

// if Uglify failed, don't create a minified file
if (typeof(minified.code) === 'undefined') {
    console.error('ERROR: Uglify failed to minify the JavaScript files.');
}
else {
    // create minified file using the string
    let filepath = path.join(__dirname, '..', 'js', 'app.min.js');
    fs.writeFileSync(filepath, minified.code, 'utf8');
    console.log('Successfully minified the JavaScript files.');
}

// also create compiled, but non-minified file
let filepath = path.join(__dirname, '..', 'js', 'app.js');
fs.writeFileSync(filepath, total_content, 'utf8');