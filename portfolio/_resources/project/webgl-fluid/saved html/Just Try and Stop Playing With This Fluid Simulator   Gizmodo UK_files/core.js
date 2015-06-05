var pageReloads = 0;
var maxReloads = 1;
function mobilePaginate(page) {
	var pArray = page.split('/');
	//console.log(pArray);
	var pageNumber = pArray[pArray.length-1];
	if (pageReloads > maxReloads) {
		//alert (pageNumber);
		page = page.replace('mobile/', '');
		window.location=page;
	} else {

		jQuery.ajax({
		    type: 'GET',
		    url: page,
		    data: { },
		    cache: false,
		    dataType: 'html',
		    success: function (result) {
		    	jQuery("#mobilepagination").remove();
		    	jQuery("#desktoppagination").remove();
		    	jQuery("#maincontentlist").append('<div id="mobilepage'+pageNumber+'">'+result+'</div>');
		    	processDates();
		    	processAds(pageNumber);
		    	jQuery('#mobilepage'+pageNumber+' figure.responsive').picture({ insertElement: '.responsive__image' });
		    	//jQuery("#maincontentlist").append(jQuery("#mobilepagination"));
				pageReloads++;
		    }
	  	});
	}

}

var totalShares = 0;
function gawkerSocialLoad() {
	function nFormatter(num) {
		    if (num >= 1000000000) { return (num / 1000000000).toFixed(1) + 'G'}
		    if (num >= 1000000) { return (num / 1000000).toFixed(1) + 'M'}
		    if (num >= 1000) { return (num / 1000).toFixed(1) + 'K'}
		    return num;
	}		

	
	
	if (document.getElementById('socialbuttons')) {

		

		jQuery.ajax({
		  url: "http://graph.facebook.com/?id=" + theurl,
		  timeout:  1000,
		  context: document.body
		}).done(function(data) {
		 	if(data.shares !== undefined) {
		 		totalShares = totalShares+data.shares;
		 		
		 		jQuery('.facebook_counter').text(nFormatter(data.shares));
		 		
		 		jQuery('.total_social').text(nFormatter(totalShares));

			}
		});

		jQuery.ajax({
		  url: "http://urls.api.twitter.com/1/urls/count.json?url=" + theurl,
		  dataType: 'jsonp',
		  timeout:  1000,
		  context: document.body
		}).done(function(data) {
		 	if(data.count !== undefined) {
		 		
		 		totalShares = totalShares+data.count;
			
				jQuery('.twitter_counter').text(nFormatter(data.count));
		
				jQuery('.total_social').text(nFormatter(totalShares));
			}

		});

		


	}

}


function processDates() {


	var prettyDateFormat = jQuery.format;

    jQuery(document).ready(function() {

    
    	jQuery( "time" ).each( function( ) {
    		obj = jQuery(this);
      
    		date = new Date(obj.attr('datetime'));
          
			var format = obj.attr('format') ? obj.attr('format') : 'dd MMMM yyyy - h:mma';

			if (format == 'pretty') {
 				obj.html(prettyDateFormat.prettyDate(date)+'');
			} else {
           		obj.html(prettyDateFormat.date(date, format));
			}

    	});

    });

}

function processAds(page) {
	// On each page, we need to kick off the ad loading to ensure that ads are properly trafficked on sub-pages
	jQuery('#mobilepage'+page+' .commercial--mpu-mobile').dfp({
        unit: dfpUnit,
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
                    pos: page
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
                    pos: page
                }
            }
        ]
    });
}

/*
 * This function looking for appended twitter posts.
 * When twitter posts exists then append script to page.
 * Function calls when document is ready.
 */
function findAndSetupTwitterPosts() {
    if(jQuery('blockquote.twitter-tweet').length > 0) {
        var $script = jQuery('<script async src="//platform.twitter.com/widgets.js" charset="utf-8">');

        jQuery('.single-article__content').append($script);
    }
}

jQuery(document).ready(function() {
	processDates();
	gawkerSocialLoad();
	findAndSetupTwitterPosts();
});