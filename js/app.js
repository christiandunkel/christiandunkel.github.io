"use strict";

var _ = {
    
    /* selectors */
    
    id : function (selector) {
        return document.getElementById(selector);
    },
    
    class : function (selector, context) {
        context = context || document;
        return context.getElementsByClassName(selector);
    },
    
    tag : function (selector, context) {
        context = context || document;
        return context.getElementsByTagName(selector);
    },
    
    select : function (selector, context, callback) {
        
        // set DOM as context, if it's not defined
        if (typeof(context) === 'undefined') {
            context = document;
        }
        
        // look up simple classes, ids or tags directly in DOM
        if (/^(#|\.)?[\w\-]+$/.test(selector)) {
            switch (selector.charAt(0)) {
                case '#':
                    return [context.getElementById(selector.substr(1))];
                case '.':
                    return context.getElementsByClassName(selector.substr(1).replace(/\./g, ' '));
            }
            return context.getElementsByTagName(selector);
        }
        
        // use query selector API
        if (context.querySelectorAll) {
            return context.querySelectorAll(selector);
        }
        // call callback function if querySelector is not supported
        else if (_.isFunction(callback)) {
            callback();
        }
        
    },
    
    
    
    /* manipulation */
    
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
                        elem.innerHTML = settings[key];
                        break;

                    case 'style':
                        for (var prop in settings[key]) {
                            elem.style.setProperty(prop, settings[key][prop]);
                        }
                        break;

                    default:
                        elem.setAttribute(key, settings[key]);

                }
            }

        }
        
        return elem;
        
    },

    append : function (elem1, elem2) {

        // if elem2 is text or a number, convert it to a text node
        if (_.isString(elem2) || _.isNumber(elem2)) {
            elem2 = document.createTextNode(elem2);
        }
        
        elem1.appendChild(elem2);

    },

    prepend : function (elem1, elem2) {
        
        // if elem2 is text or a number, convert it to a text node
        if (_.isString(elem2) || _.isNumber(elem2)) {
            elem2 = document.createTextNode(elem2);
        }
        
        elem1.insertBefore(elem2, elem1.childNodes[0]);

    },

    after : function (elem1, elem2) {
        
        // if elem2 is text or a number, convert it to a text node
        if (_.isString(elem2) || _.isNumber(elem2)) {
            elem2 = document.createTextNode(elem2);
        }
        
        elem1.parentNode.insertBefore(elem2, elem1.nextSibling);

    },

    before : function (elem1, elem2) {
        
        // if elem2 is text or a number, convert it to a text node
        if (_.isString(elem2) || _.isNumber(elem2)) {
            elem2 = document.createTextNode(elem2);
        }

        elem1.insertBefore(elem2, elem1);

    },
    
    remove : function (elem) {
        
        if (_.isElement(elem)) {
            elem.parentNode.removeChild(elem);
        }
        
    },
    
    
    
    /* events */
    
    addEvent : function (elem, event, fn, useCapture) {
        
        if (useCapture !== true) {
            useCapture = false;
        }

        if ('addEventListener' in elem) {
            elem.addEventListener(event, fn, useCapture);
        }
        else {
            // internet explorer fallback
            elem.attachEvent('on' + event, fn);
        }
        
    },
    
    removeEvent : function (elem, event, fn, useCapture) {
        
        if (useCapture !== true) {
            useCapture = false;
        }

        if ('removeEventListener' in elem) {
            elem.removeEventListener(event, fn, useCapture);
        }
        else {
            // internet explorer fallback
            elem.detachEvent('on' + event, fn);
        }
        
    },
    
    onClick : function (elem, fn, useCapture) {
        _.addEvent(elem, 'click', fn, useCapture);
    },
    
    removeClick : function (elem, fn, useCapture) {
        _.removeEvent(elem, 'click', fn, useCapture);
    },
    
    onLoad : function (elem, fn, useCapture) {
        _.addEvent(elem, 'load', fn, useCapture);
    },
    
    removeLoad : function (elem, fn, useCapture) {
        _.removeEvent(elem, 'load', fn, useCapture);
    },
    
    target : function (e) {
        return e.target || e.srcElement;
    },
    
    preventDefault : function (e) {
        e.preventDefault();
        e.stopPropagation();
    },
    
    
    
    /* classes */
    
    addClass : function (elem, class_) {

        // use classList API if available
        if ('classList' in elem) {
            elem.classList.add(class_);
        }
        else if (elem.className.split(" ").indexOf(class_) == -1) {
            elem.className += ' ' + class_;
        }
        
    },
    
    removeClass : function (elem, class_) {
        
        // use classList API if available
        if ('classList' in elem) {
            elem.classList.remove(class_);
        }
        else {
            // otherwise use REGEX to remove the class
            elem.className = elem.className.replace(
                new RegExp('\b' + _.escapeRegex(class_) + '\b', 'g'),
            ' ');
        }
        
    },
    
    toggleClass : function (elem, class_) {

        if (_.hasClass(elem, class_)) {
            _.removeClass(elem, class_);
        }
        else {
            _.addClass(elem, class_);
        }
        
    },
    
    hasClass : function (elem, class_) {
        
        // use classList API if available
        if ('classList' in elem) {
            return elem.classList.contains(class_);
        }
        else if (elem.className.split(" ").indexOf(class_) == -1) {
            return false;
        }
        
        return true;
        
    },
    
    
    
    /* CSS */
    
    getStyle : function (elem, style) {
        
        if ('getComputedStyle' in window) {
            return window.getComputedStyle(elem, null).getPropertyValue(style);
        }
        else if ('currentStyle' in elem) {
            return elem.currentStyle[style];
        }
        
    },
    
    setStyles : function (elem, styles) {
        
        for (var style_name in styles) {
            elem.style.setProperty(style_name, styles[style_name]);
        }
        
    },

    getHeight : function (elem) {
        
        var r = elem.getBoundingClientRect();
        return r.bottom - r.top;
        
    },

    getWidth : function (elem) {
        
        var r = elem.getBoundingClientRect();
        return r.right - r.left;
        
    },
    
    
    
    /* type tests */
    
    exists : function (n) {
        return typeof(n) !== 'undefined' && n !== null;
    },
    
    isElement : function (n) {
        return n instanceof Element || n instanceof HTMLDocument;
    },
    
    isElementInDOM : function (n) {
        return _.isElement(n) ? document.documentElement.contains(n) : false;
    },

    isNodelist : function (n) {
        return NodeList.prototype.isPrototypeOf(n);
    },
    
    isHTMLCollection : function (n) {
        return HTMLCollection.prototype.isPrototypeOf(n);
    },
    
    isFunction : function (n) {
        return typeof(n) === 'function';
    },
    
    isObject : function (n) {
        return typeof(n) === 'object' && n !== null;
    },

    isArray : function (n) {
        return typeof(n) !== 'undefined' && n !== null && n.constructor === Array;
    },

    isString : function (n) {
        return typeof(n) === 'string';
    },

    isNumber : function (n) {
        return typeof(n) === 'number';
    },

    isInteger : function (n) {
        return typeof(n) === 'number' && n % 1 === 0;
    },

    isFloat : function (n) {
        return typeof(n) === 'number' && n % 1 !== 0;
    },
    
    
    
    /* other */
    
    scrollToTop : function () {
        
        // if smooth scrolling is natively supported, use it
        // otherwise, manually automate it
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
            return;
        }
        
        // if requestAnimationFrame API is not available, skip directly to top
        if (!('requestAnimationFrame' in window)) {
            window.scrollTo(0, 0);
            return;
        }

        // get scrolling position
        var y = window.scrollY || window.pageYOffset;

        // directly skip to top, if distance is too small
        if (y < 10) {
            window.scrollTo(0, 0);
            delete _.scrollToTopTimeout;
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
                window.scrollTo(0, y * (1 - percent));
            }
            else {
                // if percentage left is too small, skip rest of animation
                window.scrollTo(0, 0);
                return;
            }

            // proceed with animation, while time is not up
            if (time < duration) {
                window.requestAnimationFrame(scrollStep);
            }
            // if time is up, directly scroll to element
            else {
                window.scrollTo(0, 0);
            }
            
        });
        
    },
    
    scrollToElem : function (elem) {
        
        // use scrollIntoView with smooth scroll behavior if available
        // otherwise, manually automate it
        if ('scrollBehavior' in document.documentElement.style &&
            'scrollIntoView' in document.documentElement) {
            
            elem.scrollIntoView({behavior:'smooth'});
            return;
        }
        
        // if requestAnimationFrame API is not available, use location
        if (!('requestAnimationFrame' in window)) {
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
        
    }
    
}





