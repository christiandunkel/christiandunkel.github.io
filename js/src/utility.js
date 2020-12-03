/* EVENTS */

window.onEvent = document.onEvent = Element.prototype.onEvent = function (event, fnc, useCapture) {

    if (useCapture !== true) {
        useCapture = false;
    }

    if ('addEventListener' in document) {
        this.addEventListener(event, fnc, useCapture);
    }
    else {
        // internet explorer fallback
        this.attachEvent('on' + event, fnc);
    }

    return this;
};

window.removeEvent = document.removeEvent = Element.prototype.removeEvent = function (event, fnc, useCapture) {

    if (useCapture !== true) {
        useCapture = false;
    }

    if ('removeEventListener' in document) {
        this.removeEventListener(event, fnc, useCapture);
    }
    else {
        // internet explorer fallback
        this.detachEvent('on' + event, fnc);
    }

    return this;
};

window.onClick = document.onClick = Element.prototype.onClick = function (fnc, useCapture) {
    return this.onEvent('click', fnc, useCapture);
};

window.removeClick = document.removeClick = Element.prototype.removeClick = function (fnc, useCapture) {
    return this.removeEvent('click', fnc, useCapture);
};

window.onInput = document.onInput = Element.prototype.onInput = function (fnc, useCapture) {
    return this.onEvent('input', fnc, useCapture);
};

window.removeInput = document.removeInput = Element.prototype.removeInput = function (fnc, useCapture) {
    return this.removeEvent('input', fnc, useCapture);
};

window.onLoad = document.onLoad = Element.prototype.onLoad = function (fnc, useCapture) {
    return this.onEvent('load', fnc, useCapture);
};

window.removeLoad = document.removeLoad = Element.prototype.removeLoad = function (fnc, useCapture) {
    return this.removeEvent('load', fnc, useCapture);
};



/* CLASSES & PROPERTIES */

// sets a property of the element
Element.prototype.prop = function (name, value) {
    this.setAttribute(name, value);
    return this;
};

// removes a property of the element
Element.prototype.removeProp = function (name) {
    this.removeAttribute(name);
    return this;
};

Element.prototype.setInnerHTML = function (value) {
    this.innerHTML = value;
    return this;
};

Element.prototype.setValue = function (value) {
    this.value = value;
    return this;
};

Element.prototype.setHref = function (value) {
    this.href = value;
    return this;
};

Element.prototype.addClass = function (class_) {
    // use classList API if available
    if ('classList' in document.documentElement) {
        this.classList.add(class_);
    }
    else if (this.className.split(" ").indexOf(class_) == -1) {
        this.className += ' ' + class_;
    }
    return this;
};

Element.prototype.removeClass = function (class_) {
    // use classList API if available
    if ('classList' in document.documentElement) {
        this.classList.remove(class_);
    }
    else {
        // otherwise use REGEX to remove the class
        this.className = this.className.replace(
            new RegExp('\b' + _.escapeRegex(class_) + '\b', 'g'),
        ' ');
    }
    return this;
};

Element.prototype.toggleClass = function (class_) {
    if (_.hasClass(this, class_)) {
        return this.removeClass(class_);
    }
    else {
        return this.addClass(class_);
    }
};



/* HTML MANIPULATION */

// returns true, if the parent contains the child HTML element
if (!Element.prototype.contains) {
    Element.prototype.contains = function (elem) {
        // go up through parents of "elem" and check if they are "this" element
        while (elem != null) {
            if (elem == this) {
                return true;
            }
            elem = elem.parentNode;
        }
        return false;
    };
}

Element.prototype.append = function (elem) {
    // if elem2 is text or a number, convert it to a text node
    if (_.isString(elem) || _.isNumber(elem)) {
        elem = document.createTextNode(elem);
    }
    this.appendChild(elem);
    return this;
};

Element.prototype.appendTo = function (elem) {
    elem.append(this);
    return this;
};

Element.prototype.prepend = function (elem) {
    // if elem2 is text or a number, convert it to a text node
    if (_.isString(elem) || _.isNumber(elem)) {
        elem = document.createTextNode(elem);
    }
    this.insertBefore(elem, this.childNodes[0]);
    return this;
};

Element.prototype.prependTo = function (elem) {
    elem.prepend(this);
    return this;
};

