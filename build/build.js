'use strict';

const _ = {
	js_builder: require('./js-builder.js')
};

(() => {
	console.log('Building JS');
	_.js_builder.build();
})();