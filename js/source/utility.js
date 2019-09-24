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