var mobileMinWidth   = 0,
    mobileMaxWidth   = 767,
    tabletMinWidth   = 768,
    tabletMaxWidth   = 991,
    desktopMinWidth  = 992,
    takeoverMinWidth = 1280,

    /**
     * The default skin size to be served. If sizes aren't defined,
     * this value will be used
     * 
     * @type String
     */
    skinSize = 'small',

    /**
     * Each skin type, their min and max ranges of the window size
     * 
     * @type Object
     */
    advertBreakpoints = {
        'small': {
            min: 0,
            max: 1279
        },
        'large': {
            min: 1280,
            max: 12000
        }
    },

    /**
     * Re-label the width of the window, excluding the width
     * of the scroll bar, purely so the code that uses it
     * is a bit more human-readable
     * 
     * @type Number
     */
    currentWindowSize = window.screen.width,

    /**
     * Retrieve the skin size required based on the window width
     *
     * @return String
     */
    determineSkinSize = function () {

        var i;

        if (!advertBreakpoints) return skinSize;

        for ( i in advertBreakpoints ) {
            if (!advertBreakpoints.hasOwnProperty(i)) continue;
            if (currentWindowSize >= advertBreakpoints[i].min && currentWindowSize <= advertBreakpoints[i].max) {
                return i;
            }
        }

        return skinSize;
    };

var googleAdsense = {
    'adClient' : 'ca-pub-1417235232628100',
    'slots' : {
        'leaderboard': {
            'id' : '4988970767',
            'format' : 'auto',
            'selector': '.commercial.commercial--leaderboard .commercial__content'
        },
        'mpu1' : {
            'id' : '6465703965',
            'format' : 'rectangle',
            'selector': '.commercial.commercial--mpu .commercial__content'
        },
        'skyscraper' : {
            'id' : '6465703965',
            'format' : 'rectangle',
            'selector': '.sticky'
        }
    }
}

