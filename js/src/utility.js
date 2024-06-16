/* UTILITY FUNCTIONS */

var _ = {    


	/* MANIPULATION */

	create : function (str, settings) {

		if (typeof(settings) === 'undefined') {
			settings = {};
		}

		var id = str.match(/#[^\.#\s]+/g);
		var classes = str.match(/\.[^#\s\.]+/g);
		var elem = document.createElement(str.replace(/#[^\.#\s]+|\.[^#\s]+|\s/g,''));

		// apply id from string as attribute
		if (id) {
			elem.id = id[0].replace(/#/, '');
		}

		// apply classes from string as attribute
		if (classes) {
			elem.className = classes.join(' ').replace(/\./g, '');
		}

		for (var key in settings) {

			// skip iteration if the current property belongs to the prototype
			if (settings.hasOwnProperty.call(settings, key)) {
				switch (key) {
					case 'innerHTML':
					case 'href':
					case 'type':
					case 'src':
					case 'checked':
						elem[key] = settings[key];
						break;
					case 'style':
						for (var prop in settings[key]) {
							elem.style.setProperty(prop, settings[key][prop]);
						}
						break;
					default:
						elem.setAttribute(key, settings[key]);
						break;
				}
			}

		}

		return elem;
	},



	/* EVENTS */

	target : function (e) {
		return e.target || e.srcElement;
	},



	/* SANITIZATION */

	escapeRegex : function (str) {
		return ('' + str).replace(/[\.\*\+\?\^\$\{\}\(\)\|\[\]\\\/\-]/g, '\\$&');
	},



	/* OTHER */

	// returns random float between min and max, min included
	randomFloat : function (min, max) {
		return Math.random() * (max - min) + min;
	},

	// returns random integer between min and max, min and max included
	randomInt : function (min, max) {
		min = Math.ceil(min);
		max = Math.floor(max) + 1;
		return Math.floor(Math.random() * (max - min)) + min;
	},

	scrollTo : function (elem) {

		// use scrollIntoView with smooth scroll behavior if available
		// otherwise, manually automate it
		if ('scrollBehavior' in document.documentElement.style &&
			'scrollIntoView' in document.documentElement) {

			elem.scrollIntoView({behavior:'smooth'});
			return;
		}

		// if requestAnimationFrame API is not available, use location
		if (!(window.requestAnimationFrame && window.scrollTo)) {
			location.href = '#'; // fixes a bug in older webkit browsers
			location.href = '#' + elem.id;
			return;
		}

		// get scrolling position
		var y = window.scrollY || window.pageYOffset;
		var elem_y = elem.getBoundingClientRect().top + y;
		var diff = elem_y - y;

		// directly skip to pos, if distance is too small
		if (Math.abs(diff) < 10) {
			window.scrollTo(0, elem_y);
			return;
		}

		var start_time = undefined;
		var duration = 300;

		// start scrolling animation
		window.requestAnimationFrame(function scrollStep(timestamp) {

			if (!start_time) {
				start_time = timestamp;
			}

			var time = timestamp - start_time;

			// percentage of completion in range 0 to 1
			var percent = Math.min(time / duration, 1);

			// scroll to new position
			if (percent < 0.95) {
				window.scrollTo(0, y + diff * percent);
			}
			else {
				// if percentage left is too small, skip rest of animation
				window.scrollTo(0, elem_y);
				return;
			}

			// proceed with animation, while time is not up
			if (time < duration) {
				window.requestAnimationFrame(scrollStep);
			}
			// if time is up, directly scroll to element
			else {
				window.scrollTo(0, elem_y);
			}

		});
	},

	// lerps from start RGB color to end RGB color in time 0 to 1
	lerpColorRGB : function (start_color, end_color, time) {

		if (start_color.a === undefined) {
			start_color.a = 1;
		}
		if (end_color.a === undefined) {
			end_color.a = 1;
		}

		return {
			r : start_color.r + time * (end_color.r - start_color.r),
			g : start_color.g + time * (end_color.g - start_color.g),
			b : start_color.b + time * (end_color.b - start_color.b),
			a : start_color.a + time * (end_color.a - start_color.a)
		};

	},

	// converts "rgb(1,2,3)" and "rgba(1,2,3,1)" strings to objects
	objectifyRGBstring : function (rgb) {

		rgb = rgb.replace(/^rgb(a)?\(| |\)$/g, '')
				 .split(',');

		return {
			r : parseInt(rgb[0]),
			g : parseInt(rgb[1]),
			b : parseInt(rgb[2]),
			a : rgb.length == 4 ? parseInt(rgb[3]) : 1
		}

	}

}