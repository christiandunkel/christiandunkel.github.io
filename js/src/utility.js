var _ = {
    
    /* SELECTORS */
    
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
    
    // returns true, if the parent contains the child HTML element
    contains : function (parent, child) {
        
        var node = child.parentNode;
        
         while (node != null) {
             if (node == parent) {
                 return true;
             }
             node = node.parentNode;
         }
        
         return false;
        
    },
    
    
    
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
    
    
    
    /* EVENTS */
    
    addEvent : function (elem, event, fn, useCapture) {
        
        if (useCapture !== true) {
            useCapture = false;
        }

        if ('addEventListener' in document) {
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

        if ('removeEventListener' in document) {
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
    
    
    
    /* CLASSES */
    
    addClass : function (elem, class_) {

        // use classList API if available
        if ('classList' in document.documentElement) {
            elem.classList.add(class_);
        }
        else if (elem.className.split(" ").indexOf(class_) == -1) {
            elem.className += ' ' + class_;
        }
        
    },
    
    removeClass : function (elem, class_) {
        
        // use classList API if available
        if ('classList' in document.documentElement) {
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
        if ('classList' in document) {
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
            return window.getComputedStyle(elem).getPropertyValue(style);
        }
        else if ('currentStyle' in document.documentElement) {
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
    
    
    
    /* TYPE TESTS */
    
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
    
    
    
    /* SANITIZATION */
    
    escapeRegex : function (str) {
        
        return ('' + str).replace(/[\.\*\+\?\^\$\{\}\(\)\|\[\]\\\/\-]/g, '\\$&');
        
    },

    encodeHTML : function (str) {
        
        return ('' + str).replace(/&/g, '\&amp\;')
                         .replace(/</g, '\&lt\;')
                         .replace(/>/g, '\&gt\;')
                         .replace(/"/g, '\&quot\;')
                         .replace(/'/g, '\&#039\;');
        
    },

    decodeHTML : function (str) {
        
        return ('' + str).replace(/\&amp\;/g, '&')
                         .replace(/\&lt\;/g, '<')
                         .replace(/\&gt\;/g, '>')
                         .replace(/\&quot\;/g, '"')
                         .replace(/\&#039\;/g, '\'');
        
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
    
    // lerps from start Hex color to end Hex color in time 0 to 1
    lerpColorHex : function (start_color, end_color, time) {
        
        // convert Hex strings to numbers
        start_color = start_color.replace(/#/g, '');
        start_color = parseInt(start_color, 16);
        end_color = end_color.replace(/#/g, '');
        end_color = parseInt(end_color, 16);

        var start_color_rgb = {
            r : start_color >> 16,
            g : start_color >> 8 & 0xff,
            b : start_color & 0xff
        };

        var end_color_rgb = {
            r : end_color >> 16,
            g : end_color >> 8 & 0xff,
            b : end_color & 0xff
        };

        var result = _.lerpColorRGB(start_color_rgb, end_color_rgb, time);

        return '#' + ((result.r << 16) + (result.g << 8) + (result.b | 0)).toString(16).slice(1);
        
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