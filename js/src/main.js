// holds references to HTML elements
var NODE = {
    
    initialize : function () {
        // general elements
        NODE.main = document.querySelector('main');
        NODE.animated_background = document.querySelector('#animated-background');

        // navigation
        NODE.nav = document.querySelector('#nav');
        NODE.hamburger_btn = document.querySelector('#hamburger-btn');
        NODE.mobile_menu = document.querySelector('#mobile-menu');
        NODE.mobile_overlay = NODE.mobile_menu.querySelector('.overlay');
        // logo visible on mobile view
        NODE.mobile_logo = NODE.nav.querySelector('.mobile-logo');
        NODE.nav_links = Array.from(NODE.mobile_menu.querySelector('.content').querySelectorAll('a'));
        // add CSS for the nav indicator
        // (dependent on browser and button content)
        NODE.nav_indicator = document.querySelector('.hover-bg');

        // semantic sections of site
        NODE.sections = Array.from(document.querySelectorAll('.content-section'));

        // language selection
        NODE.lang_btn = document.querySelector('#language-btn');
        // elements with title attributes
        NODE.titled_elems = Array.from(document.querySelectorAll('[title]'));
        NODE.valid_titled_elems = [];

        // project selection
        NODE.project_category_btns = Array.from(document.querySelectorAll('.project-select-btn'));
        NODE.project_container = document.querySelector('#projects-container');
        NODE.project_cards = Array.from(document.querySelectorAll('.project'));
        NODE.project_card_show_info_btns = Array.from(document.querySelectorAll('.project-show-info-btn'));
        NODE.project_settings_btn = document.querySelector('#project-settings-btn');
        NODE.project_settings_menu = document.querySelector('#project-settings-menu');
        NODE.project_switch_logic = document.querySelector('#project-switch-logic-btn');

        // footer
        NODE.footer = document.querySelector('footer');
        NODE.to_top_btn = document.querySelector('#to-top');
        NODE.footer_graphic = document.querySelector('#footer-graphic');
        NODE.footer_graphic_l1 = NODE.footer_graphic.querySelector('.layer1');
        NODE.footer_graphic_l2 = NODE.footer_graphic.querySelector('.layer2');
        
        delete NODE.initialize;
    }
};





