"use strict";

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
    }
    
}





// holds references to HTML elements
var NODE = function () {
    
    // general elements
    NODE.html = document.documentElement  || _.tag('html')[0];
    NODE.head = document.head             || _.tag('head')[0];
    NODE.body = document.body             || _.tag('body')[0];
    NODE.main = _.tag('main')[0];
    NODE.animated_background = _.id('animated-background');
    
    NODE.nav                = _.id('nav');
    // hidden mobile menu
    NODE.hamburger_btn      = _.id('hamburger-btn');
    NODE.mobile_menu        = _.id('mobile-menu');
    NODE.mobile_overlay     = _.class('overlay', NODE.mobile_menu)[0];
    // logo visible on mobile view
    NODE.mobile_logo        = _.class('logo', NODE.nav)[0];
    // nav links
    var mobile_content      = _.class('content', NODE.mobile_menu)[0];
    NODE.nav_links          = _.tag('a', mobile_content);
    // add CSS for the nav indicator
    // (dependent on browser and button content)
    NODE.nav_indicator      = _.class('hover-bg')[0];
    // semantic sections of site
    NODE.sections           = _.class('content-section');
    NODE.section_about      = _.id('about');
    
    NODE.to_top_btn         = _.id('to-top');
    
    // language selection
    NODE.lang_btn           = _.id('language-btn');
    // elements with title attributes
    NODE.titled_elems       = _.select('*[title]');
    NODE.valid_titled_elems = [];
    
    // project selection
    NODE.project_category_btns  = _.class('project-select-btn');
    NODE.project_cards          = _.class('project');
    NODE.project_card_show_info_btns = _.class('project-show-info-btn');
    NODE.project_settings_btn   = _.id('project-settings-btn');
    NODE.project_settings_menu  = _.id('project-settings-menu');
    NODE.project_switch_logic   = _.id('project-switch-logic-btn');
    
};





