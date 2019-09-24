/**
 * execute from the project root directory:
 * > node js/compiler.js
 *
 * @file combines and minifies javascript source files
 * @requires NodeJS (nodejs.org)
 * @requires UglifyJS (npmjs.com/package/uglify-js)
 */

"use strict";

// get filesystem
let fs = require('fs');
let path = require('path');

// files in order
let files = [
    'utility.js',
    'main.js'
];

// read files in order and combine their content into a string
let total_code = '';
files.forEach(file => {
    
    // add space between files
    if (total_code != '') {
        total_code += "\n\n\n\n\n\n";
    }
    
    // read file and add content to total code
    let file_path = path.join(__dirname, 'source', file);
    total_code += fs.readFileSync(file_path, 'utf-8');
    
});
total_code = '"use strict";\n\n' + total_code;


// minify total code using Uglify component
let minified = require('uglify-js').minify(total_code, {
    compress : {},
    mangle : {},
    output : {
        ast : false,
        code : true
    }
});

// if Uglify failed, don't create a minified file
if (typeof(minified.code) === 'undefined') {
    console.error('ERROR: Minified code equals "undefined". Uglify.js probably failed.\nAre there any ES6 components or errors in the source code?');
}
else {
    // create minified file
    let filepath = path.join(__dirname, 'app.min.js');
    fs.writeFileSync(filepath, minified.code, 'utf8');
}

// also create non-minified file
let filepath = path.join(__dirname, 'app.js');
fs.writeFileSync(filepath, total_code, 'utf8');