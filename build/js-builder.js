'use strict';

const _ = {
	fs: require('fs'),
	os: require('os'),
	path: require('path'),
	uglify: require('uglify-js')
};
	
const INPUT_BASE_NAMES = [
	'utility.js',
	'data-projects.js',
	'main.js'
];

/**
 * combines and minifies the JavaScript source files
 */
const buildJavaScript = () => {
	const root = _.path.join(__dirname, '..');
	const js_directory = _.path.join(root, 'js');
	let output = `"use strict";${_.os.EOL}`;

	for (const base_name of INPUT_BASE_NAMES) {
		const file_path = _.path.join(js_directory, 'src', base_name);

		if (!_.fs.existsSync(file_path) || !_.fs.statSync(file_path).isFile()) {
			throw new Error(`Failed to minify JavaScript, because an input file path does not point to a valid file: ${file_path}`);
		}

		if (_.path.extname(file_path) !== '.js') {
			throw new Error(`Failed to minify JavaScript, because an input file path does not have the .js extension: ${file_path}`);
		}

		const file_content = _.fs.readFileSync(file_path).toString();

		// minify the JavaScript script
		const minified = _.uglify.minify(file_content, {
			compress: {	
				keep_infinity: true,
				passes: 2
			},
			output: {
				ascii_only: true,
				ast: false,
				code: true,
				wrap_iife: true
			}
		});

		// check if the minification was successful
		if (minified.error) {
			throw new Error(`Uglify discovered an error on line "${base_name}:${minified.error.line}:${minified.error.pos}" that states: "${minified.error}"`);
		}

		output += minified.code;
	}

	const public_path = _.path.join(js_directory, 'app.min.js');
	_.fs.writeFileSync(public_path, output);
};

module.exports = {
	build: buildJavaScript
};