jQuery.when(
    
    jQuery.getScript( '//www.googletagservices.com/tag/js/gpt.js' ),
    jQuery.getScript( '//static.assets.futurecdn.net/js/dfp-helper/dfp.min.js' ),

    jQuery.Deferred(function( deferred ) {
        jQuery(deferred.resolve);
    })
    
).done(function(){

    'use strict';

    // Simple logging function as the one named "log" is causing "use strict" errors.
    function consoleLog(message) {
        if (window.console && window.console.log) {
            window.console.log(message);
        }
    }

    /*
     * Amazon direct match
     */

    //create a custom event
    var gtm_loaded_event = document.createEvent('Event');

    //initialise the event
    gtm_loaded_event.initEvent('gtm_loaded', true, true);

    //trigger the event
    document.dispatchEvent(gtm_loaded_event);

    consoleLog('Detecting ABP usage.');
    AdblockPlus.detect("/media/images/abp.gif", function(usesABP) {
        if (usesABP) {
            // Show AdSense ad for Adblock Plus users
            consoleLog('ABP detected.');

            consoleLog('Adsense script fetching.');
            jQuery.getScript('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', function(){
                consoleLog('Adsense script fetched. Injecting.');

                for (var item in googleAdsense.slots) {
                    var container = $('<ins>')
                        .addClass('adsbygoogle')
                        .css('display', 'block')
                        .attr('data-ad-client', googleAdsense.adClient)
                        .attr('data-ad-slot', googleAdsense.slots[item].id)
                        .attr('data-ad-format', googleAdsense.slots[item].format);

                    $(googleAdsense.slots[item].selector).before(container);
                }

                $(".adsbygoogle").each(function(){
                    (adsbygoogle = window.adsbygoogle || []).push({});
                });

                var label = document.createElement('div');
                $(label).text('Advertisement').css({
                    'color': '#999', 
                    'font-size': '10px',
                    'text-align': 'left'
                })

                $(".adsbygoogle").prepend(label);
            });
        }
        else {
            // Show ad served by DFP for other visitors
            consoleLog('No ABP found.');

            $(".adsbygoogle").hide();

            // defaults for dfp calls
            $.fn.dfp.defaults.singleRequest                  = true;
            $.fn.dfp.defaults.unit                           = dfpUnit;

            if (dfpKeywords) {
                $.fn.dfp.defaults.globalTargetting.kw        = dfpKeywords.split(',');
            }
            
            if (articleID) {
                $.fn.dfp.defaults.globalTargetting.articleid = articleID;
            }
        	
            /*FEP*/
            var sanitize_fep = function(text_chunk){
                if(typeof text_chunk == "object"){
                    var clean_chunk = Array();
                    for (var property in text_chunk) {
                        if (text_chunk.hasOwnProperty(property)) {
                            var clean_str = text_chunk[property];
                            clean_str =  clean_str.replace(/[#*()+\-='",<>\{\}\[\]\\\/]/gi, '');
                            clean_chunk.push(clean_str);
                        }
                    }
                    return clean_chunk;
                }else{
                    var strOut = text_chunk.replace(/[#*()+\-='",<>\{\}\[\]\\\/]/gi, '');
                    return strOut;
                }
            };
            var FEP = FEP || {fepPrimaryProduct: Array(), fepSecondaryProducts: Array(), fepCompanies: Array(), fepHawk: Array(), 
                    fepCategory: Array(), kwMunge: Array(), fepArticleName: '', fepPrimaryCompany: '',fepAlgorithm: '',fepNullified: '', ready: false};

            try {
                if(!FEP.ready){
                    if(typeof FEP_object !== "undefined"){
                        console.log('FEP: article tags loading');
                        console.log(FEP_object);
                        FEP.fepPrimaryProduct   = FEP_object[0].adTags.primaryProduct;
                        FEP.fepSecondaryProducts = FEP_object[0].adTags.secondaryProducts;
                        FEP.fepCompanies = FEP_object[0].adTags.companies;
                        FEP.fepCategory = FEP_object[0].adTags.category;
                        FEP.fepArticleName = FEP_object[0].articleName;
                        FEP.fepAlgorithm = FEP_object[0].strategy;
                        FEP.fepNullified = FEP_object[0].nullified;
                        if(FEP_object[0].adTags.primaryCompany !==null && FEP_object[0].adTags.primaryCompany.length>=1){
                            FEP.fepPrimaryCompany = FEP_object[0].adTags.primaryCompany;
                        }else{
                            FEP.fepPrimaryCompany = " "; /*blank space*/
                        }
                        FEP.fepIAB = [];
                        FEP.ready = true;

                        var mergeable = ['fepPrimaryProduct', 'fepSecondaryProducts', 'fepCompanies', 'fepCategory'];
                        mergeable.forEach(function(element){
                            console.log(element);
                            var fepTags = FEP[element];
                            console.log('adding ' + fepTags);
                            if(typeof fepTags == 'object'){ /*Flatten the object into kw*/
                                fepTags = fepTags;
                            }
                            FEP.kwMunge = FEP.kwMunge.concat(fepTags);
                        });
                        /*Remove duplicates*/
                        FEP.kwMunge = FEP.kwMunge.filter(function (item, pos) {return FEP.kwMunge.indexOf(item) == pos});
                    }else{
                        throw "FEPNotReady";
                        /* throw exception, cant create a FEP object */
                    }
                }
                console.log('FEP data to slots ');
                $.fn.dfp.defaults.globalTargetting.fepPrimaryProduct = sanitize_fep(FEP.fepPrimaryProduct);
                $.fn.dfp.defaults.globalTargetting.fepSecondaryProducts = sanitize_fep(FEP.fepSecondaryProducts);
                $.fn.dfp.defaults.globalTargetting.fepCompanies = sanitize_fep(FEP.fepCompanies);
                $.fn.dfp.defaults.globalTargetting.fepCategory = sanitize_fep(FEP.fepCategory);
                $.fn.dfp.defaults.globalTargetting.fepIAB = sanitize_fep(FEP.fepIAB);
                $.fn.dfp.defaults.globalTargetting.fepPrimaryCompany = sanitize_fep(FEP.fepPrimaryCompany);

            }catch (ex){
                console.log('exception loading FEP AdTags ');
            }
            /*End FEP*/

            // First Leaderboard Called
            jQuery('.commercial--leaderboard .commercial__content').dfp({
                settings: [
                    // Mobile
                    {
                        maxWidth: mobileMaxWidth,
                        slotname: 'dfp_rs_mobile_leaderboard_1',
                        cssClass: 'dfp-leaderboard-mobile dfp-center',
                        oop: false,
                        format: 'mobile',
                        sizes: [[320,50],[300,50]],
                        targetting: {
                            placement: 'dfp_rs_mobile_leaderboard_1',
                            pos: 1
                        }
                    },
                    //Tablet
                    {
                        minWidth: tabletMinWidth,
                        maxWidth: tabletMaxWidth,
                        slotname: 'dfp_rs_tablet_leaderboard_1',
                        cssClass: 'dfp-leaderboard-tablet dfp-center',
                        format: 'roadblock',
                        oop: false,
                        sizes: [[728,90],[970,250],[970,90],[970,66]],
                        targetting: {
                            placement: 'dfp_rs_tablet_leaderboard_1',
                            pos: 1
                        }
                    },
                    //Desktop
                    {
                        minWidth: desktopMinWidth,
                        slotname: 'dfp_rs_desktop_leaderboard_1',
                        format: 'roadblock',
                        cssClass: 'dfp-leaderboard dfp-center',
                        oop: false,
                        sizes: [[728,90],[970,250],[970,90],[970,66]],
                        targetting: {
                            placement: 'dfp_rs_desktop_leaderboard_1',
                            pos: 1
                        }
                    }
                ]
            });

            // First MPU called - desktops
            jQuery('.commercial--mpu .commercial__content').dfp({
                settings: {
                    minWidth: desktopMinWidth,
                    slotname: 'dfp_rs_desktop_mpu_1',
                    format: 'roadblock',
                    oop: false,
                    sizes: [[300,251], [300,250], [300,601], [300,600]],
                    targetting: {
                        placement: 'dfp_rs_desktop_mpu_1',
                        pos: 1
                    }
                }
            });

            // First MPU called for tablets
            jQuery('.lead-commercial--mpu-mobile .commercial__content').dfp({
                settings: [
                    //Tablet
                    {
                        minWidth: tabletMinWidth,
                        maxWidth: tabletMaxWidth,
                        slotname: 'dfp_rs_tablet_mpu_1',
                        format: 'roadblock',
                        oop: false,
                        sizes: [[300,251], [300,250], [300,601], [300,600]],
                        targetting: {
                            placement: 'dfp_rs_tablet_mpu_1',
                            pos: 1
                        }
                    }
                ]
            });


            // First MPU called for mobiles
            var chooseSensiblePlaceForMobileAd = function (container, adSettings) {
                var mobileAdContainer = jQuery(container);
                var articleSections = null;
                var articleParagraphs = null;
                var removeParagraphs = 0;

                var calcNth = function (count) {
                    var nth = Math.floor(count / 2);
                    return nth;
                }

                adSettings.settings.addType = 'before';

                // first search for horizontal rules or headers as section markers
                articleSections = mobileAdContainer.children('hr');
                if (articleSections.length > 0) {
                    // when article is rewritten from somewhere, hr is not section delimiter
                    if (articleSections.length === 1) {
                        if (mobileAdContainer.children().eq(-2).prop('tagName') !== 'HR' && mobileAdContainer.children().eq(-2).prop('tagName') !== 'P') {
                            articleSections.eq(0).dfp(adSettings);
                            return;
                        } else {
                            removeParagraphs = 1;
                        }
                    // place it before section mark
                    } else {
                        articleSections.eq(calcNth(articleSections.length)).dfp(adSettings);
                        return;
                    }
                }

                // okay, maybe headers will be nicer
                articleSections = mobileAdContainer.children('h2');
                if (articleSections.length > 0) {
                    articleSections.eq(calcNth(articleSections.length)).dfp(adSettings);
                    return;
                }

                // fallback, try to place it somewhere between paragraphs
                adSettings.settings.addType = 'after';
                articleParagraphs = mobileAdContainer.children('p');

                // check if that paragraph is not followed by quote or it is a weird kind of content
                var theNum = calcNth(articleParagraphs.length - removeParagraphs);
                if (theNum > 0) {
                    // eq() counts from zero
                    theNum = theNum - 1;
                    var nextSibling = articleParagraphs.eq(theNum).next();
                    if (nextSibling.prop('tagName') === 'BLOCKQUOTE') {
                        if (theNum > 0) {
                            adSettings.settings.addType = 'before';
                        // add ad after quote
                        } else {
                            nextSibling.dfp(adSettings);
                            return;
                        }
                    }
                    // sometimes paragraph is just subsection title...
                    else {
                        var parContent = articleParagraphs.eq(theNum).children();
                        if (parContent.length === 1) {
                            var onlyChildTag = parContent.eq(0).prop('tagName');
                            if (onlyChildTag === 'STRONG') {
                                theNum--;
                            }
                        }
                    }
                }
                articleParagraphs.eq(theNum).dfp(adSettings);
            };

            var mobileMpuSettings = {
                settings: {
                    maxWidth: mobileMaxWidth,
                    slotname: 'dfp_rs_mobile_mpu_1',
                    oop: false,
                    format: 'mobile',
                    sizes: [[320, 251], [300, 250]],
                    targetting: {
                        placement: 'dfp_rs_mobile_mpu_1',
                        pos: 1
                    }
                }
            };

            if ($(window).width() <= mobileMaxWidth && articleID !== '') {
                chooseSensiblePlaceForMobileAd('article div.single-article__content', mobileMpuSettings);
            }

            // Second MPU called - desktops
            jQuery('.commercial--skyscraper .commercial__content').dfp({
                settings: {
                    minWidth: desktopMinWidth,
                    slotname: 'dfp_rs_desktop_mpu_2',
                    oop: false,
                    sizes: [[300,252], [300,250], [300,602], [300,600]],
                    targetting: {
                        placement: 'dfp_rs_desktop_mpu_2',
                        pos: 2
                    }
                }
            });

            // Second MPU called - non-desktops
            jQuery('.commercial--mpu-mobile .commercial__content').dfp({
                settings: [
                    // Mobile
                    {
                        maxWidth: mobileMaxWidth,
                        slotname: 'dfp_rs_mobile_mpu_2',
                        oop: false,
                        format: 'mobile',
                        sizes: [[320,252],[300,250]],
                        targetting: {
                            placement: 'dfp_rs_mobile_mpu_2',
                            pos: 2
                        }
                    },
                    //Tablet
                    {
                        minWidth: tabletMinWidth,
                        maxWidth: tabletMaxWidth,
                        slotname: 'dfp_rs_tablet_mpu_2',
                        oop: false,
                        sizes: [[300,252], [300,250], [300,602], [300,600]],
                        targetting: {
                            placement: 'dfp_rs_tablet_mpu_2',
                            pos: 2
                        }
                    }
                ]
            });

            // First Overlay Called (in the background)
            jQuery('.future-company-footer').dfp({
                settings: [
                    // Mobile
                    {
                        maxWidth: mobileMaxWidth,
                        slotname: 'dfp_rs_mobile_overlay_oop_1',
                        oop: true,
                        format: 'mobile',
                        addType: 'after',
                        targetting: {
                            placement: 'dfp_rs_mobile_overlay_oop_1',
                            pos: 1,
                            oop: 'overlay'
                        }
                    },
                    //Tablet
                    {
                        minWidth: tabletMinWidth,
                        maxWidth: tabletMaxWidth,
                        slotname: 'dfp_rs_tablet_overlay_oop_1',
                        oop: true,
                        addType: 'after',
                        targetting: {
                            placement: 'dfp_rs_tablet_overlay_oop_1',
                            pos: 1,
                            oop: 'overlay'
                        }
                    },
                    //Desktop
                    {
                        minWidth: desktopMinWidth,
                        slotname: 'dfp_rs_desktop_overlay_oop_1',
                        oop: true,
                        addType: 'after',
                        targetting: {
                            placement: 'dfp_rs_desktop_overlay_oop_1',
                            pos: 2,
                            oop: 'overlay'
                        }
                    }
                ]
            });

        	// First Skin Called (in the background)
            jQuery('.future-company-footer').dfp({
                settings: {
                    minWidth: takeoverMinWidth,
                    slotname: 'dfp_rs_desktop_skin_oop_1',
                    format: 'roadblock',
                    oop: true,
                    addType: 'after',
                    targetting: {
                        placement: 'dfp_rs_desktop_skin_oop_1',
                        pos: 1,
                        oop: 'skin',
                        screen: determineSkinSize()
                    }
                }
            });
        }

    });

});