// manages main navigation and related functionality
var NAV = {
    
    initialize : function () {
        
        // add effect to mobile nav button
        NODE.hamburger_btn.addEventListener('click', NAV.toggleWindow);
        NODE.mobile_overlay.addEventListener('click', NAV.closeWindow);
        
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
            NODE['section_' + href] = document.querySelector('#'+href);

            a.addEventListener('click', SCROLL.toSection);
        }
        
        // update semantic sections
        NAV.updateSectionData();
        
        // update sizes/positions for section indicator dynamically
        addEventListener('load', NAV.updateSectionIndicator);
        addEventListener('resize', function () {
            NAV.updateSectionData();
            NAV.setLinkForSectionActive();
            NAV.updateSectionIndicator();
        });
        
        // scroll to top effect on click
        NODE.to_top_btn.addEventListener('click', SCROLL.toTop);
    },
    
    is_open : false,
    
    openWindow : function () {
        if (!NAV.is_open) {
            NAV.is_open = true;
            document.documentElement.classList.add('mobile-nav-open');
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
            document.documentElement.classList.remove('mobile-nav-open');
            
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
        
        if (NODE.nav_indicator_style) {
            NODE.nav_indicator_style.remove();
        }

        var selector = '#nav .content';
        var style = selector + ' .hover-bg {display: block !important;}';
        var num = NODE.nav_links.length;

        if (num == 0) return;

        var sizes = {
            height: NODE.nav_links[1].getBoundingClientRect().height,
            marginLeft: {},
            marginRight: {},
            width: {},
            left: {}
        };

        // get sizes of all elements
        for (var i = 0; i < num; i++) {
            
            // get computed CSS values
            sizes.width[i] = NODE.nav_links[i].getBoundingClientRect().width;
            sizes.marginLeft[i] = Number.parseFloat(
                getComputedStyle(NODE.nav_links[i]).getPropertyValue('margin-left').replace(/[a-z]+/gi, '')
            );
            sizes.marginRight[i] = Number.parseFloat(
                getComputedStyle(NODE.nav_links[i]).getPropertyValue('margin-right').replace(/[a-z]+/gi, '')
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
            style += selector + ' a.a' + i + '.active ~ .hover-bg {'
                   +    'left:'    + sizes.left[i] + 'px;'
                   +    'width:'   + sizes.width[i] + 'px;'
                   + '}';

        }

        // generate code for ':hover' CSS effect
        // (must come after '.active' effect to overwrite it)
        for (var i = 0; i < num; i++) {
            style += selector + ' a.a' + i + ':hover ~ .hover-bg {'
                   +    'left:'    + sizes.left[i] + 'px;'
                   +    'width:'   + sizes.width[i] + 'px;'
                   + '}';

        }

        NODE.nav_indicator_style = _.create('style', {
            type: 'text/css',
            innerHTML: style
        });
        document.head.append(NODE.nav_indicator_style);
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
        if (active_btn.classList.contains('active')) {
            return;
        }

        // if not, enable it and disable all other buttons
        for (var i = NODE.nav_links.length; i--;) {
            NODE.nav_links[i].classList.remove('active');
        }
        active_btn.classList.add('active');
    }
};





// manages the language menu and functionality
var LANG = {
    
    initialize : function () {
        
        // events to open and close language menu
        NODE.lang_btn.addEventListener('click', LANG.toggleLanguage);
        
        LANG.filterTitledElements();
        
        // if language was changed by language detection in <head> element
        if (document.documentElement.getAttribute('lang') != 'en') {
            LANG.updateTitles();
        }
        
    },
    
    language_order : ['en', 'de'],
    
    toggleLanguage : function () {

        var current_lang = document.documentElement.getAttribute('lang');
        
        for (var i = 0, len = LANG.language_order.length; i < len; i++) {
            
            // find current language in order
            if (LANG.language_order[i] == current_lang) {
                var next = i + 1;
                
                if (next >= LANG.language_order.length) {
                    next = 0;
                }

                // set value of global lang attribute
                document.documentElement.setAttribute('lang', LANG.language_order[next]);
                
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
            if (elem.hasAttribute('data-title-de')) {
                // copy current "title" HTML attribute and add it as "data-title-en" attribute
                elem.setAttribute('data-title-en', NODE.titled_elems[i].title);
                // add element to valid ones
                var num = NODE.valid_titled_elems.length;
                NODE.valid_titled_elems[num] = elem;
            }

        }
        
    },
    
    // update HTML titles to the current language selected
    updateTitles : function () {
        
        var lang_code = document.documentElement.getAttribute('lang');

        // loop all (valid) titled elements
        for (var i = NODE.valid_titled_elems.length; i--;) {
            var elem = NODE.valid_titled_elems[i];
            elem.title = elem.getAttribute('data-title-' + lang_code);
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
        
        if (Array.isArray(input)) {
            FOCUS_CHAIN.selection_type = 1;
            FOCUS_CHAIN.elems = input;
        }
        else {
            FOCUS_CHAIN.selection_type = 2;
            FOCUS_CHAIN.start_elem = input.start;
            FOCUS_CHAIN.end_elem = input.end;
            FOCUS_CHAIN.elems_container = input.container;
        }
        
        addEventListener('keydown', FOCUS_CHAIN.event);
    },
    
    reset : function () {
        
        FOCUS_CHAIN.selection_type = 0;
        // reset stuff for selection type 1
        FOCUS_CHAIN.elems = [];
        // reset stuff for selection type 2
        FOCUS_CHAIN.start_elem = null;
        FOCUS_CHAIN.end_elem = null;
        FOCUS_CHAIN.elems_container = null;
        
        removeEventListener('keydown', FOCUS_CHAIN.event);
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
            
            // if no element inside window is being focussed
            if (!FOCUS_CHAIN.elems_container.contains(document.activeElement)) {
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
    
    generateProjectsHTML : function () {
        
        // create project-category-selection buttons from project data
        for (var i = PROJECT_CATEGORIES.length; i--;) {
            
            // get the category
            var category = PROJECT_CATEGORIES[i];
            
            // generate the language-specific text content inside the category button
            var btn_content = '';
            var lang_keys = Object.keys(category.lang);
            for (var j = lang_keys.length; j--;) {
                var lang = lang_keys[j];
                btn_content += '<span lang="' + lang + '">' + category.lang[lang] + '</span>';
            }
            
            // create a button element and add it to the DOM
            var btn = _.create('button.project-select-btn.responsive.small.inactive', {
                innerHTML : btn_content,
                'data-select-category' : category.id 
            });
            btn.after(NODE.project_settings_menu);
        }
        
        // create project-cards from project data
        for (var i = PROJECTS.length; i--;) {
            
            // get the project
            var project = PROJECTS[i];
            
            var project_categories = '';
            for (var j = project.categories.length; j--;) {
                project_categories += project.categories[j] + (j > 0 ? ' ' : '');
            }
            var card = _.create('div.project', {
                    'data-categories' : project_categories
                });
            NODE.project_container.prepend(card);
            
            var project_link = _.create('a', {
                href : project.links[0].link,
                target : '_blank',
                rel : 'noopener noreferrer',
                innerHTML : '<figure>' +
                                '<img class="image" loading="lazy" src="' + project.image + '" alt="' + project.lang.en.title + ' Preview Image" />' +
                            '</figure>'
            });
            card.append(project_link);
            
            var project_info = _.create('div.project-info');
            var heading = _.create('h3.heading');
            var date_element = _.create('time.year', {
                innerHTML: project.year,
                datetime: project.year
            });
            var description = _.create('p.desc');
            project_info.append(heading, date_element, description);
            card.append(project_info);
            
            // generate the language-specific heading and description
            var lang_keys = Object.keys(project.lang);
            for (var j = lang_keys.length; j--;) {
                
                var lang = lang_keys[j];
                
                heading.append(
                    _.create('span', {
                        lang: lang,
                        innerHTML: project.lang[lang].title
                    })
                );
                
                description.append(
                    _.create('span', {
                        lang: lang,
                        innerHTML: project.lang[lang].description
                    })
                );
            }
            
            var links = _.create('ul.links');
            project_info.append(links);
            for (var j = 0, len = project.links.length; j < len; j++) {
                var link = project.links[j];
                var li = _.create('li');
                links.append(li);
                var a = _.create('a' + (link.link.match(/github\.com/gi) ? '.github' : ''), {
                        href : link.link,
                        target : '_blank',
                        rel : 'noopener noreferrer'
                    });
                li.append(a);
                var link_lang_keys = Object.keys(link.lang);
                for (var k = link_lang_keys.length; k--;) {
                    var lang = link_lang_keys[k];
                    a.append(
                        _.create('span', {
                            lang : lang,
                            innerHTML : link.lang[lang]
                        })
                    );
                }
            }
            
            var tags = _.create('ul.tags').appendTo(project_info);
            for (var j = 0, len = PROJECT_CATEGORIES.length; j < len; j++) {
                var category = PROJECT_CATEGORIES[j];
                if (project.categories.includes(category.id)) {
                    var li = _.create('li');
                    tags.append(li);
                    var category_lang_keys = Object.keys(category.lang);
                    for (var k = category_lang_keys.length; k--;) {
                        var lang = category_lang_keys[k];
                        li.append(
                            _.create('span', {
                                lang : lang,
                                innerHTML : category.lang[lang]
                            })
                        );
                    }
                }
            }
        }
    },
    
    initialize : function () {
        
        /* CATEGORIES */
        
        // go through all project category buttons
        for (var i = NODE.project_category_btns.length; i--;) {
            
            var btn = NODE.project_category_btns[i];
            
            // save category info
            PROJECT.categories[btn.getAttribute('data-select-category')] = !btn.classList.contains('inactive');
            
            // add event to toggle category on and off
            btn.addEventListener('click', function (e) {
                
                var target = _.target(e);
                
                // if event was triggered by child inside button,
                // go upwards in DOM tree to button
                while (target.tagName != 'BUTTON' && target.tagName != 'button') {
                    target = target.parentElement;
                }
                
                // toggle category
                var category = target.getAttribute('data-select-category');
                PROJECT.categories[category] = !PROJECT.categories[category];
                
                // toggle button appearance
                target.classList.toggle('inactive');
                
                // apply new category selection
                PROJECT.updateSelection();
            });
        }
        
        
        
        /* SETTINGS */
        
        NODE.project_settings_btn.addEventListener('click', PROJECT.toggleSettingsMenu); 
        
        // get amount of logic operators that can be applied to selection
        PROJECT.logic_operators_num = PROJECT.logic_operators.length;
        // get current logic operator from HTML button
        PROJECT.current_logic = NODE.project_switch_logic.getAttribute('logic');
        
        // add button for switching between selection logic e.g. AND, OR
        NODE.project_switch_logic.addEventListener('click', function () {
            
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
            
            show_info_btn.addEventListener('click', function (e) {
                var btn = _.target(e);
                var is_shown = btn.classList.contains('show');
                
                // remove 'show' class from other buttons
                for (var i = NODE.project_card_show_info_btns.length; i--;) {
                    NODE.project_card_show_info_btns[i].classList.remove('show');
                }
                
                // if info was hidden previously, show it now
                if (!is_shown) {
                    btn.classList.add('show');
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

        NODE.project_settings_menu.classList.add('show');
        NODE.project_settings_menu.setAttribute('aria-hidden', 'false');

        setTimeout(function () {
            document.addEventListener('click', PROJECT.handleClickOutsideSettingsMenu);
            document.addEventListener('touchstart', PROJECT.handleClickOutsideSettingsMenu);
        }, 50);
    },
    
    closeSettingsMenu : function () {
        
        PROJECT.settings_menu_is_open = false;
        
        NODE.project_settings_menu.classList.remove('show');
        NODE.project_settings_menu.setAttribute('aria-hidden', 'true');
        
        // remove events if still existing
        document.removeEventListener('click', PROJECT.handleClickOutsideSettingsMenu);
        document.removeEventListener('touchstart', PROJECT.handleClickOutsideSettingsMenu);
        
    },
    
    handleClickOutsideSettingsMenu : function (e) {
        
        var elem = _.target(e);
        
        // click is not on menu or one of its children -> hide menu
        if (
            // filter out click on settings menu
            !NODE.project_settings_menu.contains(elem) && 
            
            // filter out click on button that opens settings menu
            elem != NODE.project_settings_btn &&
            !NODE.project_settings_btn.contains(elem)
        ) {
            PROJECT.closeSettingsMenu();
            document.removeEventListener('click', PROJECT.handleClickOutsideSettingsMenu);
            document.removeEventListener('touchstart', PROJECT.handleClickOutsideSettingsMenu);
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
            
            var card = NODE.project_cards[i];
            
            // if no category is selected, show all cards
            if (no_category_selected) {
                card.classList.remove('hidden');
                continue;
            }
            
            var card_categories  = card.getAttribute('data-categories');
            var category_counter = 0;
            var categories_apply = 0;
            
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
                        card.classList.remove('hidden');
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
                    card.classList.remove('hidden');
                    continue;
                }
            }
            
            // otherwise, if reached here, hide project card
            card.classList.add('hidden');
        }
        
    }
    
};




// handles effects for the HTML sections
var SECTION = {
    
    initialize : function () {
        
        SECTION.loadAnimatedBackground();
        
        addEventListener('keyup', SECTION.tabEvent);
        
        // set the current year string
        var year_elems = document.querySelectorAll('.current-year');
        var current_year = (new Date()).getFullYear();
        for (var i = 0, len = year_elems.length; i < len; i++) {
            year_elems[i].innerHTML = current_year;
        }
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
            target.classList.add('appear');
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
        
        addEventListener('focus', SECTION.playAnimatedBackground);
        addEventListener('blur', SECTION.clearAnimatedBackground);        
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
        
        SECTION.background_interval = setInterval(SECTION.addSquareToAnimatedBackground, 6000);
        
    },
    
    clearAnimatedBackground : function () {
        
        if (SECTION.background_interval) {
            clearInterval(SECTION.background_interval);
            SECTION.background_interval = null;
        }
        
        for (var i = SECTION.square_list.length; i--;) {
            SECTION.square_list[i].remove();
        }
        SECTION.square_list = [];
        
    },
    
    addSquareToAnimatedBackground : function (animation_delay) {
        
        // remove the oldest square (first item in list)
        if (SECTION.square_list.length > 70) {
            SECTION.square_list.shift().remove();
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
        var color  = (curr_color == 0 ? 'red' : 'blue');
        var square = _.create('div.square.' + color);
        
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
        square_wrapper.append(square)
        NODE.animated_background.append(square_wrapper);
        
        // add square to list and DOM
        SECTION.square_list[SECTION.square_list.length] = square_wrapper;
    }
    
};





// scroll effects
var SCROLL = {
    
    initialize : function () {
        
        // don't add scroll effects on reduced motion
        if (window.matchMedia) {
            var media_query = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (media_query.matches) {
                return;
            }
        }
        
        // less expensive scroll checker
        window.onscroll = SCROLL.event;
        setInterval(SCROLL.update, 100);
        
        // initialize footer colors as rgba objects
        SCROLL.footer_color_l1 = getComputedStyle(NODE.footer_graphic_l1).getPropertyValue('color');
        SCROLL.footer_color_l1 = _.objectifyRGBstring(SCROLL.footer_color_l1);
        SCROLL.footer_color_l2 = getComputedStyle(NODE.footer_graphic_l2).getPropertyValue('color');
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
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
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
        
        // move layer1 to the right and layer2 to the right
        NODE.footer_graphic_l1.style.left = (original_left + move_by)+'%';
        NODE.footer_graphic_l2.style.left = (original_left - (move_by * .75))+'%';
            
        
        
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
        NODE.footer_graphic_l1.style.color = color_1;
        NODE.footer.style.backgroundColor = color_1;

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
        NODE.footer_graphic_l2.style.color = color_2;
    },
    
    // fades in sections after scrolling to them
    showHiddenSections : function () {
        
        var all_appeared = true;
        
        // show all sections, if one has (almost) scrolled to the bottom
        if (SCROLL.from_bottomY < 200) {
            for (var i = NODE.sections.length; i--;) {
                NODE.sections[i].classList.add('appear');
            }
        }
        // otherwise, check if any section has not yet appeared
        else {
            for (var i = NODE.sections.length; i--;) {
                if (!NODE.sections[i].classList.contains('appear')) {
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
            // number of pixels user must have scrolled into the section
            var px_in_section = window.innerHeight*(2/3);
            if (NAV.section_positions[i] - SCROLL.scrollY < px_in_section) {
                section = i;
                break;
            }
        }

        // filter out intro section
        if (section != 0) {
            NODE.sections[section - 1].classList.add('appear');
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

        e.preventDefault();
        e.stopPropagation();

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
            NODE.nav_links[i].classList.remove('active');
        }
        target.classList.add('active');
    }
    
};





// initialize
(function () {
    NODE.initialize();
    PROJECT.generateProjectsHTML();
    NAV.initialize();
    LANG.initialize();
    PROJECT.initialize();
    SCROLL.initialize();
    SECTION.initialize();
})();