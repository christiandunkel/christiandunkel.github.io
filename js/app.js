"use strict";

var _ = {
    
    /* selectors */
    
    id : function (selector) {
        return document.getElementById(selector);
    },
    
    class : function (selector, context) {
        return context.getElementsByClassName(selector);
    },
    
    tag : function (selector, context) {
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
        
        if (!_.exists(e)) {
            return console.error('No valid event given.');
        }
        
        return e.target || e.srcElement;
        
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
    
    
    
    /* other */
    
    scrollToTop : function () {
        
        // if smooth scrolling is natively supported, use it
        // otherwise, manually automate it
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
            return;
        }

        // get scrolling position
        var y = window.scrollY || window.pageYOffset;

        // cancel if user has scrolled with mouse in between timeouts
        if (_.last_scroll != null && 
            _.last_scroll < y) 
        {
            _.last_scroll = null;
            return;
        }

        // directly skip to top, if values are too small
        if (y < 10) {
            window.scrollTo(0, 0);
            _.last_scroll = null;
            return;
        }

        _.last_scroll = y;

        // otherwise scroll with new increment
        y /= 1.3;
        window.scrollTo(0, y);

        // check if to request another scroll
        if (y > 0) {
            _.scrollToTopTimeout = setTimeout(_.scrollToTop, 15);
        }
        else {
            clearTimeout(_.scrollToTopTimeout);
            delete _.scrollToTopTimeout;
        }
    }
    
}





// container for HTML elements
var NODE = {};

(function () {
    
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

    NODE.nav = _.id('nav');
    NODE.nav_btn = _.id('hamburger-btn');
    NODE.nav_hidden_menu = _.class('hidden-window', NODE.nav)[0];
    
    _.onClick(NODE.nav_btn, function () {
        _.toggleClass(NODE.nav_btn, 'nav-visible');
        _.toggleClass(NODE.nav_hidden_menu, 'hidden');
    });

    // scroll to top effect on click
    NODE.to_top_btn = _.id('to-top');
    _.onClick(NODE.to_top_btn, _.scrollToTop);



    /* bauhaus message */

    // scroll event
    window.has_scrolled = false;
    window.onscroll = function () {
        window.has_scrolled = true;
    };

    NODE.bauhaus = _.id('bauhaus');
    window.check_scroll = setInterval(checkScroll, 50);

    // show bauhaus container when scrolling down
    function checkScroll(e) {

        // only do stuff, if user has scrolled
        if (!window.has_scrolled) {
            return;
        }

        window.has_scrolled = false;

        var viewport_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var distance_to_top = bauhaus.getBoundingClientRect().top;

        // pixel distance until the message should appear 
        var dist = distance_to_top - viewport_height + 350;

        if (dist < 0) {
            // show Bauhaus message
            _.removeClass(NODE.bauhaus, 'hidden');
            // cancel scroll-checking event
            clearInterval(window.check_scroll);
            window.onscroll = undefined;
        }

    }
    
})();