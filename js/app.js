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

    
/* language menu */

NODE.lang_btn = _.id('language-btn');
NODE.lang_menu = _.id('language-menu');
NODE.close_lang_btn = _.class('cross', NODE.lang_menu)[0];

_.onClick(NODE.lang_btn, function () {
    _.toggleClass(NODE.lang_menu, 'hidden');
});

_.onClick(NODE.close_lang_btn, function () {
    _.addClass(NODE.lang_menu, 'hidden');
});



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



/* bauhaus message */

NODE.bauhaus = _.id('bauhaus');

// show bauhaus container when scrolling down
window.updateBauhausMsgDiv = function (e) {

    var viewport_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
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