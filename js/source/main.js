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