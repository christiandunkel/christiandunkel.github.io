'use strict';

/* 
 * =======
 * MODULES
 * =======
 */

const _ = {};
_.fs   = require('fs');
_.path = require('path');
_.os   = require('os');

// npm modules
_.uglify = require('uglify-js');



/*
 * =========
 * CONSTANTS
 * =========
 */

const EOL = _.os.EOL;
    
const INPUT_PATHS = [
    'utility.js',
    'main.js'
];
const OUTPUT_PATH = _.path.join(__dirname, '..', 'app.min.js');



/*
 * ====
 * MAIN
 * ====
 */

if (_.fs.existsSync(OUTPUT_PATH)) {
    _.fs.unlinkSync(OUTPUT_PATH);
}

let total_code = `"use strict";` + EOL;

INPUT_PATHS.forEach(input_path => {
    
    input_path = _.path.join(__dirname, input_path);
    
    if (!_.fs.existsSync(input_path) || !_.fs.statSync(input_path).isFile()) {
        console.error(`Failed, because the input file path does not point to a valid file: ${input_path}`);
        process.exit();
    }

    const file_content = _.fs.readFileSync(input_path).toString();

    // minify the JavaScript script
    const minified = _.uglify.minify(file_content, {
        compress : {},
        mangle : {},
        output : {
            ast : false,
            code : true
        }
    });

    // check if the minification was successful
    if (minified.error) {
        console.error(`Uglify discovered an error on line "${_.path.basename(_.path.basename(input_path))}:${minified.error.line}:${minified.error.pos}" that states: "${minified.error}"`);
        process.exit();
    }
    
    total_code += minified.code;
});

console.log(EOL + `Successfully minified and combined the JavaScript scripts`,
            EOL + `  Combined: ${INPUT_PATHS}`,
            EOL + `  To: ${OUTPUT_PATH}`,
            EOL);
_.fs.writeFileSync(OUTPUT_PATH, total_code, 'utf8');