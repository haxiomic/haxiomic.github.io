    /**
     * Hook into the skin's init_background_skin callback.
     * Skins are pushed down beyond the height of the masthead.
     * Fixed skins will scroll up until the masthead is out of view, and then stay fixed.
     */
    window.init_background_skin = function(bgSkinUrl, bgColorHex, clickThroughUrl, bgScrollable) 
    {
        bgColorHex || (bgColorHex = "none"), bgScrollable || (bgScrollable = "scroll");

        var bgSkin       = $(document.body),
            initialBgPos = $('.site-container__header').outerHeight(true);

        if (bgSkinUrl) {

            bgSkin
                .addClass("has-takeover")
                .css("background-color",      bgColorHex)
                .css("background-image",      "url(" + bgSkinUrl + ")")
                .css("background-repeat",     "no-repeat")
                .css("background-attachment", "scroll")
                .css("background-position",   "50% " + initialBgPos + "px")
                ;

            if (bgScrollable == "fixed") {
                $(window).scroll(function(){
                    if (window.scrollY >= initialBgPos){
                        bgSkin.css("background-attachment", "fixed");
                        bgSkin.css("background-position",   "50% 0"); 
                    } else {
                        bgSkin.css("background-attachment", "scroll");
                        bgSkin.css("background-position",   "50% " + initialBgPos + "px");
                    }
                });
            }
        }

        if (clickThroughUrl) {

            bgSkin.mouseover(function(e)
            {
                if (e.target.tagName == 'BODY') {
                    bgSkin.css("cursor", "pointer");
                } else {
                    bgSkin.css("cursor", "default");
                }   
            });
            
            bgSkin.click(function(e)
            {
                if (e.target.tagName == 'BODY') {
                    window.open(clickThroughUrl, "_blank");
                }
            });
        }
    }