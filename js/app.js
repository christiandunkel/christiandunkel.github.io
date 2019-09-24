"use strict";

var _ = {
    
    
    scrollToTop : function () {
        
        console.log(this);
        
        // if smooth scrolling is natively supported, use it
        // otherwise, manually automate it
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
            return;
        }



        // get scrolling position
        var y = window.scrollY || window.pageYOffset;

        // cancel if user has scrolled with mouse in between timeouts
        if (this.last_scroll != null && 
            this.last_scroll < y) {
            this.last_scroll = null;
            return;
        }

        // directly skip to top, if values are too small
        if (y < 10) {
            window.scrollTo(0, 0);
            this.last_scroll = null;
            return;
        }

        this.last_scroll = y;

        // otherwise scroll with new increment
        y /= 1.3;
        window.scrollTo(0, y);

        // check if to request another scroll
        if (y > 0) {
            this.scrollToTopTimeout = setTimeout(_.scrollToTop, 15);
        }
        else {
            clearTimeout(this.scrollToTopTimeout);
        }
    }
    
}





var lang_btn = document.getElementById('language-btn');
var lang_menu = document.getElementById('language-menu');
var close_lang_btn = lang_menu.getElementsByClassName('cross')[0];
lang_btn.addEventListener('click', function () {
    lang_menu.classList.toggle('hidden');
});
close_lang_btn.addEventListener('click', function () {
    lang_menu.classList.add('hidden');
});

var nav_btn = document.getElementById('hamburger-btn');
var nav_hidden_menu = document.getElementById('nav').getElementsByClassName('hidden-window')[0];
nav_btn.addEventListener('click', function () {
    nav_btn.classList.toggle('nav-visible');
    nav_hidden_menu.classList.toggle('hidden');
});

var to_top_btn = document.getElementById('to-top');
to_top_btn.addEventListener('click', _.scrollToTop);


// show bauhaus container when scrolling down
var bauhaus = document.getElementById('bauhaus');
var has_scrolled = false;
window.onscroll = function () {
    has_scrolled = true;
};
var check_scroll = setInterval(checkScroll, 50);
function checkScroll(e) {
    if (window.has_scrolled) {
        window.has_scrolled = false;

        var viewport_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var distance_to_top = bauhaus.getBoundingClientRect().top;
        var px_until_appearance = distance_to_top - viewport_height + 350;

        if (px_until_appearance < 0) {
            bauhaus.classList.remove('hidden');

            clearInterval(check_scroll);
            window.onscroll = undefined;
        }
    }
}