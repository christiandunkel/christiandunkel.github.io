// holds references to HTML elements
var NODE = function () {
    
    // general elements
    NODE.html = document.documentElement  || _.tag('html')[0];
    NODE.head = document.head             || _.tag('head')[0];
    NODE.body = document.body             || _.tag('body')[0];
    NODE.main = _.tag('main')[0];
    NODE.animated_background = _.id('animated-background');
    
    // navigation
    NODE.nav                = _.id('nav');
    NODE.nav_links          = _.tag('a', _.class('content', NODE.mobile_menu)[0]);
    // add CSS for the nav indicator
    // (dependent on browser and button content)
    NODE.nav_indicator      = _.class('hover-bg')[0];
    
    // hidden mobile menu
    NODE.hamburger_btn      = _.id('hamburger-btn');
    NODE.mobile_menu        = _.id('mobile-menu');
    NODE.mobile_overlay     = _.class('overlay', NODE.mobile_menu)[0];
    // logo visible on mobile view
    NODE.mobile_logo        = _.class('mobile-logo', NODE.nav)[0];
    
    // semantic sections of site
    NODE.sections           = _.class('content-section');
    
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
    
    // footer
    NODE.footer            = _.tag('footer')[0];
    NODE.to_top_btn        = _.id('to-top');
    NODE.footer_graphic    = _.id('footer-graphic');
    NODE.footer_graphic_l1 = _.class('layer1', NODE.footer_graphic)[0];
    NODE.footer_graphic_l2 = _.class('layer2', NODE.footer_graphic)[0];
    
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
            
            FOCUS_CHAIN.set([
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
            
            FOCUS_CHAIN.reset();
            
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
    
    selection_type : 0,
    // 0: unselected
    // 1: by elems array
    // 2: by start_elem, end_elem and elems_container
    
    // for selection type 1, elements in focuschain
    elems : [],
    // for selection type 2:
    start_elem : null,
    end_elem : null,
    elems_container : null,
    
    isActive : function () {
        return selection_type === 0;
    },
    
    set : function (input) {
        
        // remove focus from element that currently has focus
        document.activeElement.blur();
        
        if (_.isArray(input)) {
            FOCUS_CHAIN.selection_type = 1;
            FOCUS_CHAIN.elems = input;
        }
        else {
            FOCUS_CHAIN.selection_type = 2;
            FOCUS_CHAIN.start_elem = input.start;
            FOCUS_CHAIN.end_elem = input.end;
            FOCUS_CHAIN.elems_container = input.container;
        }
        
        _.addEvent(window, 'keydown', FOCUS_CHAIN.event);
        
    },
    
    reset : function () {
        
        FOCUS_CHAIN.reset();
        
        FOCUS_CHAIN.selection_type = 0;
        // reset stuff for selection type 1
        FOCUS_CHAIN.elems = [];
        // reset stuff for selection type 2
        FOCUS_CHAIN.start_elem = null;
        FOCUS_CHAIN.end_elem = null;
        FOCUS_CHAIN.elems_container = null;
        
        _.removeEvent(window, 'keydown', FOCUS_CHAIN.event);
        
    },
    
    event : function (e) {
        
        // tab key was pressed
        if (e.keyCode == 9) {
            
            var is_backwards_tab = (e.shiftKey === true);
            
            // handle selection
            if (FOCUS_CHAIN.selection_type == 1) {
                FOCUS_CHAIN.handleSelectionType1(e, is_backwards_tab);
            }
            else {
                FOCUS_CHAIN.handleSelectionType2(e, is_backwards_tab);
            }
            
        }
        
    },
    
    handleSelectionType1 : function (e, go_backwards) {
        
        // needs at least one element in chain
        if (FOCUS_CHAIN.elems.length < 1) {
            return;
        }
        // if multiple elems, focus chain can work, so prevent default focus change by browser
        else {
            e.preventDefault();
        }
            
        // only check for next focus element, if there's at least two elems
        if (FOCUS_CHAIN.elems.length != 1) {
            // find currently focussed element in chain, and focus on next in line
            for (var i = FOCUS_CHAIN.elems.length; i--;) {
                
                if (document.activeElement == FOCUS_CHAIN.elems[i]) {

                    // last element is in focus
                    if (i == FOCUS_CHAIN.elems.length - 1) {
                        // if going backwards, focus on before-last elem
                        if (go_backwards) {
                            FOCUS_CHAIN.elems[FOCUS_CHAIN.elems.length - 2].focus();
                        }
                        // if going forwards, focus on first elem
                        else {
                            FOCUS_CHAIN.elems[0].focus();
                        }
                    }
                    // first element is in focus
                    else if (i == 0) {
                        // if going backwards, focus on last elem
                        if (go_backwards) {
                            FOCUS_CHAIN.elems[FOCUS_CHAIN.elems.length - 1].focus();
                        }
                        // if going forwards, focus on next (second) elem
                        else {
                            FOCUS_CHAIN.elems[1].focus();
                        }
                    }
                    else {
                        // if going backwards, focus on previous
                        if (go_backwards) {
                            FOCUS_CHAIN.elems[i-1].focus();
                        }
                        // if going forwards, focus on next
                        else {
                            FOCUS_CHAIN.elems[i+1].focus();
                        }
                    }

                    return;
                }
                
            }
        }

        // if no element in chain is currently focussed on, focus on first in list
        FOCUS_CHAIN.elems[0].focus();
        
    },
    
    handleSelectionType2 : function (e, go_backwards) {
        
        // check element that had focus until now
        if (
            !go_backwards &&
            // if last element reached, focus on first
            document.activeElement == FOCUS_CHAIN.end_elem
        ) {
            e.preventDefault();
            FOCUS_CHAIN.start_elem.focus();
            return;
        }
        
        // check element that now gets focus
        setTimeout(function () {
            
            if (
                // if no element inside window is being focussed
                !_.contains(FOCUS_CHAIN.elems_container, document.activeElement)
            ) {
                
                e.preventDefault();
                
                // if user is tabbing backwards, focus end_elem
                if (go_backwards) {
                    FOCUS_CHAIN.end_elem.focus();
                }
                // if user is tabbing forwards, focus start_elem
                else {
                    FOCUS_CHAIN.start_elem.focus();
                }
                
            }
            
        }, 5);
        
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
        
        SECTION.playAnimatedBackground();
        
        _.addEvent(window, 'focus', SECTION.playAnimatedBackground);
        _.addEvent(window, 'blur', SECTION.clearAnimatedBackground);
        
    },
    
    background_interval : null,
    
    playAnimatedBackground : function () {
        
        // check if it's already running
        if (SECTION.background_interval) {
            return;
        }
        
        SECTION.clearAnimatedBackground();
        
        // add animated squares to top section
        var y_positions = [0, 5, 10, 22, 32, 50, 61, 72, 87];
        
        for (var i = y_positions.length; i--;) {
            var y_pos = y_positions[i];
            SECTION.addSquareToAnimatedBackground(y_pos);
        }
        
        // add some randomized squares for good measure
        for (var i = 2; i--;) {
            SECTION.addSquareToAnimatedBackground(_.randomInt(75,95));
            SECTION.addSquareToAnimatedBackground(_.randomInt(0,60));
        }
        
        SECTION.background_interval = setInterval(SECTION.addSquareToAnimatedBackground, 4000);
        
    },
    
    clearAnimatedBackground : function () {
        
        if (SECTION.background_interval) {
            clearInterval(SECTION.background_interval);
            SECTION.background_interval = null;
        }
        
        for (var i = SECTION.square_list.length; i--;) {
            _.remove(SECTION.square_list[i]);
        }
        SECTION.square_list = [];
        
    },
    
    addSquareToAnimatedBackground : function (animation_delay) {
        
        // remove the oldest square (first item in list)
        if (SECTION.square_list.length > 70) {
            var removed = SECTION.square_list.shift();
            _.remove(removed);
        }
        
        // generate styles
        var size = _.randomFloat(5,20) + '%';
        var left = SECTION.spread_values.last_left > 50 ? _.randomInt(0,48) : _.randomInt(52,100);
        SECTION.spread_values.last_left = left;
        
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
        var color     = (curr_color == 0 ? 'red' : 'blue');
        var square    = _.create('div.square.' + color);
        
        // generate wrapper element that is then animated
        var styles = {
            style : {
                width   : size,
                padding : '0 0 '+size+' 0',
                left    : left + '%'
            }
        };
        if (animation_delay) {
            styles.style['animation-delay'] = '-' + (animation_delay || 0) + 's';
        }
        var animation = (_.randomInt(0,1) == 0 ? 'rotating-left' : 'rotating-right');
        var square_wrapper = _.create('div.square-wrapper.' + animation, styles);
        
        // add square to list and DOM
        SECTION.square_list[SECTION.square_list.length] = square_wrapper;
        _.append(square_wrapper, square);
        _.append(NODE.animated_background, square_wrapper);
        
    }
    
};





// scroll effects
var SCROLL = {
    
    initialize : function () {
        
        // don't add scroll effects on reduced motion
        if (window.matchMedia) {
            var  media_query = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (media_query.matches) {
                return;
            }
        }
        
        // less expensive scroll checker
        window.onscroll = SCROLL.event;
        setInterval(SCROLL.update, 100);
        
        // initialize footer colors as rgba objects
        SCROLL.footer_color_l1 = _.getStyle(NODE.footer_graphic_l1, 'color');
        SCROLL.footer_color_l1 = _.objectifyRGBstring(SCROLL.footer_color_l1);
        SCROLL.footer_color_l2 = _.getStyle(NODE.footer_graphic_l2, 'color');
        SCROLL.footer_color_l2 = _.objectifyRGBstring(SCROLL.footer_color_l2);
        
    },
    
    scrollY      : 0,
    page_height  : 0,
    from_bottomY : 0, // nr of pixels users bottom browser border is away from bottom of page
    has_scrolled : false,
    
    footer_height : 0,
    footer_color_l1 : 0,
    footer_color_l2 : 0,
    
    // if user has scrolled, set variable to true
    event : function () {
        SCROLL.has_scrolled = true;
        
        // update footer graphic
        SCROLL.scrollY = window.scrollY || window.pageYOffset;
        SCROLL.from_bottomY = Math.abs(SCROLL.page_height - window.innerHeight - SCROLL.scrollY);
        if (SCROLL.from_bottomY < SCROLL.footer_height) {
            SCROLL.animateFooterGraphic();
        }
    },
    
    // called on interval; if variable is true, apply scroll effects
    update : function () {
        
        // only do stuff, if user has scrolled
        if (SCROLL.has_scrolled == false) {
            return;
        }
    
        // get scroll position
        SCROLL.page_height = Math.max(
            NODE.body.scrollHeight,
            NODE.body.offsetHeight,
            NODE.html.clientHeight,
            NODE.html.scrollHeight,
            NODE.html.offsetHeight
        );
        SCROLL.has_scrolled = false;
        
        // update height of footer + footer graphic
        SCROLL.footer_height = Math.max(
            NODE.footer_graphic.clientHeight,
            NODE.footer_graphic.offsetHeight
        ) + Math.max(
            NODE.footer.clientHeight,
            NODE.footer.offsetHeight
        );
        
        // show sections on screen
        SCROLL.showHiddenSections();
        NAV.updateSectionData();
        
        // only update nav indicator if desktop nav is visible
        if (window.innerWidth >= 800) {
            NAV.setLinkForSectionActive();
        }
        
    },
    
    animateFooterGraphic : function () {
        
        var original_left = 50;
        var percentage_scrolled_of_footer = (SCROLL.footer_height - SCROLL.from_bottomY) / SCROLL.footer_height; // e.g. 0.01 (1%) to 1.0 (100%)
        var move_by = percentage_scrolled_of_footer * 6; // move by 0-6%
        
        // move layer1 to the right
        _.setStyles(NODE.footer_graphic_l1, {
            left: (original_left + move_by)+'%'
        });
        
        // move layer2 to the left
        _.setStyles(NODE.footer_graphic_l2, {
            left: (original_left - (move_by * .75))+'%'
        });
            
        
        
        // color lerping (starts at 30% of footer scrolled)
        
        // 0.3 (30%) to 1 (100%) mapped to 0 (0%) to 1 (100%)
        var mapped_percentage = percentage_scrolled_of_footer > 0.3 ? 
            (percentage_scrolled_of_footer - 0.3) / (1 - 0.3) : 0;

        // lerp colors of layer 1 and footer
        var rgb_1 = _.lerpColorRGB(
            SCROLL.footer_color_l1, 
            SCROLL.footer_color_l2, 
            mapped_percentage
        );
        var color_1 = 'rgb(' + 
            Math.round(rgb_1.r) + ',' + 
            Math.round(rgb_1.g) + ',' + 
            Math.round(rgb_1.b) + 
        ')';
        _.setStyles(NODE.footer_graphic_l1, {
            color : color_1
        });

        _.setStyles(NODE.footer, {
            'background-color' : color_1
        })

        // lerp colors of layer 2
        var rgb_2 = _.lerpColorRGB(
            SCROLL.footer_color_l2, 
            SCROLL.footer_color_l1, 
            mapped_percentage
        );
        var color_2 = 'rgb(' + 
            Math.round(rgb_2.r) + ',' + 
            Math.round(rgb_2.g) + ',' +
            Math.round(rgb_2.b) +
        ')';
        _.setStyles(NODE.footer_graphic_l2, {
            color : color_2
        });
        
    },
    
    // fades in sections after scrolling to them
    showHiddenSections : function () {
        
        var all_appeared = true;
        
        // show all sections, if one has (almost) scrolled to the bottom
        if (SCROLL.from_bottomY < 200) {
            for (var i = NODE.sections.length; i--;) {
                _.addClass(NODE.sections[i], 'appear');
            }
        }
        // otherwise, check if any section has not yet appeared
        else {
            for (var i = NODE.sections.length; i--;) {
                if (!_.hasClass(NODE.sections[i], 'appear')) {
                    all_appeared = false;
                    break;
                }
            }
        }
        
        // if all sections already appeared, disable this function
        if (all_appeared) {
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

        // skip to position, if distance is too small
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