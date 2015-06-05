(function(){
    window.gravityInsightsParams = {
      'type': 'content',
      'action': '',
      'site_guid': '015756f28e553328b5d358aa09764558'
    };
    var adServerReq,bUrl,doUseGravityUserGuid,includeJs,jq,type,ug,wlPrefix,wlUrl,_ref,_ref1,_ref2;bUrl="";ug=(doUseGravityUserGuid=!0===gravityInsightsParams.useGravityUserGuid?1:0)?"":gravityInsightsParams.user_guid||(null!=(_ref=/grvinsights=([^;]+)/.exec(document.cookie))?_ref[1]:void 0)||"";
    wlUrl=(wlPrefix="http://rma-api.gravity.com/v1/api/intelligence",jq=(null!=(_ref1=window.jQuery)?null!=(_ref2=_ref1.fn)?_ref2.jquery:void 0:void 0)||"",type="iframe",adServerReq=gravityInsightsParams.ad||"",""+wlPrefix+"/wl?jq="+jq+"&sg="+gravityInsightsParams.site_guid+"&ug="+ug+"&ugug="+doUseGravityUserGuid+"&pl=14&id=grv-personalization-14"+("&type="+type+"&ad="+adServerReq+"&x="+(new Date).getTime())+("undefined"!==typeof forceArticleIds&&null!==forceArticleIds&&forceArticleIds.join?"&ai="+forceArticleIds.join(","):
    "")+("undefined"!==typeof apids&&null!==apids&&""!==apids?"&apids="+encodeURIComponent(apids):""));includeJs=function(a){var b;b=document.createElement("script");b.async=!0;b.src=a;a=document.getElementsByTagName("script")[0];return a.parentNode.insertBefore(b,a)};bUrl&&includeJs(bUrl);wlUrl&&(window.gravityInsightsParams.sidebar&&(window.gravityInsightsParams.wlStartTime=(new Date).getTime()),includeJs(wlUrl));})();