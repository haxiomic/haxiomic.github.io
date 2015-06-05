
 /** CJS **/ var pm_pgtp; 
(function(){ 
	
	function pm_getElementsByClassNameForIE(classname){
		var a = [];
	    var re = new RegExp('(^|\s*)'+classname+'(\s*|$)');
	    var els = document.getElementsByTagName("DIV");
	    for(var i = 0, j = els.length; i < j; i++)
	        if(re.test(els[i].className)) a.push(els[i]);
	    return a;
	};

	function pm_getDateValueFromDOM() {
		var divElement;
		if(!document.getElementsByClassName){
			divElement = pm_getElementsByClassNameForIE("meta meta--post");
		} else {
			divElement = document.getElementsByClassName("meta meta--post");			
		}
		var divElementChildren;
        if(divElement){
        	for(var j = 0; j < divElement.length; j++){
        		timeTagElements = divElement[j].getElementsByTagName("time");
        		if (timeTagElements){
        			return timeTagElements[0].getAttribute("datetime").replace(/^\s+|\s+$/g, '');
        		}
        	}	
        }
        return null;
    };

	// Returns boolean; is the user coming from a search page?
	var pm_isSearch = function pm_isSearch() {
		var r = document.referrer;
		return ((r.match(/google\..*/)        != null)
               || (r.match(/google\..*\/url/) != null)
               || (r.match(/googlelabs\..*/)  != null)
               || (r.match(/yahoo\.com/)      != null)
               || (r.match(/msn\.com/)        != null)
               || (r.match(/bing\.com/)       != null)
               || (r.match(/aol\..*\.com/)    != null)
               || (r.match(/ask\.com/)        != null))
           ? true
           : false;
    };

	// object of publication date
	// get the publication date
	var publication_date = pm_getDateValueFromDOM();
	var temp_date;
    var a;
    var temp_time;
    var publication_dt_obj;
	if (publication_date != null && publication_date != undefined) {
		publication_date = publication_date.split('T');
		temp_date = publication_date[0] != undefined ? publication_date[0].split('-') : "";
		a = publication_date[1] != undefined ? publication_date[1].split('T') : "";
		temp_time = a[0] != undefined ? a[0].split(':') : "";
		publication_date = temp_date.length >= 3 ? new Date(temp_date[0], (temp_date[1] - 1), temp_date[2], temp_time[0], temp_time[1]) : "";
		publication_dt_obj = new Date(publication_date);

		publication_dt_obj = new Date(Date.UTC(
								publication_dt_obj.getFullYear(),
								publication_dt_obj.getMonth(),
								publication_dt_obj.getDate(),
								publication_dt_obj.getHours(),
								publication_dt_obj.getMinutes()
								));
		}							
								
	// Returns Boolean; is this article's publication date older than 90 days (included) from today's date?
	var pm_isOlderThan90Days = function pm_isOlderThan90Days() {
		// get the date before 90 days
		var current_date = new Date();
		var current_date = new Date(Date.UTC(
								current_date.getFullYear(),
								current_date.getMonth(),
								current_date.getDate(),
								current_date.getHours(),
								current_date.getMinutes()
								));
		current_date.setMonth(current_date.getMonth());
		current_date.setDate(current_date.getDate() - 90 );
		
		// compare the dates
		return (publication_dt_obj != undefined && publication_dt_obj.valueOf() < current_date.valueOf())
		? true
		: false;
	};

	if ((pm_isOlderThan90Days() === true) && (pm_isSearch() === true)) {
		// Perfect Market to load a template for 90 days and older, and for search users
		pm_pgtp = '90days_search';
	}    
})();

 /** CJS end **/ 


var _pmep = '//widget.perfectmarket.com/';
var _pmep_geo = '//geo.perfectmarket.com/';
if (document.URL.indexOf('https://') > -1) {
    _pmep = _pmep.replace(/88\//gi, '90/');
    _pmep_geo = _pmep_geo.replace(/88\//gi, '90/');
}
var _pmpmk = 'gizmodouk/pmk-1.7.js';
var _pmasync = false;
var _pmoptimization = true;
var _pmsb = false;
function _pmloadfile(fileName) {
document.writeln('<script src='+fileName+'></script>');}

var bbVer = getBBVersion();
if (bbVer == null || parseInt(bbVer) > 5) {
var pm_ppy="gizmodouk";var pm_geo="GB";
var pmk,pmglb,pmfa,pmad,pmdebug_c;pmglb=pmglb||null;pmfa=pmfa||null;pmad=pmad||null;pmdebug_c=pmdebug_c||null;pmk=pmk||null;
var _pmenv = getUrlParameter('pmenv');
if(_pmenv && _pmenv == 'sandbox' && !_pmsb) {_pmep=_pmep.replace('//widget.perfectmarket.com', '//widget.sandbox.perfectmarket.com');_pmep_geo=_pmep_geo.replace('//geo.perfectmarket.com', '//geo.sandbox.perfectmarket.com');var d = new Date();var rand = d.getTime();_pmpmk=pm_ppy+"/load.js?"+rand;}

(function(){
  var sc='script',doc=document;
  _pmloadfile(_pmep+_pmpmk);
})();

function pmws_request_done(){
  var sc="script",doc=document;
  if (doc.all && !window.opera){doc.write('<'+sc+' type="text/javascript" id="pm_contentloadtag" defer="defer" src="javascript:void(0)"><\/'+sc+'>');var pm_contentloadtag = doc.getElementById("pm_contentloadtag");if(pm_contentloadtag)pm_contentloadtag.onreadystatechange = function() { if (this.readyState=="complete") return; } }
  _pmloadfile(_pmep+_pmpmk);
}
}
function getBBVersion() {
    var ua = navigator.userAgent,ver=null,vp,splitUA;
    if (ua.indexOf("BlackBerry") >= 0) {if (ua.indexOf("Version/") >= 0) {vp = ua.indexOf("Version/") + 8;ver = ua.substring(vp, vp + 3);}else {splitUA = ua.split("/"); ver = splitUA[1].substring(0, 3);}}
    return ver;
}
function getUrlParameter(name) {var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);return match && decodeURIComponent(match[1].replace(/\+/g, ' '));}


