// container for HTML elements
var NODE = {};





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
    var current_lang = document.documentElement.getAttribute('lang');

    // if a new language was selected
    if (lang != current_lang) {

        // set target button as current, and all others as not
        setLanguageBtnActive(target);

        // set value of global lang attribute
        document.documentElement.setAttribute('lang', lang);
        
        closeLangMenu();
        updateTitleAttributes();
        updateSectionPositions();
    }
}

// update currently selected language button
setLanguageBtnActive( document.documentElement.getAttribute('lang') );

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
if (document.documentElement.getAttribute('lang') != 'en') {
    updateTitleAttributes();
}

function updateTitleAttributes() {
    
    var lang_code = document.documentElement.getAttribute('lang');
    
    for (var i = NODE.lang_title_elems.length; i--;) {
        var elem = NODE.lang_title_elems[i];
        elem.title = elem.getAttribute('title-' + lang_code);
    }
    
}





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