// manages main navigation and related functionality
var NAV = {
    
    initialize : function () {
        
        // add effect to mobile nav button
        _.onClick(NODE.hamburger_btn,   NAV.toggleWindow);
        _.onClick(NODE.mobile_overlay,  NAV.closeWindow);
        
        // remove anchor link and add scroll effect to nav links
        for (var i = NODE.nav_links.length + 1; i--;) {

            var a;
            if (i < NODE.nav_links.length) {
                a = NODE.nav_links[i];
            }
            else {
                a = NODE.mobile_logo;
            }

            // only keep anchor link (which is the element id)
            var href = a.href.replace(/.*#/i, '');

            // save reference to HTML element
            NODE['section_' + href] = _.id(href);

            _.onClick(a, SCROLL.toSection);

        }
        
        // update semantic sections
        NAV.updateSectionData();
        
        // update sizes/positions for section indicator dynamically
        _.onLoad(window, NAV.updateSectionIndicator);
        
        _.addEvent(window, 'resize', function () {
            NAV.updateSectionData();
            NAV.setLinkForSectionActive();
            NAV.updateSectionIndicator();
        });
        
        // scroll to top effect on click
        _.onClick(NODE.to_top_btn, SCROLL.toTop);
        
    },
    
    is_open : false,
    
    openWindow : function () {
        
        if (!NAV.is_open) {
            
            NAV.is_open = true;
            _.addClass(NODE.html, 'mobile-nav-open');
            
            FOCUS_CHAIN.add([
                NODE.nav_links[1],
                NODE.nav_links[2],
                NODE.nav_links[3],
                NODE.lang_btn,
                NODE.hamburger_btn
            ]);
            
        }
        
    },

    closeWindow : function () {
        
        if (NAV.is_open) {
            
            NAV.is_open = false;
            _.removeClass(NODE.html, 'mobile-nav-open');
            
            // focus on mobile menu button
            setTimeout(function () {
                NODE.hamburger_btn.focus();
            }, 150);
            
            FOCUS_CHAIN.remove();
            
        }
        
    },

    toggleWindow : function () {
        NAV.is_open ? NAV.closeWindow() : NAV.openWindow();
    },
    
    // y positions of semantic sections
    section_positions : [0],
    
    // updates the y positions of the semantic sections on the site
    updateSectionData : function () {
        var scrollY = window.scrollY || window.pageYOffset;
        // get boundary y positions of sections
        for (var i = 0, len = NODE.sections.length; i < len; i++) {
            NAV.section_positions[i+1] = scrollY + NODE.sections[i].getBoundingClientRect().top;
        }
    },
    
    // set section indicators position by which section is currently in view
    updateSectionIndicator : function () {
        
        _.remove(NODE.nav_indicator_style);

        var selector    = '#nav .content';
        var style       = selector + ' .hover-bg {display: block !important;}';
        var num         = NODE.nav_links.length;

        if (num == 0) return;

        var sizes = {
            height      : _.getHeight(NODE.nav_links[1]),
            marginLeft  : {},
            marginRight : {},
            width       : {},
            left        : {}
        };

        // get sizes of all elements
        for (var i = 0; i < num; i++) {
            
            // get computed CSS values
            sizes.width[i]          = _.getWidth(NODE.nav_links[i]);
            sizes.marginLeft[i]     = Number.parseFloat(
                _.getStyle(NODE.nav_links[i], 'margin-left').replace(/[a-z]+/gi, '')
            );
            sizes.marginRight[i]    = Number.parseFloat(
                _.getStyle(NODE.nav_links[i], 'margin-right').replace(/[a-z]+/gi, '')
            );

            // calculate x position
            var left = sizes.marginLeft[i];
            for (var j = i; j--;) {
                left += sizes.width[j] + sizes.marginLeft[j] + sizes.marginRight[j];
            }
            sizes.left[i] = left;
            
        }

        // generate code for '.active' CSS effect
        for (var i = 0; i < num; i++) {

            var elem = NODE.nav_links[i];

            style += selector + ' a.a' + i + '.active ~ .hover-bg {'
                   +    'left:'    + sizes.left[i] + 'px;'
                   +    'width:'   + sizes.width[i] + 'px;'
                   + '}';

        }

        // generate code for ':hover' CSS effect
        // (must come after '.active' effect to overwrite it)
        for (var i = 0; i < num; i++) {

            var elem = NODE.nav_links[i];

            style += selector + ' a.a' + i + ':hover ~ .hover-bg {'
                   +    'left:'    + sizes.left[i] + 'px;'
                   +    'width:'   + sizes.width[i] + 'px;'
                   + '}';

        }

        NODE.nav_indicator_style = _.create('style', {
            'type' : 'text/css',
            'innerHTML' : style
        });

        _.append(NODE.head, NODE.nav_indicator_style);
        
    },
    
    // set nav link active depending on which section is currently in view
    setLinkForSectionActive : function () {
        
        var scrollY = window.scrollY || window.pageYOffset;

        // get currently shown section
        var section = 0;
        for (var i = NAV.section_positions.length; i--;) {
            if (NAV.section_positions[i] - scrollY < 300) {
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
    
};





// manages the language menu and functionality
var LANG = {
    
    initialize : function () {
        
        // events to open and close language menu
        _.onClick(NODE.lang_btn, LANG.toggleLanguage);
        
        LANG.filterTitledElements();
        
        // if language was changed by language detection in <head> element
        if (NODE.html.getAttribute('lang') != 'en') {
            LANG.updateTitles();
        }
        
    },
    
    language_order : ['en', 'de'],
    
    toggleLanguage : function (lang) {

        var current_lang = NODE.html.getAttribute('lang');
        
        for (var i = 0, len = LANG.language_order.length; i < len; i++) {
            
            // find current language in order
            if (LANG.language_order[i] == current_lang) {
                var next = i + 1;
                
                if (next >= LANG.language_order.length) {
                    next = 0;
                }

                // set value of global lang attribute
                NODE.html.setAttribute('lang', LANG.language_order[next]);
                
                LANG.updateTitles();
                NAV.updateSectionData();
                NAV.updateSectionIndicator();
            }
        }
    },
    
    // save selection of valid titled elements
    filterTitledElements : function () {
        
        // remove invalid elements
        for (var i = NODE.titled_elems.length; i--;) {

            var elem = NODE.titled_elems[i];

            // check if element has all other title language variations 
            if (elem.hasAttribute('title-de')) {
                // copy current "title" HTML attribute and add it as "title-en" attribute
                elem.setAttribute('title-en', NODE.titled_elems[i].title);
                // add element to valid ones
                var num = NODE.valid_titled_elems.length;
                NODE.valid_titled_elems[num] = elem;
            }

        }
        
    },
    
    // update HTML titles to the current language selected
    updateTitles : function () {
        
        var lang_code = NODE.html.getAttribute('lang');

        // loop all (valid) titled elements
        for (var i = NODE.valid_titled_elems.length; i--;) {
            var elem = NODE.valid_titled_elems[i];
            elem.title = elem.getAttribute('title-' + lang_code);
        }
        
    }
    
};





// manages chains of elements that can be focussed via the tab key
// hijacks the tab key event, and prevents normal focussing via browser
var FOCUS_CHAIN = {
    
    is_active: false,
    
    // all elements in focuschain
    elems: [],
    
    // adds a focus chain
    add : function (elems) {
        
        if (!FOCUS_CHAIN.is_active) {
            
            FOCUS_CHAIN.is_active = true;

            // remove focus from element that currently has focus
            document.activeElement.blur();

            FOCUS_CHAIN.elems = elems;

            _.addEvent(window, 'keydown', FOCUS_CHAIN.hijack_event);
            
        }
        
    },
    
    // removes the current focus chain
    remove : function () {
        
        if (FOCUS_CHAIN.is_active) {
            
            FOCUS_CHAIN.is_active = false;
        
            FOCUS_CHAIN.elems = [];

            _.removeEvent(window, 'keydown', FOCUS_CHAIN.hijack_event);
        
        }
        
    },
    
    hijack_event : function (e) {
        
        // needs at least one element in chain
        if (FOCUS_CHAIN.elems.length < 1) {
            return;
        }
        
        // tab key was pressed
        if (e.keyCode == 9) {
            e.preventDefault();
            
            // only check for next focus element, if there's at least two elems
            if (FOCUS_CHAIN.elems.length != 1) {
                // find currently focussed element in chain, and focus on next in line
                for (var i = FOCUS_CHAIN.elems.length; i--;) {
                    if (document.activeElement == FOCUS_CHAIN.elems[i]) {

                        // last element is in focus
                        if (i == FOCUS_CHAIN.elems.length - 1) {
                            // focus on first
                            FOCUS_CHAIN.elems[0].focus();
                        }
                        else {
                            // otherwise, focus on next
                            FOCUS_CHAIN.elems[i+1].focus();
                        }

                        return;
                    }
                }
            }
            
            // if no element in chain is currently focussed on, focus on first in list
            FOCUS_CHAIN.elems[0].focus();
            
        }
        
    }
    
};





var PROJECT = {
    
    initialize : function () {
        
        /* CATEGORIES */
        
        // go through all project category buttons
        for (var i = NODE.project_category_btns.length; i--;) {
            
            var btn = NODE.project_category_btns[i];
            
            // save category info
            PROJECT.categories[btn.getAttribute('category')] = !_.hasClass(btn, 'inactive');
            
            // add event to toggle category on and off
            _.onClick(btn, function (e) {
                
                var target      = _.target(e);
                
                // if event was triggered by child inside button,
                // go upwards in DOM tree to button
                while (target.tagName != 'BUTTON' && target.tagName != 'button') {
                    target = target.parentElement;
                }
                
                // toggle category
                var category = target.getAttribute('category');
                PROJECT.categories[category] = !PROJECT.categories[category];
                
                // toggle button appearance
                _.toggleClass(target, 'inactive');
                
                // apply new category selection
                PROJECT.updateSelection();
                
            });
        }
        
        
        
        /* SETTINGS */
        
        _.onClick(NODE.project_settings_btn, PROJECT.toggleSettingsMenu); 
        
        // get amount of logic operators that can be applied to selection
        PROJECT.logic_operators_num = PROJECT.logic_operators.length;
        // get current logic operator from HTML button
        PROJECT.current_logic = NODE.project_switch_logic.getAttribute('logic');
        
        // add button for switching between selection logic e.g. AND, OR
        _.onClick(NODE.project_switch_logic, function () {
            
            var num         = PROJECT.logic_operators_num; // operator amount
            var last_index  = num - 1;
            var operators   = PROJECT.logic_operators;
            var current     = PROJECT.current_logic;
            
            // go through logic operators and set current to the next one
            for (var i = num; i--;) {
                
                // current logic operator is at index i in operator list
                if (current == operators[i]) {
                    
                    if (last_index == i) {
                        // select first operator in list
                        PROJECT.current_logic = operators[0];
                    }
                    else {
                        // otherwise, select next operator in list
                        PROJECT.current_logic = operators[i+1];
                    }
                    
                    break;
                    
                }
                
            }
            
            // apply logic as HTML class
            NODE.project_switch_logic.setAttribute('logic', PROJECT.current_logic);
            
            PROJECT.updateSelection();
            
        });
        
        PROJECT.updateSelection();
        
        
        
        /* CARDS */
        
        for (var i = NODE.project_card_show_info_btns.length; i--;) {
            
            var show_info_btn = NODE.project_card_show_info_btns[i];
            
            _.onClick(show_info_btn, function (e) {
                
                var btn = _.target(e);
                var is_shown = _.hasClass(btn, 'show');
                
                // remove 'show' class from other buttons
                for (var i = NODE.project_card_show_info_btns.length; i--;) {
                    _.removeClass(NODE.project_card_show_info_btns[i], 'show');
                }
                
                // if info was hidden previously, show it now
                if (!is_shown) {
                    _.addClass(btn, 'show');
                }
            
            });
            
        }
        
    },
    
    settings_menu_is_open : false,
    
    toggleSettingsMenu : function () {
        
        if (PROJECT.settings_menu_is_open) {
            PROJECT.closeSettingsMenu();
        }
        else {
            PROJECT.openSettingsMenu();
        }
        
    },
    
    openSettingsMenu : function () {
        
        PROJECT.settings_menu_is_open = true;
        
        _.addClass(NODE.project_settings_menu, 'show');
        NODE.project_settings_menu.setAttribute('aria-hidden', 'false');
        
        setTimeout(function () {
            _.onClick(document,                PROJECT.handleClickOutsideSettingsMenu);
            _.addEvent(document, 'touchstart', PROJECT.handleClickOutsideSettingsMenu);
        }, 50);
        
    },
    
    closeSettingsMenu : function () {
        
        PROJECT.settings_menu_is_open = false;
        
        _.removeClass(NODE.project_settings_menu, 'show');
        NODE.project_settings_menu.setAttribute('aria-hidden', 'true');
        
        // remove events if still existing
        _.removeClick(document,               PROJECT.handleClickOutsideSettingsMenu);
        _.removeEvent(document, 'touchstart', PROJECT.handleClickOutsideSettingsMenu);
        
    },
    
    handleClickOutsideSettingsMenu : function (e) {
        
        var elem = _.target(e);
        
        // click is not on menu or one of its children -> hide menu
        if (
            // filter out click on settings menu
            !_.contains(NODE.project_settings_menu, elem) && 
            
            // filter out click on button that opens settings menu
            elem != NODE.project_settings_btn &&
            !_.contains(NODE.project_settings_btn, elem)
        ) {
            
            PROJECT.closeSettingsMenu();
            
            _.removeClick(document,               PROJECT.handleClickOutsideSettingsMenu);
            _.removeEvent(document, 'touchstart', PROJECT.handleClickOutsideSettingsMenu);
            
        }
        
    },
    
    // name -> true|false
    categories : {},
    
    current_logic       : null,
    logic_operators     : ['AND', 'OR'],
    logic_operators_num : null,
    
    updateSelection : function () {
        
        // check if no category is selected, to save time in later loop
        var no_category_selected = true;
        for (var c in PROJECT.categories) {
            if (PROJECT.categories[c] == true) {
                no_category_selected = false;
                break;
            }
        }
        
        // go through all project cards 
        // and toggle them on / off depending on selection
        card_loop: for (var i = NODE.project_cards.length; i--;) {
            
            var card                = NODE.project_cards[i];
            
            // if no category is selected, show all cards
            if (no_category_selected) {
                _.removeClass(card, 'hidden');
                continue;
            }
            
            var card_categories     = card.getAttribute('categories');
            var category_counter    = 0;
            var categories_apply    = 0;
            
            // go through all categories that are currently turned on
            // and check if project card has at least one of them
            for (var c in PROJECT.categories) {
                
                // ignore prototype properties
                if (!Object.prototype.hasOwnProperty.call(PROJECT.categories, c)) {
                    return;
                }
                
                // check if the category is selected (if it's true)
                if (PROJECT.categories[c] == false) {
                    continue;
                }
                
                // counter for categories currently selected
                category_counter++;
                
                // return if a category was found
                if (card_categories.match(new RegExp(_.escapeRegex(c), 'i'))) {
                    
                    // if OR logic, enable card if just one selected category was found on it
                    if (PROJECT.current_logic == 'OR') {
                        // toggle project card on
                        _.removeClass(card, 'hidden');
                        continue card_loop;
                    }
                    // if AND logic, enable card if all selected categories were found on it
                    else if (PROJECT.current_logic == 'AND') {
                        // counter for categories applied
                        categories_apply++;
                    }
                    
                }
                
            }
            
            if (PROJECT.current_logic == 'AND') {
                // show card, if total category counter equals the categories on the item
                if (category_counter == categories_apply) {
                    _.removeClass(card, 'hidden');
                    continue;
                }
            }
            
            // otherwise, if reached here, hide project card
            _.addClass(card, 'hidden');
            
        }
        
    }
    
};




// handles effects for the HTML sections
var SECTION = {
    
    initialize : function () {
        
        SECTION.loadAnimatedBackground();
        
        _.addEvent(window, 'keyup', SECTION.tabEvent);
        
    },
    
    // on every tab, check if the tabbed element is inside a section
    // and unveil the section if it's still hidden
    tabEvent : function (e) {
        
        if (e.keyCode == 9) {
            
            // get element that just aquired focus
            var target = document.activeElement;
            
            // check for parent section
            while (!(target.tagName == 'section' || target.tagName == 'SECTION')) {
                
                target = target.parentElement;
                
                // stop if no parent element anymore (root node)
                if (target == null) {
                    console.log('FAIL: ', _.target(e));
                    return;
                }
                
            }
            
            // if section was found, make it appear if it's hidden
            _.addClass(target, 'appear');
            
        }
        
    },
    
    
    
    spread_values : {
        
        last_left : 0,
        last_colors : [0,0]
        
    },
    
    square_list : [],
    
    loadAnimatedBackground : function (e) {
        
        // don't add animated background, if user prefers reduced motion
        if (window.matchMedia) {
            var  media_query = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (media_query.matches) {
                return;
            }
        }
        
        // add animated squares to top section
        var y_positions = [
            0, 5, 10, 15, 19, 32, 39, 42, 45, 58, 65, 70, 76, 80, 92, 95
        ];
        
        for (var i = y_positions.length; i--;) {
            var y_pos = y_positions[i];
            SECTION.addSquareToAnimatedBackground(y_pos);
        }
        
        // add some randomized squares for good measure
        for (var i = 2; i--;) {
            SECTION.addSquareToAnimatedBackground(_.randomInt(75,95));
            SECTION.addSquareToAnimatedBackground(_.randomInt(0,60));
        }
        
        setInterval(SECTION.addSquareToAnimatedBackground, 3000);
        
    },
    
    addSquareToAnimatedBackground : function (animation_delay) {
        
        // remove the oldest rectangle (first item in list)
        if (SECTION.square_list.length > 70) {
            var removed = SECTION.square_list.shift();
            _.remove(removed);
        }
        
        // generate styles
        var size = _.randomFloat(5,20) + '%';
        var left = SECTION.spread_values.last_left > 50 ? _.randomInt(0,48) : _.randomInt(52,100);
        SECTION.spread_values.last_left = left;
        var styles = {
            style : {
                width               : size,
                padding             : '0 0 '+size+' 0',
                left                : left + '%'
            }
        };
        if (animation_delay) {
            styles.style['animation-delay'] = '-' + (animation_delay || 0) + 's';
        }
        
        // last-colors: [0: before-last, 1: last]
        // generate current color
        var curr_color = 
            SECTION.spread_values.last_colors[0] == SECTION.spread_values.last_colors[1] ?
                        // if last two were the same, switch colors
                        (SECTION.spread_values.last_colors[1] + 1) % 2 : SECTION.spread_values.last_colors[1];
        // make before-last become last, and current become last for next round
        SECTION.spread_values.last_colors[0] = SECTION.spread_values.last_colors[1];
        SECTION.spread_values.last_colors[1] = curr_color;
        
        // alternate color every new square
        var color       = (curr_color == 0 ? 'red' : 'blue');
        
        var animation   = (_.randomInt(0,1) == 0 ? 'rotating-left' : 'rotating-right');
        var square      = _.create('div.square.'+color+'.'+animation, styles);
        
        // add rectangle to list and DOM
        SECTION.square_list[SECTION.square_list.length] = square;
        _.append(NODE.animated_background, square);
        
    }
    
};





// scroll effects
var SCROLL = {
    
    initialize : function () {
        
        // less expensive scroll checker
        window.onscroll = SCROLL.event;
        setInterval(SCROLL.update, 100);
        
    },
    
    scrollY      : 0,
    has_scrolled : false,
    
    // if user has scrolled, set variable to true
    event : function () {
        SCROLL.has_scrolled = true;
    },
    
    // called on interval; if variable is true, apply scroll effects
    update : function () {
        
        // only do stuff, if user has scrolled
        if (SCROLL.has_scrolled == false) {
            return;
        }
    
        // get scroll position
        SCROLL.scrollY = window.scrollY || window.pageYOffset;
        SCROLL.has_scrolled = false;
        
        SCROLL.showHiddenSections();
        
        NAV.updateSectionData();
        
        // only update nav indicator if desktop nav is visible
        if (window.innerWidth >= 800) {
            NAV.setLinkForSectionActive();
        }
        
    },
    
    // fades in sections after scrolling to them
    showHiddenSections : function () {
        
        var allAppeared = true;
        
        // check if all sections already appeared
        for (var i = NODE.sections.length; i--;) {
            if (!_.hasClass(NODE.sections[i], 'appear')) {
                allAppeared = false;
                break;
            }
        }
        // if all sections already appeared, disable this function
        if (allAppeared) {
            SCROLL.showHiddenSections = function () {};
            return;
        }
        
        // get scroll section where user is currently at
        var section = 0;
        for (var i = NAV.section_positions.length; i--;) {
            if (NAV.section_positions[i] - SCROLL.scrollY < 300) {
                section = i;
                break;
            }
        }

        // filter out intro section
        if (section != 0) {
            _.addClass(NODE.sections[section - 1], 'appear');
        }
        
    },
    
    // triggers an animated scroll effect to the top of the page
    toTop : function () {
        
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
    
    // triggers an animated scroll effect to an element
    toElem : function (elem) {
        
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
        
    },
    
    // triggers an animated scroll effect towards a semantic section
    toSection : function (e) {

        _.preventDefault(e);

        // get anchor link (element id)
        var target = _.target(e);
        
        // if event was triggered by child of link, get parent
        while (target.tagName != 'A' && target.tagName != 'a') {
            target = target.parentElement;
        }
        
        var href = target.href.replace(/.*#/i, '');

        // scroll to element
        SCROLL.toElem(NODE['section_' + href]);

        // set button as active, and all others inactive
        for (var i = NODE.nav_links.length; i--;) {
            _.removeClass(NODE.nav_links[i], 'active');
        }
        _.addClass(target, 'active');
        
    }
    
};





// initialize
(function () {
    NODE();
    NAV.initialize();
    LANG.initialize();
    PROJECT.initialize();
    SCROLL.initialize();
    SECTION.initialize();
})();