// inserts given elem after this 
Element.prototype.after = function (elem) {
    // if elem2 is text or a number, convert it to a text node
    if (_.isString(elem) || _.isNumber(elem)) {
        elem = document.createTextNode(elem);
    }
    this.parentNode.insertBefore(elem, this.nextSibling);
    return this;
};

// inserts this after given elem
Element.prototype.addAfter = function (elem) {
    elem.after(this);
    return this;
};

// inserts given elem before this 
Element.prototype.before = function (elem) {
    // if elem2 is text or a number, convert it to a text node
    if (_.isString(elem) || _.isNumber(elem)) {
        elem = document.createTextNode(elem);
    }
    this.insertBefore(elem, this);
    return this;
};

// inserts this before given elem
Element.prototype.addBefore = function (elem) {
    elem.before(this);
    return this;
};

Element.prototype.remove = function () {
    this.parentNode.removeChild(this);
};



/* CSS */

Element.prototype.setStyles = function (styles) {
    for (var style_name in styles) {
        this.style.setProperty(style_name, styles[style_name]);
    }
    return this;
};



/* UTILITY FUNCTIONS */

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
    
    query : function (selector, context) {
        
        // set DOM as context, if it's not defined
        if (typeof(context) === 'undefined') {
            context = document;
        }
        
        // look up simple classes, ids or tags directly in DOM
        if (/^(#|\.)?[\w\-]+$/.test(selector)) {
            switch (selector.charAt(0)) {
                case '#': {
                    return [context.getElementById(selector.substr(1))];
                }
                case '.': {
                    return context.getElementsByClassName(selector.substr(1).replace(/\./g, ' '));
                }
            }
            return context.getElementsByTagName(selector);
        }
        
        // if querySelector is not supported
        if (!context.querySelectorAll) {
            return [];
        }
        
        return context.querySelectorAll(selector);
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
    
    selectTarget : function (e) {
        return (e.target || e.srcElement).select();
    },
    
    preventDefault : function (e) {
        e.preventDefault();
        e.stopPropagation();
    },
    
    
    
    /* CLASSES */
    
    hasClass : function (elem, class_) {
        
        // use classList API if available
        if ('classList' in document.documentElement) {
            return elem.classList.contains(class_);
        }
        
        return elem.className.split(" ").indexOf(class_) != -1;
    },
    
    
    
    /* CSS */
    
    getStyle : function (elem, style) {
        
        if ('getComputedStyle' in window) {
            return window.getComputedStyle(elem).getPropertyValue(style);
        }
        else if ('currentStyle' in document.documentElement) {
            return elem.currentStyle[style];
        }
        
        return '';
    },

    getHeight : function (elem) {
        var rect = elem.getBoundingClientRect();
        return rect.bottom - rect.top;
    },

    getWidth : function (elem) {
        var rect = elem.getBoundingClientRect();
        return rect.right - rect.left;
    },
    
    // returns true, if media query matching is available and query matches
    mediaQueryMatches : function (query) {
        
        if (window.matchMedia) {
            return window.matchMedia('(' + query + ')').matches;
        }
        
        return false;
        
    },
    
    
    
    /* REQUEST */
    
    sendGetRequest : function (url, callback) {
        this.sendRequest('GET', url, callback);
    },
    
    sendRequest : function (type, url, callback) {
        var req = new XMLHttpRequest();
        req.open(type, url);
        req.onreadystatechange = function () {
            if (this.readyState == 4) {
                // for debugging HTTP response
                callback(this);
            }
        };
        req.send();
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
    
    isValidDate : function  (n) {
        return n instanceof Date && !isNaN(n);
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
    
    parseJSON : function (str) {
        
        try {
            return JSON.parse(str);
        }
        catch (err) {
            console.warn(err);
            return undefined;
        }
    },
    
    
    
    /* OTHER */
    
    getObjectSize : function (obj) {
        var size = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty.call(obj, key)) {
                size++;
            }
        }
        return size;
    },
    
    isInArray : function (arr, val) {
        for (var i = arr.length; i--;) {
            if (arr[i] == val) {
                return true;
            }
        }
        return false;
    },
    
    removeArrayIndex : function (arr, index) {
        var len = arr.length;
        // remove index
        for (var i = index; i < len - 1; i++) {
            arr[i] = arr[i+1];
        }
        // remove last value
        arr.pop();
        return arr;
    },
    
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