// container for HTML elements
var NODE = {};
NODE.html = document.documentElement || _.tag('html')[0];
NODE.head = document.head || _.tag('head')[0];
NODE.body = document.body || _.tag('body')[0];





/* nav menu */

var nav_is_open = false;

function openNav() {
    nav_is_open = true;
    _.addClass(NODE.nav_btn, 'nav-visible');
    _.removeClass(NODE.nav_hidden_menu, 'hidden');
}

function closeNav() {
    nav_is_open = false;
    _.removeClass(NODE.nav_btn, 'nav-visible');
    _.addClass(NODE.nav_hidden_menu, 'hidden');
}

function toggleNav() {
    nav_is_open ? closeNav() : openNav();
}

NODE.nav = _.id('nav');
NODE.nav_btn = _.id('hamburger-btn');
NODE.nav_hidden_menu = _.class('hidden-window', NODE.nav)[0];
_.onClick(NODE.nav_btn, toggleNav);

// get nav links
NODE.nav_links = _.tag('a', NODE.nav_hidden_menu);

// add scroll effect to nav buttons
for (var i = NODE.nav_links.length; i--;) {
    
    var a = NODE.nav_links[i];
    
    // only keep anchor link (which is the element id)
    var href = a.href.replace(/.*#/i, '');
    
    // save reference to HTML element
    NODE['section_' + href] = _.id(href);

    _.onClick(a, function (e) {
        
        _.preventDefault(e);
        
        // get anchor link (element id)
        var target = _.target(e);
        var href = target.href.replace(/.*#/i, '');
        
        // scroll to element
        _.scrollToElem(NODE['section_' + href]);
        
        // set button as active, and all others inactive
        for (var i = NODE.nav_links.length; i--;) {
            _.removeClass(NODE.nav_links[i], 'active');
        }
        _.addClass(target, 'active');

        // close nav hidden window
        closeNav();
        
    });

}

// get content sections and their y positions
NODE.sections = _.class('section-content');
var section_positions = [];

function updateSectionPositions() {
    var scrollY = window.scrollY || window.pageYOffset;
    // get boundary y positions of sections
    for (var i = 0, len = NODE.sections.length; i < len; i++) {
        window.section_positions[i] = scrollY + NODE.sections[i].getBoundingClientRect().top;
    }
}

updateSectionPositions();
_.addEvent(window, 'resize', updateSectionPositions);

function updateNavButtons() {
    
    var scrollY = window.scrollY || window.pageYOffset;
    
    // get currently shown section
    var section = 0;
    for (var i = section_positions.length; i--;) {
        if (section_positions[i] - scrollY < 220) {
            section = i;
            break;
        }
    }
    
    var active_btn = NODE.nav_links[section];
    
    // test if the current button is already active
    if (_.hasClass(active_btn, 'active')) {
        return;
    }
    
    // if not, enable it and disable all other buttons
    for (var i = NODE.nav_links.length; i--;) {
        _.removeClass(NODE.nav_links[i], 'active');
    }
    _.addClass(active_btn, 'active');
    
}

// scroll to top effect on click
NODE.to_top_btn = _.id('to-top');
_.onClick(NODE.to_top_btn, _.scrollToTop);


// add CSS for the nav indicator (dependent on browser and button content)
NODE.nav_indicator = _.class('hover-bg')[0];

function updateNavIndicator() {
    
    _.remove(NODE.nav_indicator_style);
    
    var selector = '#nav .content';
    var style = selector + ' .hover-bg {display: block !important;}';
    var num = NODE.nav_links.length;
    
    if (num == 0) return;
    
    var sizes = {
        height      : _.getHeight(NODE.nav_links[0]),
        marginRight : 2,
        width       : {},
        left        : {}
    };
    
    // get sizes of all elements
    for (var i = 0; i < num; i++) {
        sizes.width[i] = _.getWidth(NODE.nav_links[i]);
        
        var left = 0;
        for (var j = i; j--;) {
            left += sizes.width[j];
        }
        sizes.left[i] = left + i * sizes.marginRight;
    }
    
    // generate code for '.active' CSS effect
    for (var i = 0; i < num; i++) {
        
        var elem = NODE.nav_links[i];
        
        style += selector + ' a.a' + (i+1) + '.active ~ .hover-bg {'
               +    'left:'    + sizes.left[i] + 'px;'
               +    'width:'   + sizes.width[i] + 'px;'
               + '}';
        
    }
    
    // generate code for ':hover' CSS effect
    // (must come after '.active' effect to overwrite it)
    for (var i = 0; i < num; i++) {
        
        var elem = NODE.nav_links[i];
        
        style += selector + ' a.a' + (i+1) + ':hover ~ .hover-bg {'
               +    'left:'    + sizes.left[i] + 'px;'
               +    'width:'   + sizes.width[i] + 'px;'
               + '}';
        
    }
    
    NODE.nav_indicator_style = _.create('style', {
        'type' : 'text/css',
        'innerHTML' : style
    });
    
    _.append(NODE.head, NODE.nav_indicator_style);
    
}
_.onLoad(window, updateNavIndicator);
_.addEvent(window, 'resize', updateNavIndicator);





/* language selection */

NODE.lang_btn = _.id('language-btn');
NODE.lang_menu = _.id('language-menu');
NODE.close_lang_btn = _.class('cross', NODE.lang_menu)[0];

// events to open and close language menu
_.onClick(NODE.lang_btn, toggleLangMenu);
_.onClick(NODE.close_lang_btn, closeLangMenu);

function toggleLangMenu() {
    _.toggleClass(NODE.lang_menu, 'hidden');
}

function closeLangMenu() {
    _.addClass(NODE.lang_menu, 'hidden');
}

// events to change language

NODE.lang_select_btns = _.class('lang-select-btn');

for (var i = NODE.lang_select_btns.length; i--;) {
    _.onClick(NODE.lang_select_btns[i], changeLanguage);
}

function changeLanguage(e) {
    
    var target = _.target(e);
    var lang = _.hasClass(target, 'de') ? 'de' : 'en';
    var current_lang = NODE.html.getAttribute('lang');

    // if a new language was selected
    if (lang != current_lang) {

        // set target button as current, and all others as not
        setLanguageBtnActive(target);

        // set value of global lang attribute
        NODE.html.setAttribute('lang', lang);
        
        closeLangMenu();
        updateTitleAttributes();
        updateSectionPositions();
        
        updateNavIndicator();
    }
}

// update currently selected language button
setLanguageBtnActive( NODE.html.getAttribute('lang') );

function setLanguageBtnActive(elem) {
    
    for (var i = NODE.lang_select_btns.length; i--;) {
    
        // get element if it's a string (class)
        if (_.isString(elem) && _.hasClass(NODE.lang_select_btns[i], elem)) {
            elem = NODE.lang_select_btns[i];
        }
        
        _.removeClass(NODE.lang_select_btns[i], 'current');
    }
    
    _.addClass(elem, 'current');
    
}

// update titles attribute to current language 

NODE.lang_title_elems = _.select('*[title]');

// filter out invalid elements and add copy of title as "title-en" attribute
window.valid_elems = [];
for (var i = NODE.lang_title_elems.length; i--;) {
    
    var elem = NODE.lang_title_elems[i];
    
    // check if element has all other language variations of the title attribute 
    if (elem.hasAttribute('title-de')) {
        elem.setAttribute('title-en', NODE.lang_title_elems[i].title);
        window.valid_elems[window.valid_elems.length] = elem;
    }
    
}
NODE.lang_title_elems = window.valid_elems;
delete window.valid_elems;

// if language was changed by language detection in <head> element
if (NODE.html.getAttribute('lang') != 'en') {
    updateTitleAttributes();
}

function updateTitleAttributes() {
    
    var lang_code = NODE.html.getAttribute('lang');
    
    for (var i = NODE.lang_title_elems.length; i--;) {
        var elem = NODE.lang_title_elems[i];
        elem.title = elem.getAttribute('title-' + lang_code);
    }
    
}





/* bauhaus message */

NODE.bauhaus = _.id('bauhaus');

// show bauhaus container when scrolling down
window.updateBauhausMsgDiv = function (e) {

    var viewport_height = Math.max(NODE.html.clientHeight, window.innerHeight || 0);
    var distance_to_top = bauhaus.getBoundingClientRect().top;

    // pixel distance until the message should appear 
    var dist = distance_to_top - viewport_height + 350;

    if (dist < 0) {
        // show Bauhaus message
        _.removeClass(NODE.bauhaus, 'hidden');
        // cancel scroll-checking event
        clearInterval(window.check_scroll);
        
        // disable this function
        window.updateBauhausMsgDiv = function () {};
    }

}





/* scroll events */

window.has_scrolled = false;
window.onscroll = function () {
    window.has_scrolled = true;
};

setInterval(updateScrollEffects, 50);

function updateScrollEffects() {

    // only do stuff, if user has scrolled
    if (!window.has_scrolled) {
        return;
    }

    window.has_scrolled = false;
    
    updateBauhausMsgDiv();
    updateNavButtons();
    
}