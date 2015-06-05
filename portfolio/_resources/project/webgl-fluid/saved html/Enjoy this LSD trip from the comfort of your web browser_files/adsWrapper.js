var adsLo;
try {adsLo=top.location.href}
catch (e){}
if (!adsLo||adsLo==null){
try {adsLo=window.location.href}
catch (e){}
}
adsLo=adsLo||""
var adsUAC=adsLo.search(/atwUAC=/i),adsUACD=adsLo.search(/atwUACD=/i),adsDebug=adsLo.search(/adcallqa/i),adsUACH,adsIntMN='',adsGUID=1,adsSecure=(location.protocol=='https:')?1:0;
function adsLoadUAC(){
var u,x;
if (adsDebug>0){
 u='adsWrapperInfo.js';
 adsUACH='http://browsertest.web.aol.com/ads/';
}
else {
 if (adsUAC>0)x=adsLo.substring(adsUAC+7,adsLo.length).replace(/&.*$/,'').split(/\||;/)
 else if (adsUACD>0)x=adsLo.substring(adsUACD+8,adsLo.length).replace(/&.*$/,'').split(/\||;/);
 if (x[1]&&x[1]=='c')adsUACH='http://cdn.atwola.com/_media/uac/'
 else if (x[1]&&x[1]=='s')adsUACH='https://s.aolcdn.com/ads/'
 else adsUACH='http://browsertest.web.aol.com/ads/';
 u=x[0];
 if (/^[0-9A-Za-z\/.]+$/.test(unescape(u))){
   if (adsUACD>0){
	var z=document.createElement('script');
	z.src=adsUACH+u;
	document.body.appendChild(z);
   } 
   else if (adsUAC>0){
	document.write('<script type="text/javascript" src="'+adsUACH+u+'"></scr','ipt>')
   }
 }
}
}
if ((adsUAC>0||adsDebug>0||adsUACD>0)&&!window.adsUACH)adsLoadUAC()
else if (window.adsIn!=1){
adsIn=1
var adsHt="",adsNt='5113.1',adsPl='221794',adsESN='',adsATWM='',adsTp='J',
adsATOth='',adsATMob='',adsSrAT='',adsTacOK=1,adsHashOK=1,adsD=new Date(),aolAdFdBkStr='',adsAddOn=1,adsAJAXAddOn=0,adsMob=0,adsCo='us',
adsVal='',adsCp=0,adsMNS,adsTPS,adsExcV='',adsLNm=0,adsKV,adsIP,adsSz,adsNt2,adsPing,adsFileless=0,
adsUA=navigator.userAgent.toLowerCase(),adsIE,adsAJAX=0,adsTzAT="aduho="+(-1*adsD.getTimezoneOffset())+";",
adsNMSG='',adsTile=1,adsPage='',adsDivs=[],adsQuigo=0,adsCA,adsCF=[],adsCW=[],adsCH=[],adsCAd=[],adsChn='',adsMOE='',adsOverS='',adsOverF='1',
adsScr=(window.s_265&&window.s_265.prop55)?window.s_265.prop55:adsD.getTime()%0x3b9aca00,adsRRDevil='',adsRRCalled='',
adsDev=(typeof window.onorientationchange!='undefined')?'1':'2',atwAd1Time='',atwLoaded=0,atwReset=0,adsOverlay,adsCloseTime='8000';
if ((adsUA.indexOf('mobile')>-1)||(/android|iphone|ipad|playbook|hp-tablet|kindle|silk|webos|blackberry|opera mini/i).test(navigator.appVersion))adsDev='1';
if (!adsDev)adsDev='2';
if (!window.ATW3_AdObj){
try {
if (parent.window.ATW3_AdObj){
var ATW3_AdObj=parent.window.ATW3_AdObj;
adsScr=ATW3_AdObj.scr;
}else{
var ATW3_AdObj=new Object();
ATW3_AdObj.scr=adsScr;
ATW3_AdObj.tile=0;
parent.window.ATW3_AdObj=ATW3_AdObj; 
}}
catch (e){
var ATW3_AdObj=new Object();
ATW3_AdObj.scr=adsScr;
ATW3_AdObj.tile=0;
}}
else{
adsScr=ATW3_AdObj.scr;
}
function adsOverlayAd(m,sz,dv,f,c,del){
var sp,dyn,w,h,d=adsGetObj(dv),x=document.createElement('iframe'),s;
if (f)adsOverF=f
else f=adsOverF;
if (del)adsOverDelay=del;
if (adsOverlay)m=adsOverlay;
if (c){adsCloseTime=parseInt(c)*1000;}
if (sz.indexOf(',')>0){
	sp=sz.split(',')[0].split('x');
	dyn=1;
}
else {
	sp=sz.split('x');
	dyn=0;
}
w=sp[0];
h=sp[1];
if (sz.toLowerCase()=='mm'){w='300';h='250';sz='300x250,320x480,300x600';dyn=1}
try {
	var l=localStorage.getItem('adsOverlay'),now=new Date();
	if (parseInt(l)>now.getTime()&&f!='0'){
		adsMOE='kvmoe=n;';
		return 0;
	}
	else {
		adsMOE='kvmoe=y;';
	}
}
catch (e){}
d.style.cssText='position:fixed;top:0px;left:0px;width:100%;height:100%;z-index:7000000;display:none; overflow-y:scroll;-webkit-overflow-scrolling:touch;';
d.id='adsDisplayBox';
x.width='100%';
x.height='100%';
x.id='adsOverI';
x.style.overflowY='scroll';
d.appendChild(x);
s='<html><head><script type="text/javascript" src="http';
if (adsSecure)s+='s://s'
else s+='://o';
s+='.aolcdn.com/ads/adsWrapper.js"></script>';
s+='<style>body,html {margin:0;width:100%;height:100%;display:table;}\n';
s+='.adsOverLightBox {background-color:rgba(0,0,0,0.7);width:100%;height:100%;text-align:center;vertical-align:middle;display:table-cell;-webkit-transform:translateZ(0);}\n';
s+='.adsOverClose {position:absolute;right:8px;top:8px;}\n';
s+='.adsOverlayDiv {background-color:white;width:'+w+'px;height:'+h+'px;margin:auto;}</style></head><body>\n';
s+='<div class="adsOverLightBox"><a href="#" onclick="return parent.adsOverCloseFn(\'1\')" class="adsOverClose"><img src="http';
if (adsSecure)s+='s://s'
else s+='://o';
s+='.aolcdn.com/ads/closeButton.png" width=50 height=50></a>\n';
s+='<div class="adsOverlayDiv" id="adsOverlayDiv"></div>\n';
s+="<script type='text/javascript'>adsDisableTacoda('1');adsPage=parent.adsPage;adsMOE='kvmoe=y;';adsOverF='"+f+"';";
if (dyn==1)s+="htmlAdWHDyn('"+m+"','"+sz+"','f','adsOverlayDiv')";
else s+="htmlAdWH('"+m+"','"+w+"','"+h+"','f','adsOverlayDiv')";
s+='</script></div></body></html>'
adsOverS=s;
}
function adsOverlayAdCall(s){
var i=document.getElementById('adsOverI');
i=(i.contentWindow)?i.contentWindow:(i.contentDocument.document)?i.contentDocument.document:i.contentDocument;
i.document.open();
i.document.write(s);
i.document.close();
}
var adsCloseTVar=0;
function adsOverlayCloseOff(){
  adsCloseTVar=1;
}
function adsOverCloseFn(v){
if (v||adsCloseTVar!=1){
	var d=document.getElementById('adsDisplayBox');
	d.style.display='none';
	return false;
}
}
function adsDisableGUID(){adsGUID=0}
function adsGUIDFn(e){
if (e.origin==='http://cdn.at.atwola.com'||e.origin==='https://cdn.at.atwola.com'){
 var x=e.data.split('=');
 try {if (x.length==2&&x[0]=='guid')localStorage.setItem('adsGUID', x[1]);}
 catch(e){}
}
}
if (window.addEventListener)window.addEventListener("message",adsGUIDFn,false);
function adSet101x1(v){
if (v)adsIntMN=v;
}
function adSetMOAT(v,r){
if (v&&v!='0'){
window.moatConfig=r||{};
var d=document,s=d.createElement("script"),h=d.getElementsByTagName("head")[0],sr;
if (String(window.moatConfig.moatHosted)==='true'){
 if (adsSecure)sr='https://z'
 else sr='http://s'
 sr+='.moatads.com/aolalways5fd2/moatuac.js';
}
else{
 if (adsSecure)sr='https://s'
 else sr='http://o'
 sr+='.aolcdn.com/os/moat/prod/moatuac.js';
}
s.src=sr;
h.appendChild(s); 
} 
}
var adsLoadSync=0,adsSyncTime='',adsSyncDelay=0,adsMSP=1,adsMobDyn=1,adsAddOnMQ='',adsRePo='0';
function adsDisableMSP(){adsMSP=0}
function adsResizeImage(v){}
function adsResizePortrait(v){adsRePo=v}
function adsDisableMobDyn(){adsMobDyn=0}
function adSetAddOnPl(v){
if (v)adsAddOnMQ=v;
}
function adSetSyncDelay(v){
 if (v)adsSyncDelay=parseInt(v)
 else adsSyncDelay=200;
} 
function adsLoadedSync(){
 var z=adsDivs.length,v;
 for (var i=0;i<z;i++){
  v=adsGetObj(adsDivs[i]);
  if (v.textAd!=1&&v.iframe!=1&&v.delayed)v.LoadAd();
 }
 adsLoadSync=1;
}
function adsHashFn(e){
if (e.origin==='http://asvcs.aol.com'||e.origin==='https://asvcs.aol.com'){
 var x=e.data.split('='),d1=new Date();
 d1.setTime(d1.getTime()+(x * 86400)) 
 d1.setHours(0);
 d1.setMinutes(0);
 d1.setSeconds(0);
 try {
  document.cookie="atwHash="+x+"; expires="+d1.toGMTString()+"; path=/;";
 }
 catch (e){}
}
}
function adsTacFn(){
var n=2,d=document,r=d.referrer,q=0,i,i1='',j,p='';
atwLoaded=1;
var t1='//cdn.atwola.com/_media/uac/tcodewads_at.html',t2='//cdn.at.atwola.com/_media/uac/tcode3.html';
if (adsGUID){
	i=d.createElement('iframe');
	i.style.display="none";
	i.id="localStorage";
	i.style.width='0px';
	i.style.height='0px';
	i.src='//cdn.at.atwola.com/_media/uac/guid.html';
	d.body.appendChild(i);
}
if (adsTacOK==2)n=1
if (adsTacOK){
	try {
		if (top.location.href!=location.href){
			if (parent.window.adsIn==1)q=1
		}
	}
	catch (e){}
	if (q!=1){
		for (j=0;j<n;j++){
			i=d.createElement('iframe')
			i.style.display="none"
			i.id="adTacFr"+j
			i.style.width='0px'
			i.style.height='0px'
			if (j==0&&(adsESN||adsUA.indexOf("aol")!=-1)&&!adsSecure){
				i1=t1
				if (adsESN)i1+="#"+adsESN
			}
			if (j==1){
				var x='';
				if (adsHashOK==0)p+='&hashOK=0&';
				if (window.tacProp){
					for (var t in tacProp){x+="&"+t+"="+tacProp[t]}
				}
				p+=x
				if ((typeof(r)!='undefined')&&(r!='')){
					if (r.indexOf('mapquest')!=-1)r=r.replace(/[?#].*$/,'')
					p+="&tacref="+r;
				}
				i1=(p)?t2+"#"+p:t2
			}
			if (i1){
				i.src=i1
				d.body.appendChild(i)
			}
		}
	}
}
}
function adsDisableHash(v){
if (v)adsHashOK=0;
}
function adsDisableTacoda(v){
if (v&&v.indexOf('aolws')!=-1)adsTacOK=2
else adsTacOK=0
}
function adUACInit(){
var w=window;
if (w.addEventListener)w.addEventListener("load",adsTacFn,false)
else if (w.attachEvent)w.attachEvent("onload",adsTacFn)
try {
if (/(^|;)?RSP_COOKIE=.*?&name=(.*?)(&|;|$)/i.test(document.cookie))adsESN='&ESN='+unescape(RegExp.$2);
}
catch (e){}
var at=adsLo.search(/atwcrpr=/i);
adsIE=(navigator.appName=="Microsoft Internet Explorer");
if (adsLo.search(/atwdistcode/i)>0)adsDisableTacoda()
if (at>0){
adsCA=adsLo.substr(at+8).split(/\||;/);
adsCp=1;
var z=adsCA.length;
for (var i=0,k=0;i<z;i=i+4,k++){adsCF[k]=adsCA[i];adsCW[k]=adsCA[i+1];adsCH[k]=adsCA[i+2];adsCAd[k]=adsCA[i+3]}
}
adsMNS=(/(\?|&)atw[Mm][Nn]=(.*?)(&|$)/.test(adsLo))?(RegExp.$2).split(/\||;/):'';
if (!(/^[0-9A-Za-z,-]+$/.test(unescape(adsMNS))))adsMNS='';
adsPing=(/(\?|&)atw[Pp]ing=(.*?)(&|$)/.test(adsLo))?(RegExp.$2):'';
if (!(/^[0-9]+$/.test(unescape(adsPing))))adsPing='';
adsTPS=(/(\?|&)atw[Tt]p=(.*?)(&|$)/.test(adsLo))?(RegExp.$2).split(/\||;/):'';
if (!(/^[0-9A-Za-z,-]+$/.test(unescape(adsTPS))))adsTPS='';
adsKV=(/(\?|&)atw[Kk][Vv]=(.*?)(&|$)/.test(adsLo))?escape(RegExp.$2):'';
if (!(/^[0-9A-Za-z,;=]+$/.test(unescape(adsKV))))adsKV='';
if (adsKV&&adsKV[adsKV.length-1]!=';')adsKV+=';'
if (adsKV)adsATOth+=adsKV;
adsExcV=(/(\?|&)atw[Ee]xc=(.*?)(&|$)/.test(adsLo))?(RegExp.$2):'';
adsIP=(/(\?|&)atw[Ii][Pp]=(.*?)(&|$)/.test(adsLo))?(RegExp.$2):'';
if (!(/^[a-z0-9\.=;]+$/.test(unescape(adsIP))))adsIP='';
if (adsIP)adsATOth+='ip='+adsIP+';';
adsOverlay=(/(\?|&)atw[Oo][Vv][Ee][Rr]=(.*?)(&|$)/.test(adsLo))?(RegExp.$2):'';
adsSZ=(/(\?|&)atw[Ss][Zz]=(.*?)(&|$)/.test(adsLo))?(RegExp.$2).split(/\||;/):'';
adsOverDelay=(/(\?|&)atw[Dd][Ee][Ll][Aa][Yy]=(.*?)(&|$)/.test(adsLo))?(RegExp.$2).split(/\||;/):'';
if (!adsOverDelay)adsOverDelay=1000;
if (!(/^[0-9A-Za-z,]+$/.test(unescape(adsSZ))))adsSZ='';
adsFileless=(/(\?|&)atw[Ff][Ii][Ll][Ee][Ll][Ee][Ss][Ss]=(.*?)(&|$)/.test(adsLo))?1:0;
}
adUACInit();
function adsCkCol(f,d){
var dv=document.getElementById(f.divName),i=d.getElementById('adDiv').innerHTML,z,s='http';
if (f.id[f.id.length-1]==adsPing-1) { 
  z=document.createElement('script');
  if (adsSecure)s+='s://s'
  else s+='://o'
  z.src=s+'.aolcdn.com/ads/blank.js';
  document.body.appendChild(z);
}
var x=((i.indexOf('AOL - HTML - Blank HTML Ad')!=-1)||(i.indexOf('ATCollapse.gif')!=-1)),x2=(i.indexOf('<\/script>\n<\/td><\/tr><\/tbody><\/table>')!=-1);
if (!x&&!x2&&f.divName=='adsOverlayDiv'){
	parent.document.getElementById('adsDisplayBox').style.display='inline';
	if (adsOverF!='0'){
		var dt=new Date();
		dt.setHours(dt.getHours()+(adsOverF*24));
		try {
			localStorage.setItem('adsOverlay',dt.getTime());
		}
		catch(e){}
	}
	var t=setTimeout(parent.adsOverCloseFn,parent.adsCloseTime);
}
if (dv&&dv.col){
if (!x){
f.width=f.w;
f.height=f.h;
f.style.visibility='visible';
}}
if (x){
f.style.width="0px"
f.style.height="0px"
dv.width=0
dv.height=0 
f.style.display='none'
adsDevilObj(f.divName,'1','1',f,d,'1');
return true
}
else {
 if (f.textAd!=1&&!dv.dynSz)adsDevilObj(f.divName,f.w,f.h,f,d,'0');
 return false
}
}
function adsDoOnL(f,d){
if (f){
if (!adsCkCol(f,d)&&f.divName){
var s=d.getElementById('adDiv').innerHTML,n=s.indexOf('\<\!--'),n2=s.indexOf('3PTextDynamic'),wi,h;
if (s.indexOf('3rd Party Text')<0&&s.indexOf('TextVendor')<0&&s.indexOf('TextCustom')<0){
if (n2>0){
adsQuigo=2
adsRMIFOnL(f,d)
}else{
if (n>0){
var x=s.substr(n,s.length),p=document.getElementById(f.divName),z=f.contentWindow.adComRedirect;
if (z){ 
 adSetupDiv(f.w,f.h,z,f.divName,f.src,'text',f.mn,'0','0','0');
 adsDivs[adsDivs.length-1].LoadAd()
}
else { 
 p.innerHTML=x
 adsDevilObj(f.divName,f.w,f.h,f,d,'0');
}}}}
else{
if (/aolsize=["']([\d]*?)\|([\d]*)["']/i.test(s)){
 wi=unescape(RegExp.$1);
 h=unescape(RegExp.$2);
}else{
 wi=f.w;
 h=f.h;
}
if (s.indexOf('TextCustom')>-1){
f.style.width=wi+'px';
f.style.height=h+'px';
f.style.display='block';
f.style.visibility='visible';
}
adsDevilObj(f.divName,wi,h,f,d,'1');
}}}}
function adSetNetId(v){adsNt=v}
function adSetPlId(v){adsPl=v}
function adSetHtNm(){}
function adSetHtNmAT(v){
var p=location.protocol;
adsHt=(/^https?/i.test(v))?v:((/^\/\//.test(v))?p+v:p+'//'+v);
if (adsHt.charAt(adsHt.length-1)=='/')adsHt=adsHt.substring(0,adsHt.length-1);
}
function adSetAMS(){}
function adSetTarget(){}
function adSetSN(v){var c
if (v){
v=v.toString()
if ((v.indexOf('@aol.com')!=-1)||(v.indexOf('@aim.com')!=-1)){
v=v.split('@');
v=v[0];
}
if (window.btoa)c=btoa(v)
else{
var o="",c1,c2,c3,e1,e2,e3,e4,i=0,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
do {
c1=v.charCodeAt(i++)
c2=v.charCodeAt(i++)
c3=v.charCodeAt(i++)
e1=c1 >> 2
e2=((c1 & 3) << 4) | (c2 >> 4)
e3=((c2 & 15) << 2) | (c3 >> 6)
e4=c3 & 63
if (isNaN(c2))e3=e4=64
else if (isNaN(c3))e4=64
o=o+s.charAt(e1)+s.charAt(e2)+s.charAt(e3)+s.charAt(e4)
}
while (i<v.length);
c=o;
}
adsESN='&ESN='+c;}
}
function adSetWM(v){adsATWM='kvwm='+escape(v)+';'}
function adSetOthAT(v){
if (adsUACH&&adsUACD>0)var x=setTimeout(adsATWDelay,3000,arguments.callee.name,arguments)
else {
if (v){
 if (v.charAt(v.length-1)!=';')v+=';'
 var x=v.split(';'),l=x.length,y;
 for (i=0;i<l-1;i++){
  if (x[i].charAt(x[i].length-1)!='='){
    y=x[i].split('=');
    adsATOth+=escape(y[0])+"="+escape(y[1])+';';  
  }
 }
}
else if (v=='')adsATOth='';
try {ATW3_AdObj.adsATOth=adsATOth;}
catch(e){}
}
}
function adSetOthMob(v){}
function adSetCo(v){
if (v)adsCo=v.toLowerCase();
}
function adSetAddOn(v){
if (adsAddOn!=2)adsAddOn=parseInt(v);
}
function adSetAJAXAddOn(v){
if (adsUACH&&adsUACD>0)var x=setTimeout(adsATWDelay,3000,arguments.callee.name,arguments)
else adsAJAXAddOn=v
}
function adSetType(v){
if (adsUACH&&adsUACD>0)var x=setTimeout(adsATWDelay,3000,arguments.callee.name,arguments)
else {
if (v=='')v='J'
adsTp=v.toUpperCase()
}
}
function adSetSearch(v){
v=v.replace(/ /g,'+')
v=(window.encodeURIComponent)?encodeURIComponent(v):escape(v)
adsSrAT="KEY="+v+";"
}
function adSendTerms(){}
function adSetAdURL(u){
if (u=='fileless')adsFileless=1;
else if (adsFileless==1)u='fileless';
if (adsUACH&&adsUACD>0)var x=setTimeout(adsATWDelay,3000,arguments.callee.name,arguments)
else adsPage=u;
}
function adsShowDiv(d){
var v=adsGetObj(d);
v.style.display="block"
}
function adsHideDiv(d){
var v=adsGetObj(d);
v.style.display="none"
}
function adsResetPg(){
adsTile=1
adsDivs=[]
adsD=new Date()
adsScr=adsD.getTime()%0x3b9aca00
adsATOth=''
adsATMob=''
adsSrAT=''
adsAddOn=1
atwReset=1;
adsRRDevil='';
aol_devil_flag='';
}
function adsReloadAll(){
adsD=new Date()
var z=adsDivs.length;
for (var i=0;i<z;i++)adsReloadAd(adsDivs[i],'','all')
}
function adsReloadAd(d,m,v){
if (v!='all')adsD=new Date()
var v=adsGetObj(d),s=v.adURL,dt=adsD.getTime()%0x3b9aca00;
if (s){
s=unescape(s);
if (m)s=s.replace(/alias=(.*?);/,"alias="+m+";").replace(/kvmn=(.*?);/,"kvmn="+m+";");
var i=s.indexOf(';grp='),u=''
if (i==-1)u=s.replace(/ /, "")+" "
else u=s.substring(0,i+5)+dt
u=u.replace(/kvgrp=[0-9]*;/,"kvgrp="+dt+";")
if (s.indexOf('random=')>-1)u=u+';random='+dt;
v.adURL=u
v.LoadAd()
}}
function adsReloadIframe(n,m,v){
var f='',s='';
try {f=document.getElementById(n)}
catch (e){}
if (f){
if (v!='all')adsD=new Date()
try {s=f.src}
catch (e){}
if (s){
s=unescape(s);
if (m)s=s.replace(/alias=(.*?);/,"alias="+m+";").replace(/kvmn=(.*?);/,"kvmn="+m+";")
var dt=adsD.getTime()%0x3b9aca00,i=s.indexOf(';grp=');
s=s.replace(/kvgrp=[0-9]*;/,"kvgrp="+dt+";")
try {f.src=s.substring(0,i+5)+dt}
catch(e){}}}
}
function adsReloadIframeAll(){
var n,f='';
adsD=new Date()
for (var i=0;i<adsTile;i++){
n='adsF'+i
try {f=document.getElementById(n)}
catch (e){break}
if (f)adsReloadIframe(n,'','all')}
}
function adSetOthDclk(v){}
function adSetDelay(){}
function adSetExt(){}
function adsGetAdURL(w){
var d=w.frameElement.parentNode;
return d.adURL
}
function adsDevilObj(d,w,h,f,doc,r){
var dv=document.getElementById(d),i=doc.getElementById('adDiv').innerHTML,n=dv.adNum+1;
var m=(/mnum=(.*?)\//i.test(i))?RegExp.$1:'',
a=(/aolAdId=("|')(.*?)("|')/i.test(i))?RegExp.$2:'|',
t=(/aolFormat=("|')(.*?)("|')/i.test(i))?RegExp.$2:'',
tx=(f.textAd)?'1':'0';
if (f.mn)aolAdFdBkStr+=f.mn+'|'+w+'|'+h+'|'+a+'|'+m+';';
if (a=='|')a='';
f.setAttribute('banId',a);
try {
window.adsDevilAd=window.adsDevilAd||{};
window.adsDevilAd.ad=window.adsDevilAd.ad||[];
adsDevilAd.ad[n]={
 divName:f.divName,
 mn:f.mn,
 adId:a,
 aolFormat:t,
 width:w,
 height:h,
 mnum:m,
 sz:f.sz,
 textAd:tx
};
}
catch(e){}
try {
 adsDevilAd.ad[n].aolDevilFlag=top.aol_devil_flag;
 if (!adsRRDevil){
  if (f.sz=='300x250,300x600,300x1050'&&h!='1050')adsRRDevil='n';
  if (top.aol_devil_flag||(f.sz=='300x250,300x600,300x1050'&&h=='1050'))adsRRDevil='y'
 }
}
catch(e){}
try {
if (window.adsDevilAd.hasOwnProperty('resized'))adsDevilAd.resized(d,w,h);
if (window.adsDevilAd.hasOwnProperty('adinfo'))adsDevilAd.adinfo(n,d,w,h);
if (window.adsDevilAd.hasOwnProperty('adinfo2'))adsDevilAd.adinfo2(n,d,w,h);
if (window.adsDevilAd.hasOwnProperty('moat'))adsDevilAd.moat(n,d,w,h,tx);
if (w=='300'){
 adsDevilAd.RRWidth=w;
 adsDevilAd.RRHeight=h;
}
}catch(e){}
}
function adsRMIFOnL(w,d){
var f,wi='',h='',z=0,c=0,a=0;
if (adsQuigo>0)f=w
else f=w.frameElement
var v=f.parentNode,s=d.getElementById("adSpan"),aD=d.getElementById("adDiv"),aD1=aD.innerHTML;
if (/ACE_AR(.*?)possible_size(.*?)[,}]/i.test(aD1))a=1;
if (/ACE_AR(.*?)Size(.*?)['"](.*?)['"]/i.test(aD1)){
 if (unescape(RegExp.$3).indexOf(',')>0)a=1;
}
if (adsQuigo==0&&(/aolSize=["']([\d]*?)\|([\d]*)["']/i.test(aD1))&&(unescape(RegExp.$2)>1)){
 wi=unescape(RegExp.$1);
 h=unescape(RegExp.$2);
 c=1;
}
else{
 if (/ACE_AR(.*?)Size(.*?)[,}]/i.test(aD1)&&!a){
  var as=unescape(RegExp.$2).replace(/[^\d\+]/g,"");
  wi=parseInt(as.substring(0,3),10);
  h=parseInt(as.substring(3,as.length),10);
 }
 else {
  if (!adsMob){
   if (/img (.*?)width=["']?(.*?)(\"|\'| )/i.test(aD1))wi=parseInt(RegExp.$2);
   if (/img (.*?)height=["']?(.*?)[\"|\'| ]/i.test(aD1))h=parseInt(RegExp.$2);
  }
  if (!wi||!h||wi<2||h<2){
   if ((v.childNodes.length==1)||(d.adsWidth&&d.adsHeight)){
    if (d.adsWidth&&d.adsHeight){wi=d.adsWidth;h=d.adsHeight;}
    else{
     if (s){
      wi=s.offsetWidth
      if (adsIE&&parseInt(adsUA.charAt(adsUA.indexOf('trident/')+8))<5)h=s.offsetHeight
      else h=aD.offsetHeight
     }
    }
   }
   else if (adsMob){
    try{
     wi=f.contentWindow.document.body.scrollWidth;
     h=f.contentWindow.document.body.scrollHeight;
    }
    catch(e){}
   } 
  }
 }
}
if ((wi&&h&&wi>1&&h>1&&!(v.w==wi&&v.h==h)&&(aD1.indexOf('AOLDevilNoExpand')==-1))||(aD1.indexOf('AOLDevilExpand')!=-1)){
 var x=0;
 if (v.sz){
  var s=v.sz.split(','),l=s.length;
  for (i=0;i<l;i++){
   x=s[i].split('x');
   if ((wi==x[0])&&(h==x[1])&&(h!=1)){
    if (!a){
     f.width=wi;
     f.height=h;
    }
    z=1;
    break;
   } 
  }
  if (!z&&v.sz=='300x250,300x600,300x1050'){
   if (h<350)h='250'
   else if (h>450&&h<750)h='600'
   else if (h>900) h='1050';
   if (!a){
    f.width=300;
    f.height=h;
   }
   z=1;
  }
  if (!z&&v.sz=='300x250,320x480,300x600,320x50'){
	if (h<150)h='50'
	else if (h<350)h='250'
	else if (h<550)h='480'
   	else h='600';
	if (w<310)wi='300'
   	else wi='320';
   	if (!a){
    		f.width=wi;
    		f.height=h;
   	}
   	z=1;
  }
  if (!z&&(v.sz=='728x90,948x250,970x66,970x90,950x252,970x250,940x230'||v.sz=='728x90,948x250,950x252,940x230')){
   if (h<78)h='66'
   else if (h<150)h='90'
   else h='250';
   if (wi<800)wi='728'
   else wi='970';
   if (!a){
    f.width=wi;
    f.height=h;
   }
   z=1;
  }
 }
}
if (c&&v.w=='320'&&v.h=='50'&&wi=='320'&&h=='68'){
 if(adsMobDyn&&!a){
  f.width=320; 
  f.height=68;
 }
}
else if (!z){wi=v.w;h=v.h;}
adsDevilObj(v.divName,wi,h,f,d,z);
if (wi&&h&&f&&adsQuigo==0)f.className="uac_"+wi+"x"+h;
adsQuigo=0;
if (v.divName=='adsOverlayDiv'){
	v.style.width=wi+'px';
	v.style.height=h+'px';
}
}
function adsRmChildren(o){
var f=null;
while (o.childNodes.length>0){
var c=o.childNodes[0],i=c.id
if (i){
if (i.toString().indexOf("atwAdFrame")!=-1){
f=c
f.src="about:blank"}
c.i=""}
if (c.childNodes.length>0)adsRmChildren(c)
o.removeChild(c)}
}
function adsClrDiv(){adsRmChildren(this)}
function adsClrAd(d){
var o=adsGetObj(d);
adsRmChildren(o)
}
function adsGetObj(d){
var o;
if (typeof(d)!='object')o=document.getElementById(d)
else o=d
return o
}
function adsFilelessFn(i,u){
var i2=(i.contentWindow)?i.contentWindow:(i.contentDocument.document)?i.contentDocument.document:i.contentDocument;
i2.document.open();
var iStr='<html><head><script type="text/javascript">\n';
iStr+='function adsPageOnL(){var adFr=window.frameElement;\n';
iStr+=' if (adFr){if (adFr.textAd!=1){var collapse=parent.adsCkCol(adFr,document);\n';
iStr+=' if (!collapse&&adFr.divName){var parDiv=parent.document.getElementById(adFr.divName);\n';
iStr+=' if (parDiv&&(parDiv.dynSz==1)&&parent.adsRMIFOnL){parent.adsRMIFOnL(window,document)}}}else{parent.adsDoOnL(adFr,document)}}}\n';
iStr+='</script></head>\n';
iStr+='<body onload=\'setTimeout("adsPageOnL()",10)\' style="overflow: visible; border:0; background-color: transparent;">\n';
iStr+='<div id="adDiv" style="overflow: visible; border:0;">\n';
iStr+='<span id="adSpan" style="overflow: visible; border:0;">\n';
iStr+='<table id="adTable" style="display:inline; border-collapse:collapse;"><tr><td style="padding:0px">\n';
iStr+='<script type="text/javascript">\n';
iStr+='var inDapIF=true;inFIF=true;\n';
iStr+='</script>\n';
iStr+="<script type='text/javascript' src='"+u+"'></script>";	
iStr+='</script></td></tr></table></span></div></body></html>';	
i2.document.write(iStr);
i2.document.close(); 
}
function adsLoadAd(){
if (adsTile==1)atwAd1Time=new Date();
this.ClearAd()
var f=document.createElement('iframe');
f.textAd=this.textAd
if ((this.textAd==1)||(this.col)){
f.visibility='hidden'
f.width=0;
f.height=0;
}else{
f.width=this.w
f.height=this.h
}
f.title="Ad"
f.marginWidth=0
f.marginHeight=0
f.setAttribute('allowtransparency','true')
f.frameBorder=0
f.scrolling="no"
f.w=this.w
f.h=this.h
f.mn=this.mn
f.divName=this.divName
f.sz=this.sz
f.inV=this.vis
f.timing=new Date().getTime();
this.appendChild(f)
if (this.iframe){
	f.id="adsF"+this.adNum;
	f.src=this.adURL;
}
else
{
	f.id="atwAdFrame"+this.adNum;
	if ((document.domain!=location.hostname)&&(this.adPage.indexOf('#')==-1))this.adPage=this.adPage+'#'+document.domain
	if (this.adPage||adsFileless==1){
		if (f.inV=='0'){
			if (adsFileless==1)adsFilelessFn(f,this.adURL)
			else f.src=this.adPage;
		}
		else{
 			f.url=this.adPage;
 			this.adURL=this.adURL.replace(/kvmn=/,"kvvis=1;kvmn=");
			f.adURL=this.adURL;
 			var z=setTimeout(function(){adsDelaySonar(f,adsSonarT);},100);
		}
		if (adsTile==1&&atwSticky==1){
			if (document.getElementById(f.divName)){
				adsStD=f.divName;
				adsSonar(document.getElementById(f.divName),{
					scrollin:function(){
						adsSticky();
					},
					scrollout:function(){
						var el=document.getElementById(f.divName);
						el.style.position='fixed';
						el.style.display='inline-block';
						el.style.zIndex='10000000';
						el.style.top='0px';
						el.style.background='white';
						el.style.borderBottom='1px LightGray solid';
						el.style.width='100%';
						el.style.left='0px';
						el.style.height='94px';
						var xx=setTimeout(adsSticky,atwStickyT);
					}
				});
			}
		}
	}
}
}
function adsDelaySonar(f,t){
if (atwLoaded&&(atwReset==0||adsRRDevil!='')){
 if (t){
  setTimeout(function(){adsDelaySonar(f,0);},t);
 }
 else if (f.inV!='D'||adsRRDevil=='n'||!adsRRCalled){
  if (adsSonar(f,function(){},{visibility:adsSonarV})){
   if (adsFileless==1)adsFilelessFn(f,f.adURL)
   else f.src=f.url;
  }
  else{ 
   adsSonar(f,function(){
    this.scrollin=false;
    if (f.inV!='D'||adsRRDevil=='n'||!adsRRCalled){
	if (adsFileless==1)adsFilelessFn(f,f.adURL)
	else f.src=f.url;
    };
    },
    {visibility:adsSonarV}
   )
  }
 }
 else {
	if (adsRRDevil=='')setTimeout(function(){adsDelaySonar(f,t);},100);
 }
}
else {
 setTimeout(function(){adsDelaySonar(f,t);},100);
}
}
function adSetupDiv(w,h,u,dv1,pg,ds,m,sz,c,v){
var s="adsDiv"+adsDivs.length,d;
if (!dv1||dv1==""){
document.write("<div id='"+s+"'></div>")
d=document.getElementById(s)
dv1=s
}
else d=adsGetObj(dv1)
if (typeof(dv1)=='object'){
 try {
  if (dv1.id==''){
   d.divName=s;
   d.id=s;
  }
  else d.divName=dv1.id
 }
 catch(e){}
}
else {
 d.divName=dv1
}
d.LoadAd=adsLoadAd
d.ClearAd=adsClrDiv
d.mn=m
if (ds=='text')d.textAd=1
else d.textAd=0;
if (ds&&ds!='text'&&ds!='iframe')d.dynSz=1
else d.dynSz=0;
if (sz)d.sz=sz
else d.sz=0;
d.w=w;d.h=h;
d.adURL=u
d.adPage=pg
d.adNum=adsDivs.length
d.col=c;
d.vis=v;
d.delayed=0;
if (ds=='iframe')d.iframe=1
else d.iframe=0;
adsDivs[adsDivs.length]=d
}
function adsCkPlg(){
var dF='',n=navigator,a,d;
if (adsIE&&(adsUA.indexOf('win')!=-1)){
try {a=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
if (a){d=a.GetVariable("$version").split(" ")[1].split(",");
if (d[0]>=10)dF=d[0]
}}catch(e){}
}else{
var p=n.plugins
if (p){
var l=p.length
if (l>1){
var m=n.mimeTypes,fl=m['application/x-shockwave-flash']
if (m&&((fl&&fl.enabledPlugin&&(fl.suffixes.indexOf('swf')!=-1)))){
var ds,f="Flash ",fS
for (var i=0;i<l;i++){
ds=p[i].description
fS=ds.indexOf(f)
if (fS!=-1){
if (ds.substring(fS+6,fS+8)>=10){dF=ds.substring(fS+6,fS+8)}
}}}
if (fl==null)dF=''
}}}
adsNMSG=dF
}
function adsGetValues(){
var l=unescape(adsLo),p='',r='',s='',t='',v,x=0,re='',le,ln;
adsNt2=(/(\?|&)atw[Nn][Tt]=(.*?)(&|$)/.test(adsLo))?(RegExp.$2):'';
if (adsNt2)adsNt=adsNt2;
if (l.indexOf('&pLid')>0)v=l.match(/[?&]icid=.*?[|](.*?)[|](.*?)[|](.*?)&pLid=(.*?)($|\&|\|)/);
else v=l.match(/[?&]icid=.*?[|](.*?)[|](.*?)[|](.*?)[|](.*?)($|\&|\|)/);
if (v){
for (var i=1;i<=4;i++){
if (!(/^[0-9A-Za-z:\/._|\-]+$/.test(v[i]))){x=1;
break;
}
r+=v[i]+':'
}
if (!x)r='kvdl='+r.substring(0,r.length-1)+';';
else r='';
}
p=adsLo.substr(7).toLowerCase();
p=p.replace(/www\./,'');
p=p.replace(/\.com/,'');
p=p.replace(/[?#].*$/,'');
p=escape(p);
le=p.length;
if (le>65){
 p=p.substr(0,65);
 ln=p.length;
 if (p[ln-1]=='%')p=p.substr(0,64);
 else if (p[ln-2]=='%')p=p.substr(0,63);
}
p="kvpg="+p+";";
p=p.replace(/\/;$/,';');
p=p.replace(/\//g,'%2F');
if (adsATOth.indexOf('kvugc')==-1){
 s='kvugc=';
 if (window.adSetUGC==0)s+='0;'
 else if (window.adSetUGC==1)s+='1;'
 else{
  if (adsATOth.indexOf('cmsid')==-1)s+='0;'
  else s+='1;'
 }
}
try {
if (/(^|;)?UNAUTHID=(.*?)[.](.*?)[.]/i.test(document.cookie))t='kvui='+unescape(RegExp.$3)+';';
}
catch(e){}
var y1,g='kvh5lsid=0;';
try {
 y1=window.localStorage.getItem('adsGUID');
 if (y1){
   g=g.replace('0','1');
   g+='GUID='+y1+';';
 }
}
catch(e){}
try {
 var u=document.referrer;
 if (u){
   v=u.match(/https?\:\/\/(?:www.)?(.*?)(?:[\/?#]|$)/);
   re='kvrefd='+ RegExp.$1+';';
 }
}
catch(e){}
return p+r+s+t+g+re;
}
!function(e,t,o){"use strict";function n(t,n){var r;return function(){function l(){r=o,t.call(this)}r||(r=e.setTimeout(l,n))}}function r(t,o){return e.getComputedStyle?e.getComputedStyle(t).getPropertyValue(o):t.currentStyle?t.currentStyle[o]:void 0}function l(t,o,l){"object"==typeof o?l=o:"function"==typeof o&&(l?l.scrollin=o:l={scrollin:o});var a=l.parent;if(!a){for(var f,d=t;(d=d.parentNode)&&1===d.nodeType;)if(f=r(d,"overflow"),"auto"===f||"scroll"===f){a=d;break}a=a||e}if(l.parent=a===e?c:a,l.scrollin||l.scrollout){l.elem=t,u.push(l),s();var p=l.delay||13;a.sonarBound||(a.addEventListener?(a.addEventListener("scroll",n(s,p),!1),a.addEventListener("resize",n(s,p),!1)):e.attachEvent&&(a.attachEvent("onscroll",n(s,p)),a.attachEvent("onresize",n(s,p))),a.sonarBound=!0)}return i(t,l.distance,l.visibility,l.parent)}function i(e,n,r,l){a||(a=t.body),r||(r=0),n===o&&(n=0);var i=e,s=0,u=a.offsetHeight,f=l.clientHeight||0,d=l===c?a.scrollTop||c.scrollTop:l.scrollTop,p=e.offsetHeight||0;if(!e.sonarElemTop||e.sonarBodyHeight!==u){for(;i!==l&&i.offsetParent;)s+=i.offsetTop,i=i.offsetParent;e.sonarElemTop=s,e.sonarBodyHeight=u}return e.sonarElemTop+p-r*p>d-n&&e.sonarElemTop+r*p<d+f+n}function s(){var e,t,o;for(e in u)u.hasOwnProperty(e)&&(t=u[e],(t.scrollin||t.scrollout)&&(o=i(t.elem,t.distance,t.visibility,t.parent),o!==t.detected&&(o?t.scrollin&&t.scrollin.call(t,t.elem):t.scrollout&&t.scrollout.call(t,t.elem),t.detected=o)))}var a,c=t.documentElement,u=[];l.poll=s,e.adsSonar=l}(window,document);
var adsStD,atwSticky=0,atwStickyT=1500;
function adSetSticky(v,t){
atwSticky=1;
if (t)atwStickyT=parseInt(t)*1000;
}
function adsSticky() {
var x=document.getElementById(adsStD);
if (x){
	x.style.position='static';
	x.style.display='inline';
	x.style.zIndex='1';
	x.style.left='0px';
	x.style.borderBottom='none';
	x.style.height='90px';
}
}
var adSetInV='0',adsSonarT=0,adsSonarV=0;
function adSetInView(o,v,t){
if (adsUACH&&adsUACD>0)var x=setTimeout(adsATWDelay,3000,arguments.callee.name,arguments)
else {
if (o)adSetInV=o; 
if (v)adsSonarV=parseFloat(v);
if (t)adsSonarT=parseInt(t);
}
}
function adsATWDelay(z,a){
adsUACH='';
switch(z){
	case 'htmlAdWH':
		htmlAdWH(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7]);
		break;
	case 'adSetAdURL':
		adSetAdURL(a[0]);
		break;
	case 'adSetMOAT':
		adSetMOAT(a[0]);
		break;
	case 'adSetOthAT':
		adSetOthAT(a[0]);
		break;
	case 'adSetType':
		adSetType(a[0]);
		break;
	case 'adSetInView':
		adSetInView(a[0],a[1],a[2]);
		break;
	case 'adSetAJAXAddOn':
		adSetAJAXAddOn(a[0]);
		break;
}
}
function htmlAdWHDyn(m,s,t,dv,fn,ds){htmlAdWH(m,'','',t,dv,fn,ds,s.toString())}
function htmlAdWH(m,w,h,t,dv,fn,ds,sz){
if (adsUACH&&adsUACD>0)var ti=setTimeout(adsATWDelay,3000,arguments.callee.name,arguments)
else {
if (m)m=m.toString()
else return 0;
var d=document,inc='',s,r=0,st="<script type='text/javascript' src='",sp1,ye=0,c=0,f=0,rr=0,wi=window,pr=location.protocol+'//';
if (pr.indexOf('http')<0)pr='http://';
if (!adsVal)adsVal=adsGetValues();
if (!adsChn&&wi.s_265&&wi.s_265.channel)adsChn='kvoch='+escape(wi.s_265.channel)+';';
if (t=='fileless')adsFileless=1;
if (t){
	t=t.toLowerCase();
	if (t.indexOf('c')>0){c=1;t=t.substr(0,t.length-1)}
}
if (adsTp=='F'||t=='ajax'||t=='f'||t=='fileless')f=1;
if (t=='text'||f){
	if (!fn||fn=='')fn=adsPage;
	if (adsPage=='fileless'||t=='fileless')adsFileless=1;
	if ((fn==''||(adsUA.indexOf('opera')>-1))&&(adsFileless!=1)){adsTp='J';t='',f=''}
}
if (sz){
	sp1=sz.split(',')[0].split('x');
	w=sp1[0];
	h=sp1[1];
	if (f)ds='r';
	if (adsRePo=='1'&&window.innerWidth<970&&t!='text'){
		var ss2,ss3,ss4='',ssL;
		ss2=sz.split(',');
		ssL=ss2.length;
		for (var i=0;i<ssL;i++){
			ss3=ss2[i].split('x');
			if (parseInt(ss3[0])<970)ss4+=ss2[i]+',';
		}
		if (ss4=='')return 0
		else sz=ss4.substring(0,ss4.length-1);
	}
}
else sz='';
if (adsSZ){
	var sL=adsSZ.length,ss;
	for (var i=0;i<sL;i=i+2){
		if (adsTile==adsSZ[i+1]){
			ss=adsSZ[i].split('x');
			w=ss[0];
			h=ss[1];
			break;
		}
	}
}
if (w=='RR'||w=='rr'){
	 w=300;h=250;
	 if (f)ds='r';
	 sz='300x250,300x600,300x1050';
	 rr=1;
	 adsRRCalled='1';
}
else if (w=='LB'||w=='lb'){
	w=728,h=90;
	if (f)ds='r';
	if (adsRePo=='1'&&window.innerWidth<970)sz='728x90,948x250,950x252,940x230'
	else sz='728x90,948x250,970x66,970x90,950x252,970x250,940x230';
	if (!adsIntMN)sz+=',101x1';
}
else if (w=='MM'||w=='mm'){
	w=300,h=250;
	if (f)ds='r';
	sz='300x250,320x480,300x600,320x50';
}
else if (w>=970&&window.innerWidth<970&&adsRePo=='1'&&t!='text'){
	return 0;
}
if (adsCp){
	var cl=adsCF.length;
	for (var i=0;i<cl;i++){
		if ((/http[s]{0,1}:\/\/[^\/]*?aol.com(:[0-9]*?){0,1}\//.test(adsCF[i]))&&(/^[0-9A-Za-z\/.:_\-]+$/.test(unescape(adsCF[i])))){
			if ((adsCAd[i]=='I')&&(adsTile==1))adsIntMN=adsCF[i]+'.js';
			if (sz){
				var sp2=sz.split(','),le=sp2.length,sp3;
				for (var j=0;j<le;j++){
					sp3=sp2[j].split('x');
					if (adsCW[i]==sp3[0]&&adsCH[i]==sp3[1])ye=1;
				}
			}
			if (ye||(adsCW[i]==w&&adsCH[i]==h)||(adsCAd[i]==adsTile)){
				if (adsTp=='I'||t=='iframe')s=adsCF[i]+'.html'
				else s=adsCF[i]+'.js';
				adsCW[i]=0;
				r=1;
				break; 
			}
		}
	}
}
if (adsMNS){
	var mL=adsMNS.length,wxh=w+'x'+h,num,all=0;
	for (var i=0;i<mL;i=i+2){
		num=adsMNS[i+1];
		if (num.indexOf('a')>0){
			num=num.replace('a','');
			all=1;
		}
		else {
			all=0;
		}
		if (num.indexOf('only')>-1){
			num=num.replace('only','');
			only=1;
		}
		else {
			only=0;
		}
		if ((adsTile==num)||(wxh==num)||(num=='RRxRR'&&rr==1)){
			m=adsMNS[i];
			if (!all)adsMNS[i+1]='';
			if (only)adsMNS[i+1]='only';
		}
		else if (only){
			m='0';
		}
		if (adsMNS[i+1]=='I')adsIntMN=adsMNS[i];
	}
}
if (m=='0'){adsTile++;return 0}
var adsTpOrig=adsTp;
if (adsTPS){
	var tL=adsTPS.length;
	for (var i=0;i<tL;i=i+2){
		if (adsTile==adsTPS[i+1]){
			t=adsTPS[i].toLowerCase()
			if (t=='j'){adsTp='J';t=''}
			else if (t=='i'){adsTp='I';t=''}
			else adsTp='';
			break;
		}
	}
}
if (r==0){
	if (!adsNMSG&&adsUA.indexOf('ipad')==-1)adsCkPlg();
	if (!adsNMSG)inc='artexc=art_flash,art_rrflash;';
	var s1='',s2='';
	if (sz&&!rr)s2="allowedSizes="+sz+";"
	else if (ds!='r')s2="size="+w+"x"+h+";"
	s2+="noperf=1;";
	if (adsTile!=1)s2+="cfp=1;"
	if (adsAddOnMQ){
		if (adsAddOnMQ=='y')s2+="noaddonpl=y;"
	}
	else {
		if ((t=='ajax'&&!adsAJAXAddOn)||adsAddOn==2||adsIntMN!=''){
			s2+="noaddonpl=y;";
			adsAddOn=2;
		}
		else{
			if (adsTile==1){
				if (adsAddOn==1)adsAddOn=2;
				else s2+="noaddonpl=y;";
			}
			else {
				if (adsAddOn!=1)s2+="noaddonpl=y;";
				else adsAddOn=2;
			}
		}
	}
	if (adsExcV=='blank')inc='artexc=all;'
	else if (adsExcV=='imgOnly')inc='artexc=all;artinc=art_image,art_img1x1,art_3pimg,art_rrimage,art_rrimg1x1,art_rr3pimg;';
	else if (adsExcV=='noflash')inc='artexc=art_flash,art_rrflash;'
	s1=adsATOth.toLowerCase()+adsSrAT+adsATWM+adsVal+'kvmn='+m+';kvgrp='+adsScr+';kvismob='+adsDev+';'+adsChn+adsMOE+"extmirroring=0;kvtile="+adsTile+";target=_blank;"+adsTzAT;
	s2+=inc+s1+"grp="+adsScr;
	if ((m.indexOf('-')>-1)&&(/^[0-9a-fm\-]+$/i.test(m))){
		if (m.substring(0,1).toLowerCase()=='m')m=m.substring(1,m.length);
		if (adsHt&&adsHt!='https://at.atwola.com')s=adsHt
		else {
			s=pr+'mads';
			if (adsCo!='us')s+='uk';
			s+='.at.atwola.com';
		}
		adsMob=1;
		if (f)ds='r';
		var kf='kvmflash=',swh='',inI=false,inSD=true,pU,sd='';
		if (adsNMSG)kf+='true;'
		else kf+='false;';
		if (wi.screen && wi.screen.width && wi.screen.height)swh='swh='+wi.screen.width+'x'+wi.screen.height+';screenwidth='+wi.screen.width+';screenheight='+wi.screen.height+';';
		try {
			if (wi.devicePixelRatio)sd='screendensity='+wi.devicePixelRatio+';';
			if (wi.top!==wi.self)inI=true;
			pU=wi.top.location.href.toString();
		}
		catch (e){}
		if (!pU||pU==="undefined"){
			inI=true;
			inSD=false;
		}
		var f1="f="+(inI?(inSD?"1":"2"):"0")+";",f2="fv="+(adsNMSG?adsNMSG:"0")+";";
		s+='/adcall?mpid='+m+';rettype=js;width='+w+';height='+h+';'  
		s+=s1+kf+swh+sd+f1+f2+'optn=1;grp='+adsScr+';random='+adsScr;
	}
	else {
		if (adsDev=='1'&&adsMSP&&adsTp!='A0'&&adsTp!='A1'){
			var sm='alias='+m+';random='+adsScr+';sizeId=-1;';
			sm+=s2;
			s=pr;
			if (t=='iframe'||adsTp=='I'){
				sm+='|'+adsNt+'|'+adsPl+'|'+adsCo;
				sm=unescape(sm);
				if (adsSecure)s+='s'
				else s+='o';
				s+='.aolcdn.com/ads/mobileIframe.html?s='+escape(sm);
			}
			else {
				s+='mads';
				if (adsCo!='us')s+='uk';
				s+='.at.atwola.com/adcall?mpid=348-d-d-e;rettype=js;callProtocol=3.0;networkId='+adsNt+';placementid='+adsPl+';'+sm;
			}
		}
		else
		{
			if (adsHt)s=adsHt
			else s=pr+'at.atwola.com';
			s+="/addyn/3.0/"+adsNt+"/"+adsPl+"/0/-1/";
			s+=s2.replace(/noperf=1;/,'noperf=1;alias='+m+';');
		}
	}
}
if (t=='return'){
	adsTile++;
	adsTp=adsTpOrig;
	return s;
}
if (t=='text'){
	adSetupDiv(w,h,s,dv,fn,'text',m,sz,c,adSetInV);
	adsDivs[adsDivs.length-1].LoadAd();
}
else if (t=='ajax'){
	adsAJAX=1;
	adSetupDiv(w,h,s,dv,fn,ds,m,sz,c,adSetInV);
	if (!adsSyncDelay||adsDivs.length==1||adsLoadSync)adsDivs[adsDivs.length-1].LoadAd()
	else {
		adsDivs[adsDivs.length-1].delayed=1;
		if (!adsSyncTime)adsSyncTime=setTimeout(adsLoadedSync,adsSyncDelay);
	}
}
else if (t=='iframe'){
	adSetupDiv(w,h,s.replace(/addyn\/3.0/,"adiframe/3.0"),dv,fn,'iframe',m,sz,c,'0');
	adsDivs[adsDivs.length-1].LoadAd();
}
else if (adsTp=='F'||t=='f'||t=='fileless'){
	adSetupDiv(w,h,s,dv,fn,ds,m,sz,c,adSetInV);
	if (!adsSyncDelay||adsDivs.length==1||adsLoadSync)adsDivs[adsDivs.length-1].LoadAd()
	else {
		adsDivs[adsDivs.length-1].delayed=1;
		if (!adsSyncTime)adsSyncTime=setTimeout(adsLoadedSync,adsSyncDelay);
	}
}
else if (adsTp=='A0'||adsTp=='A1'){
	var ai;
	if (adsTp=='A0')ai=d.getElementById('adsF0')
	else ai=d.getElementById('adsF1');
	adsD=new Date();
	dt=adsD.getTime()%0x3b9aca00;
	ai.src=s.replace(/addyn\/3.0/,"adiframe/3.0").replace(/grp=[0-9]*/,"grp="+dt);
}
else if (adsTp!='J'){
	d.write("<iframe title='Ad' name='adsF"+adsLNm+"' id='adsF"+adsLNm+"' src='"+s.replace(/addyn\/3.0/,"adiframe/3.0")+"' width='"+w+"' height='"+h+"'  scrolling=no frameborder=0 marginheight=0 marginwidth=0></iframe>");
	adsLNm++;
}
else if (adsTp=='J'){
	if (dv==undefined||adsMob)d.write(st+s+"'></script>")
	else {
		 s=s.replace(/allowedSizes=.*?;/,"size="+w+"x"+h+";");
		 if (s.indexOf('size=')==-1)s=s.replace(/\/0\/-1\//, "\/0\/-1\/size="+w+"x"+h+";");
		 var dv1=adsGetObj(dv),img=d.createElement('img'),li=document.createElement('a');
		 li.href=s.replace(/addyn/,"adlink");
		 li.target='_blank';
		 img.src=s.replace(/addyn/,"adserv");
		 img.alt='Ad';
		 img.height=h;
		 img.width=w;
		 li.appendChild(img);
		 dv1.appendChild(li);
	}
}
if (adsIntMN&&adsTile==1){
	w='101';
	h='1';
	if (adsIntMN.indexOf('.js')>-1){
		m='ITest';
		s=adsIntMN;
	} 
	else{
		if (adsHt)s=adsHt
		else s='http://at.atwola.com';
		s+="/addyn/3.0/"+adsNt+"/"+adsPl+"/0/-1/size=101x1;noperf=1;cfp=1;";
		s+=s2.replace(/[size|allowedSizes](.*?)noperf=1;/,'alias='+adsIntMN+';').replace(/kvmn=(.*?);/,'kvmn='+adsIntMN+';');
	}
	if (f){ 
		var z=document.createElement('div')
		z.id='101Div';
		document.body.appendChild(z);
		adSetupDiv(w,h,s,z,fn,'',m,sz,c,'0');
		adsDivs[adsDivs.length-1].LoadAd();
	}
	else{
		document.write('<script type="text/javascript" src="'+s+'"></script>');
	}
}
if (adsTile==1&&adsOverS!='')var tO=setTimeout(adsOverlayAdCall,adsOverDelay,adsOverS);
adsTile++;
adsTp=adsTpOrig;
}
function imageAdWH(){}
(function(w) {
var c=w['mraid']||w['ormma'];
if (c)w['open']=c['open'];
})(window);
}}