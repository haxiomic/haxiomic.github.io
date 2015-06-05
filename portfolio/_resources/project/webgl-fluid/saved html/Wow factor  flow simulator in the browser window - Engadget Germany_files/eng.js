/*! eng.js * Copyright (c) 2014 AOL; */
function hasURLQueryStringParam(a) {
    return window.location.search.match(RegExp("(\\?|&)" + a))
}

function getURLQueryStringParam(a) {
    return decodeURIComponent((location.search.match(RegExp("[?|&]" + a + "=(.+?)(&|$)")) || [, ""])[1])
}

function sort(a, b) {
    b = b || function (a, b) {
        return b >= a
    };
    var c = a.length,
        d = parseInt(c / 2, 10),
        e = a[d];
    if (1 >= c) return a;
    var f = [],
        g = [];
    for (var h in a) h != d && (b(a[h], e) ? f.push(a[h]) : g.push(a[h]));
    return sort(f).concat(e, sort(g))
}
var eng = {};
eng.utils = {}, eng.utils.targetBlank = function () {
    function a() {
        $('.post-body a:not([href*="engadget.com"])').attr("target", "_blank"), $('#rail a:not([href*="engadget.com"])').attr("target", "_blank")
    }
    return {
        init: a
    }
}(), eng.utils.targetBlank.init(), eng.utils.localTimes = function () {
    var a = $("span.event-datetime", "#body");
    a.length && a.each(function () {
        var a, b;
        a = $(this), b = new Date(a.text()), a.text(b.toLocaleString())
    })
}, eng.utils.hidePollResults = function () {
    $(".poll").addClass("noresults")
}, eng.utils.mozillaLinks = function () {
    function a() {
        $(document).on("click", 'a:not([href*="://' + location.host + '"])', function (a) {
            return a.preventDefault(), window.open(this.href), !1
        })
    }
    if (void 0 !== navigator.mozApps) {
        var b = navigator.mozApps.getSelf();
        isMozRuntime = !1, b.onsuccess = function () {
            isMozRuntime = b.result, isMozRuntime && a()
        }
    }
}, eng.utils.ieVersion = function () {
    var a = -1;
    if ("Microsoft Internet Explorer" == navigator.appName) {
        var b = navigator.userAgent,
            c = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
        null != c.exec(b) && (a = parseFloat(RegExp.$1))
    }
    return a
}, eng.utils.responsify = function () {
    function a() {
        $("#nav-main #search-container").length > 0 && (e.remove(), i.append(e))
    }

    function b() {
        0 === $("#nav-main #search-container").length && (e.remove(), h.append(e))
    }

    function c() {
        $("#nav-main #nav-guest-actions").length > 0 && (f.remove(), g.before(f))
    }

    function d() {
        0 === $("#nav-main #nav-guest-actions").length && (f.remove(), h.prepend(f))
    }
    /Windows/i.test(navigator.userAgent) && jQuery("html").addClass("win");
    var e = $("#search-container"),
        f = $("#nav-guest-actions"),
        g = $("#nav-mini .search"),
        h = $("#nav-main"),
        i = $("#nav-mini header");
    $.Topic("breakpoint").subscribe(function (e) {
        768 > e ? (g.show(), b(), c()) : 960 > e ? (g.hide(), c(), a(), $("#nav.showMiniSearch").length > 0 && $("#nav.showMiniSearch").removeClass("showMiniSearch")) : e >= 960 && (g.hide(), d(), b())
    })
}, eng.utils.edition = function () {
    function a() {
        //var a = document.cookie.match(/gdgt_edition\s*=\s*uk/i);
        return "de";
    }
    return {
        is: a
    }
}(), 
eng.utils.timeago = function (a, b) {
    /*if ($("html").hasClass("ie8")) return !1;*/
    var c, d, e = new Date,
        f = 864e5,
        g = 36e5;
    if (c = "CET", d = "UHR", b) {
        var h = (new Date($(a).attr("datetime")), $(a).attr("datetime"));
        $(a).text(moment(h).tz(c).format("DD.MM.YYYY, [um] HH:mm:ss [" + d + "]"))
    } else $(a).each(function (a, b) {
        var h = new Date($(b).attr("datetime")),
            i = Math.abs(e - h);
        $(b).text(f > i ? g > i ? "VOR " + Math.round(i / 6e4) + " MINUTEN" : Math.round(i / 36e5) > 1 ? "VOR " + Math.round(i / 36e5) + " STUNDEN" : "VOR " + Math.round(i / 36e5) + " STUNDE" : moment(h).tz(c).format(Math.round(i / 36e5 > 24 && Math.round(48 > i / 36e5)) ? "[GESTERN UM] HH:mm [" + d + "]" : "DD.MM.YYYY, [um] HH:mm:ss [" + d + "]"))
    })
}, eng.utils.langtimeago = function (a) {
    var c, d, e = new Date;
	$(a).each(function (a, b) {
		var h = new Date($(b).attr("datetime")),
		i = Math.abs(e - h);
		moment.lang('de');
        $(b).text(moment(h).fromNow())
    })
},
eng.eventDetail = function () {
    function a() {
        $("ul.tab-nav").find("a").each(function () {
            var a = window.location.href.replace(/\/$/, "").split("/").pop().replace(/[^A-Z0-9]/gi, "").toLowerCase();
            $(this).attr("id").replace(/^event/, "").replace(/sponsor$/, "sponsors").toLowerCase() === a && $(this).addClass("selected")
        })
    }

    function b() {
        a()
    }
    return {
        init: b
    }
}(), eng.carousel = function () {
    function a() {
        var a = q.activeIndex + 1;
        q.cycle && (a >= q.items.length && (a = 0), b(a))
    }

    function b(a) {
        q.cycle && (i(), n.stop().fadeOut(), n.eq(a).stop().fadeIn(), p.removeClass("active"), p.eq(a).addClass("active"), q.activeIndex = a, h(), n.eq(q.activeIndex).find("img").loadImage())
    }

    function c() {
        var a, b = q.items,
            c = b.length,
            d = [],
            e = [];
        for (a = 0; c > a; a += 1) d.push("<li class='" + (0 === a ? "active" : "") + "' style='left: " + (1 / c * 100 | 0) * a + "%; width: " + (1 / c * 100 | 0) + "%'><b></b><a href=#>" + b[a].tab + "</a><div class=ribbon><div class=progress></div></div></li>"), e.push("<li class='" + (0 === a ? "active" : "") + "'><a href='" + b[a].url + "' style='background: " + b[a].bg + "'><img src='http://o.aolcdn.com/js/x.gif' data-src='" + b[a].image + "'><span class=headline>" + b[a].headline + "</span></a></li>");
        return e.splice(0, 0, e[e.length - 1]), e.push(e[1]), ["<div class=slides>", "<div class=scroller>", "<ul>", e.join(""), "</ul>", "</div>", "<div class=s-arrow-white-left></div>", "<div class=s-arrow-white-right></div>", "</div>", "<div class=tabs>", "<ul>", d.join(""), "</ul>", "</div>"].join("")
    }

    function d() {
        g(), q.cycle || (q.cycle = !0, b(q.activeIndex), j())
    }

    function e() {
        q.cycle = !1
    }

    function f() {
        var a, b;
        g(), e(), a = q.items.length, $("#carousel div.scroller").width($("#carousel div.scroller li:first").width() * (a + 2)), n.show(), b = new window.iScroll($("#carousel div.scroller")[0], {
            disableTouchEvents: !1,
            snap: !0,
            momentum: !1,
            hScrollbar: !1,
            overflow: "hidden",
            onScrollEnd: function () {
                var c = b.pageX - 1;
                return o.eq(b.pageX).find("img").loadImage(), o.eq(b.pageX + 1).find("img").loadImage(), 0 === b.pageX ? (c = 0, b.scrollToPage(a, 0, "0ms")) : b.pageX === a + 1 ? (c = a, b.scrollToPage(1, 0, "0ms")) : (p.removeClass("active").eq(c).addClass("active"), void(q.activeIndex = c))
            }
        }), b.scrollToPage(q.activeIndex + 1, 0, "0ms"), q.swipe = b
    }

    function g() {
        q.swipe && q.swipe.destroy()
    }

    function h() {
        q.cycle && (m || p.eq(q.activeIndex).find("div.progress").stop().animate({
            width: "100%"
        }, q.delay, "linear", a))
    }

    function i() {
        q.cycle && p.eq(q.activeIndex).find("div.progress").stop().animate({
            width: 0
        }, 300)
    }

    function j() {
        p.eq(q.activeIndex).find("div.progress").stop().css("width", 0), h()
    }

    function k(a) {
        if (a >= 768) l(), d();
        else if (a >= 320) {
            if (!window.Modernizr.cssanimations) return g(), void $("#carousel").hide();
            l(), f()
        } else g(), $("#carousel").hide()
    }
    var l, m, n, o, p, q = {
        activeIndex: 0,
        cycle: !1,
        delay: 1e4,
        timer: !1
    };
    return l = function () {
        var a;
        return function () {
            return a ? a.show() : (a = $("#carousel"), a.html(c()), a.find("div.s-arrow-white-left").on("click", function () {
                q.swipe.scrollToPage("prev", 0)
            }), a.find("div.s-arrow-white-right").on("click", function () {
                q.swipe.scrollToPage("next", 0)
            }), o = a.find("div.slides").find("li"), n = $(o.slice(1, q.items.length + 1)), p = a.find("div.tabs").find("li"), p.find("a").on("click", function () {
                return b(p.index($(this).closest("li")[0])), !1
            }), void a.hover(function () {
                m = !0, i()
            }, function () {
                m = !1, h()
            }))
        }
    }(), {
        init: function (a) {
            $.extend(q, a), $.Topic("breakpoint").subscribe(k)
        },
        options: q,
        setBreakpoint: k
    }
}(), eng.list = {
    galleries: [],
    posts: null
}, eng.list.buildGallery = function (a) {
    var b, c, d, e = a.rows.length;
    if (b = $("#gallery-" + a.id + "-placeholder").closest("article.post").find("div.post-meta"), !b.find("div.meta-gallery").length) {
        for (html = ["<div class=meta-gallery><h4>" + a.headline + "</h4><ul>"], c = -1; ++c < e;) d = a.rows[c], d && html.push("<li><a class=gallery-link href='" + d.url + "'><img src=//o.aolcdn.com/js/x.gif data-original='" + d.img + "' width=94 height=94 class=lazy></a></li>");
        html.push("</ul><p><a class=gallery-link href=" + a.url + ">See all photos</a></p><p class=photo-number>" + a.total + " Photos</p>"), b.prepend(html.join(""))
    }
}, eng.list.gallery = function (a) {
    eng.list.galleries.push(a)
}, eng.list.init = function () {
    eng.list.posts = $("article.post"), eng.list.posts.find("div.post-body").find("img[data-original], iframe[data-original]").addClass("lazy"), $.Topic("breakpoint").subscribe(eng.list.setBreakpoint), eng.list.posts.fitVids(), eng.list.posts.addClass("post-ready"), $(".post-header").unbind().click(function (a) {
        1 !== a.which || a.metaKey || a.shiftKey || a.ctrlKey || (window.location = $(this).closest(".post-header").find("h2>a").first().attr("href"))
    }), $(".meta-gallery ul").each(function (a, b) {
        $(".meta-gallery p .gallery-link").click(function () {
            _gaq.push(["_trackEvent", "Homepage Post", "Click on gallery " + a, "See all photos link"])
        }), $(b).children().each(function (b, c) {
            $(c).click(function () {
                _gaq.push(["_trackEvent", "Homepage Post", "Click on gallery " + a, "Thumbnail " + b])
            })
        })
    }), $(".share-more-toggle").click(function () {
        $(this).closest(".read-more").find(".share-more").slideToggle("fast")
    }), eng.utils.localTimes(), eng.utils.timeago(".timeago", !1), $("#aol-newsletter, #aol-newsletter2").aolNewsletter({
        list: "Engadget Main"
    })
}, eng.list.hotComments = function () {
    $("article.post", "#body").find("span.comment-count").each(function () {
        parseInt($(this).find("span.livefyre-commentcount").text(), 10) > 20 && $(this).addClass("hot")
    })
}, eng.list.setBreakpoint = function (a) {
    eng.list.setBreakpointImages(a), eng.list.setBreakpointGalleries(a), eng.list.setBreakpointSocial(a), eng.lazy.init(eng.list.posts)
}, eng.list.setBreakpointGalleries = function () {
    var a = !1;
    return function (b) {
        a || 768 > b || (a = !0, $.each(eng.list.galleries, function () {
            eng.list.buildGallery(this)
        }), eng.gallery.initLinks())
    }
}(), eng.list.setBreakpointImages = function () {
    var a, b = [];
    return a = $("<img class='post-image' src=//o.aolcdn.com/js/x.gif>"),
        function (c) {
            var d, e, f, g;
            d = eng.list.posts, c > 480 || (e = "mobile", g = 80, f = 48, -1 === $.inArray(e, b) && (b.push(e), d.not(".minipost").each(function () {
                var b, c, d;
                c = $(this), d = c.data("image"), void 0 !== d && (d = window.bs.resizeImage(d, g, f), b = a.clone().addClass("post-image-" + e), "desktop" === e ? (c.find("div.post-body").find("img:first").remove(), b.addClass("lazy"), b.attr("data-original", d)) : b.attr("src", d), c.find("header.post-header").append(b))
            })))
        }
}(), eng.list.setBreakpointSocial = function () {
    var a;
    return function (b) {
        a || 768 > b || eng.share.init()
    }
}(), eng.modal = function () {
    function a() {
        var a = ["<div class=modal>", "<div class=modal-outer>", "<div class=modal-inner>", "<a class='s-icn-close modal-close' href=#></a>", "<div class=modal-contents></div>", "<div id=modal-ad></div>", "</div>", "</div>", "</div>"];
        return eng.modal.isPrepared || a.splice(0, 0, "<div class=modal-backdrop></div>"), a.join("")
    }

    function b(a) {
        eng.modal.isMobile || $("#modal-ad").show(), f(), this.onComplete && this.onComplete.call(this, a)
    }

    function c(a) {
        this.onLoad && this.onLoad.call(this, a)
    }

    function d() {
        eng.modal.isPrepared || ($.Topic("breakpoint").subscribe(e), eng.modal.modal = $(a()), $("body").append(eng.modal.modal), $.Topic("height").subscribe(function (a) {
            i = a, f()
        }), $(document).on("click", "a.modal-close", g).on("click", "div.modal-outer", function (a) {
            return a.target === this ? (g(), !1) : void 0
        }).on("click", "div.modal-backdrop", function () {
            return g(), !1
        }), eng.modal.isPrepared = !0)
    }

    function e(a) {
        var b;
        b = eng.modal.isMobile, eng.modal.isMobile = 768 > a, eng.modal.isOpen && eng.modal.isMobile !== b && (eng.modal.isMobile && window.scrollTo(0, 0), f())
    }

    function f() {
        var a, b, c, d, e;
        if (eng.modal.isOpen && eng.modal.modal) {
            if (a = $("body"), b = eng.modal.modal.filter("div.modal"), c = "modal-open-big", eng.modal.isMobile) return a.removeClass(c), void b.removeAttr("style");
            d = b.find("div.modal-inner").outerHeight(), d + 70 > i ? (a.addClass(c), e = eng.modal.pastY - 60, 0 > e && (e = 0), b.css({
                top: e
            })) : (a.removeClass(c), b.removeAttr("style"))
        }
    }

    function g() {
        return eng.modal.isOpen ? ($("#modal-ad").hide(), $("body").removeClass("modal-open"), $(window).scrollTop() != eng.modal.pastY && window.scrollTo(0, eng.modal.pastY), eng.modal.isOpen = !1, eng.modal.modal && eng.modal.modal.find("div.modal-contents").empty(), $(document).unbind("keyup"), !1) : !1
    }

    function h(a) {
        var e, f, g, h;
        e = $("body"), g = $(window), eng.modal.modal && eng.modal.modal.find("div.modal-contents").empty(), eng.modal.isOpen || (eng.modal.pastY = g.scrollTop()), e.addClass("modal-open modal-loading"), eng.modal.isOpen = !0, d(), f = eng.modal.modal, a.modal = f, h = a.url.split(" "), $.ajax({
            url: h[0],
            success: function (d) {
                var g;
                g = $(d), h.length > 1 && (g = g.find(h[1])), c.call(a, g), e.removeClass("modal-loading"), f.find("div.modal-contents").append(g), b.call(a, g)
            }
        })
    }
    var i;
    return {
        isMobile: !1,
        isOpen: !1,
        isPrepared: !1,
        modal: null,
        pastY: null,
        checkHeight: f,
        close: g,
        open: h
    }
}(), eng.pr = {}, eng.pr.init = function () {
    var a, b;
    a = $(".pr_box_button, #pr_box_button"), b = "open", a.on("click", function () {
        var a = $(this).parent("div.pr_box,#pr_box"),
            c = "Hide Press Release";
        a.hasClass(b) && (c = "Show Full PR Text"), a.toggleClass(b), $(this).text(c)
    })
}, eng.rail = {
    loaded: !1,
    options: {}
},
eng.taglist = {

}
, eng.rail.init = function (a) {
    a && (eng.rail.options = a), $.Topic("breakpoint").subscribe(eng.rail.setBreakpoint)
}, eng.taglist.init = function (a) {
	eng.utils.timeago(".timeago",!1);

}, eng.rail.receivedHtml = function (a) {
    var b, c = "#rail-asl",
        d = "#rail-google-afc",
        e = "#google_afc_results",
        f = ".google-afc-container";
    b = $(a).children().not(c), b = b.not(d), b.each(function () {
        var a;
        a = $(this), $("#" + a.attr("id")).replaceWith(a)
    }), $(".quote cite>a", "#rail").each(function () {
        $(this).attr("href", "http://twitter.com/" + $(this).text().replace(/^@/, ""))
    }), window.ASL = {
        cfg: {
            pid: 2360772,
            type: "0",
            k: "www.engadget.com/",
            placements: [{
                placementId: 1530651,
                numAds: 3,
                pageElements: ["rail-asl"]
            }]
        }
    }, $(d).length > 0 && "placeholder" !== $(e).html() && ($(d).empty().html($(e).html()), $(f).css({
        display: "block"
    }), $(e).html("")),eng.utils.langtimeago(".rail-latest .time-stamp")
}, eng.rail.setBreakpoint = function (a) {
    var b;
    eng.rail.loaded || 768 > a || (eng.rail.loaded = !0, b = eng.rail.options.url, b || (b = window.location.href), $.ajax({
        url: b,
        data: {
            rail: "rail"
        },
        dataType: "html"
    }).done(eng.rail.receivedHtml))
}, eng.search = function () {
    function a() {
        window.google.setOnLoadCallback(function () {
            var a, b;
            a = new window.google.search.CustomSearchControl(eng.search.cx), a.setResultSetSize(window.google.search.Search.FILTERED_CSE_RESULTSET), b = new window.google.search.DrawOptions, b.enableSearchResultsOnly(), a.draw("search", b), a.execute(eng.search.query), eng.search.csc = a, eng.search.cso = b
        }, !0)
    }

    function b() {
        var a;
        a = getQueryString().q, $("#nav-search-input").val(a), eng.search.query = a;
        var search_query = a;
        var pageOptions = {	'pubId' : 'partner-aol-de-engadget',
        												'channel':'engadget',
        												'numRepeated':2, 
        												'query' : search_query,
        												'adtest': "off",
        												'sellerRatings': "true",
        												'hl' : 'de',
        												'siteLinks': "true",
        												'instantPreviews': 0,
        												'oe': "utf-8",
        												'ie': "utf-8",
        												'adPage': 1,
        												'adSafe': "high",
        												'domainLinkAboveDescription': "true",
        												'plusOnes': 0,
        												'location': "true",
        												'colorLocation': "#000000",
        												'fontSizeLocation': 14};
				var adBlocks = [ ];
				var defaultAdBlockOptions = {'lines' : 3,
																		'detailedAttribution': "false",
																		'longerHeadlines' : "true",
																		'linkTarget' : "_blank",
																		'fontSizeTitle': 14,
																		'fontSizeDescription': 14,
																		'fontSizeDomainLink': 14,
																		'colorTitleLink': '#3399CC',
																		'colorDomainLink': '#3399CC'};
		adBlocks.push($.extend({},{'container' : 'google-csa-1',"targetdiv": "#google-csa-1", "minTop":0,"maxTop":3},defaultAdBlockOptions));
		adBlocks.push($.extend({}, {'container' : 'google-csa-2',"targetdiv": "#google-csa-2", "number":3},defaultAdBlockOptions));
		_googCsa('ads', pageOptions, adBlocks[0], adBlocks[1]);
		
    }
    return {
        csc: null,
        cso: null,
        cx: "017413276943390660056:oqiydnyoama",
        query: "",
        execute: a,
        init: b
    }
}(), eng.engadgetScore = function () {
    function a() {
        var a = jQuery("#gdgt-result ul li span");
        $(a).each(function (a, b) {
            if ($(b).text().length > 0) {
                "true" == $(b).attr("data-editors-choice") && $(b).addClass(".editors-choice");
                var c = parseInt($(b).text());
                c >= 0 && 59 >= c && $(b).addClass("bad"), c >= 60 && 79 >= c && $(b).addClass("not-good"), c >= 80 && 89 >= c && $(b).addClass("good"), c >= 90 && 100 >= c && $(b).addClass("good")
            }
        })
    }
    return {
        execute: a
    }
}(), eng.disqus = function () {
    function a() {
        $("#disqus_thread").empty(), lab.script("http://engadget2.disqus.com/embed.js")
    }

    function b(a) {
        var b;
        for (b in a) window["disqus_" + b] = a[b];
        $.Topic("breakpoint").subscribe(c)
    }
    var c;
    return c = function () {
        var b;
        return function (c) {
            var d;
            b || (b = 1, c >= 768 ? a() : (d = $("<a class=button id=dsq-loader href=#>Show Comments</a>"), d.on("click", function () {
                return a(), !1
            }), d.appendTo("#disqus_thread")))
        }
    }(), {
        init: b
    }
}(), eng.livefyre = function () {
    function a() {
        $("#lf_comment_stream").empty(), lab._script("http://engadget.ep.livefyre.com/media/ZW5nYWRnZXQuZXAubGl2ZWZ5cmUuY29t/javascripts/customprofiles.js")._script("http://zor.livefyre.com/wjs/v3.0/javascripts/livefyre.js").wait(b)
    }

    function b() {
        var a, b, c;
        a = new fyre.conv.SPAuthDelegate({
            engage: {
                app: "login.aoltech.com",
                type: "redirect"
            },
            profiles: {
                type: "redirect"
            }
        }), c = {
            authDelegate: a,
            network: e.domain
        }, b = {
            articleId: e.articleId,
            checksum: e.checksum,
            collectionMeta: e.collectionMeta,
            el: "lf_comment_stream",
            siteId: e.siteId
        }, fyre.conv.load(c, [b])
    }

    function c(a) {
        e = a, $.Topic("breakpoint").subscribe(d)
    }
    var d, e;
    return d = function () {
        var b;
        return function (c) {
            var d;
            b || (b = 1, c >= 768 ? a() : (d = $("<a class=button id=lf_loader href=#>Show Comments</a>"), d.on("click", function () {
                return a(), !1
            }), d.appendTo("#lf_comment_stream")))
        }
    }(), {
        init: c,
        options: e
    }
}(), eng.reviews = {}, eng.reviews.init = function () {
    $("article.review-card").each(eng.reviews.initCard)
}, eng.reviews.initCard = function () {
    var a, b;
    a = $(this), b = a.data("image"), b.length > 0 && (b = bs.resizeImage(b, 320, 140), a.find("a.review-header").css("background-image", "url(" + b + ")"))
}, eng.events = function () {
    function a() {
        $("article.event").not(".event-highlight").each(function () {
            c(this, 320, 140)
        })
    }

    function b() {
        var a;
        a = {
            320: [320, 140],
            480: [440, 140],
            768: [724, 400],
            980: [940, 416]
        }, $.Topic("breakpoint").subscribe(function (b) {
            var d;
            d = a[b], $("article.event-highlight").each(function () {
                c(this, d[0], d[1])
            })
        })
    }

    function c(a, b, c) {
        var d, e;
        d = $(a), e = d.data("image"), e = bs.resizeImage(e, b, c), d.find("a.event-header").css("background-image", "url(" + e + ")")
    }

    function d() {
        a(), b()
    }
    return brap = "", {
        init: d
    }
}(), eng.faq = {}, eng.faq.init = function () {
    $("div.answer", "div.faq-list").each(function () {
        $(this).hide()
    }), $("h3", "div.faq-list").click(function () {
        var a = $(this).next("div.answer");
        a.hasClass("showing") || ($("div.showing", "div.faq-list").slideUp("fast").removeClass("showing"), a.slideDown("fast").addClass("showing"))
    })
}, eng.omni = function () {
    function a(a) {
        d || (d = !0, 768 > a && (e.channel = "de.engadget_mb"), b())
    }

    function b() {
        window.s_account = "aoldegermanytotal", lab._script("//o.aolcdn.com/omniunih_int.js").wait(function () {
            s_265.campaign = s_265.getQueryParam("icid"), s_265.mmxgo = !0, $.extend(s_265, e), s_265.t()
        })
    }

    function c(b) {
        b || (b = {}), $.extend(e, b), $.Topic("breakpoint").subscribe(a)
    }
    var d, e;
    return e = {
        channel: "de.engadget",
        linkInternalFilters: "javascript:",
        pageName: document.title,
        prop1: "Engadget",
        prop8: "bss:401",
        prop12: document.location,
        pfxID: "weg"
    }, {
        init: c
    }
}(), eng.share = {}, eng.share.init = function () {
    var a;
    return function () {
        return a ? void eng.share.start() : void eng.share.load()
    }
}(), eng.share.load = function () {
    lab._script("//o.aolcdn.com/os_merge/?file=/aol/jquery.getjs.min.js&file=/aol/jquery.inlinecss.min.js&file=/aol/jquery.openwindow.min.js&file=/aol/jquery.shorturl.min.js&file=/aol/jquery.sonar.min.js&file=/aol/jquery.aolshare.min.js&file=/aol/jquery.facebooksocial.min.js").wait(eng.share.start)
}, eng.share.start = function () {
    $("a.aol-share-placeholder").aolShare({
        services: ["facebook", "twitter", "googleplus"],
        bitly: {
            apiKey: "R_f7ad5bd9aa104514baabe61a5de72bd0",
            userName: "engadget"
        },
        templates: {
            twitter: {
                twitterStatus: "url={{url}}&text={{title}}&via=de_engadget"
            }
        },
        css: {
            standard: [".aol-share a{  }"]
        },
        plugins: {
            facebook: {
                className: "s-btn-fb",
                useShortUrl: 1
            },
            twitter: {
                className: "s-btn-tw",
                useShortUrl: 1
            },
            googleplus: {
                className: "s-btn-gplus",
                useShortUrl: 1
            }
        }
    }), $("a.aol-share-placeholder-minor").aolShare({
        services: ["pinterest", "stumbleupon", "reddit"],
        bitly: {
            apiKey: "R_f7ad5bd9aa104514baabe61a5de72bd0",
            userName: "engadget"
        },
        templates: {
            twitter: {
                twitterStatus: "url={{url}}&text={{title}}&via=de_engadget"
            }
        },
        css: {
            standard: [".aol-share a{  }"]
        },
        plugins: {
            pinterest: {
                className: "s-btn-pint",
                useShortUrl: 1
            },
            stumbleupon: {
                className: "s-btn-stupon",
                useShortUrl: 1
            },
            reddit: {
                className: "s-btn-reddit",
                useShortUrl: 1
            }
        }
    }), $("a.aol-share-placeholder-all").aolShare({
        services: ["facebook", "twitter", "googleplus", "pinterest", "stumbleupon", "reddit"],
        bitly: {
            apiKey: "R_f7ad5bd9aa104514baabe61a5de72bd0",
            userName: "engadget"
        },
        templates: {
            twitter: {
                twitterStatus: "url={{url}}&text={{title}}&via=de_engadget"
            }
        },
        css: {
            standard: [".aol-share a{  }"]
        },
        plugins: {
            facebook: {
                className: "s-btn-fb",
                useShortUrl: 1
            },
            twitter: {
                className: "s-btn-tw",
                useShortUrl: 1
            },
            googleplus: {
                className: "s-btn-gplus",
                useShortUrl: 1
            },
            pinterest: {
                className: "s-btn-pint",
                useShortUrl: 1
            },
            stumbleupon: {
                className: "s-btn-stupon",
                useShortUrl: 1
            },
            reddit: {
                className: "s-btn-reddit",
                useShortUrl: 1
            }
        }
    }), $.facebookSocial({
        options: {
            appId: "166243446745061"
        }
    }), $("[name='aol-facebook-like']").facebookSocial()
}, _when_.eng("eng.share.init"), eng.tips = {}, eng.tips.init = function () {
    $(document).on("click", "a.tips-link", eng.tips.load)
}, eng.tips.load = function () {
    return eng.modal.open({
        onComplete: eng.tips.loaded,
        url: $(this).attr("href") + " #contact"
    }), !1
}, eng.tips.loaded = function () {
    eng.modal.modal.find("form").on("submit", function () {
        var a = $(this);
        return $.post(a.attr("action"), a.serialize(), function (a) {
            eng.modal.modal.find("div.modal-contents").html($(a).find("#contact")), eng.modal.checkHeight()
        }), !1
    }), eng.contact.init()
}, eng.galleries = function () {
    function a(a) {
        $(".knot-slideshow").each(function () {
            $(this).data("knot").build()
        }), b(a)
    }

    function b(a) {
        var b, c;
        if (a >= 768 && "desktop" !== d) b = 260, c = 220;
        else {
            if (!(768 > a && "mobile" !== d)) return;
            b = 189, c = 440
        }
        $("a.gallery").each(function () {
            var a, d;
            a = $(this), d = a.data("image"), d = bs.resizeImage(d, c, b), a.find("img.gall-img").attr("src", d)
        })
    }

    function c() {
        $.Topic("breakpoint").subscribe(a)
    }
    var d;
    return {
        init: c
    }
}(), eng.gallery = function () {
    function a() {
        var a, b, c = (location.protocol, location.hostname, !1);
        if (c) window.console && console.info("jQuery.mmTrack: Comscore tracking is disabled in sandbox.");
        else {
            var d;
            a || (a = document.createElement("iframe"), b = a.style, a.id = "aol-mmtrack", b.display = "none", $(document.body).append(a)), d = "http://" + location.hostname + "/include/blank.html.php", a.src = d + "?ts=" + +new Date;
            var e = {};
            e.pageName = z, e.prop9 = "bsg:" + A, e.prop1 = "gallery", e.prop2 = "gallery", window.s_265.mmxcustom = "http://" + location.hostname + "/include/blank.html.php", s_265.t(e), window.bN_cfg ? window.bN.view() : window.console && console.info("jQuery.aolPhotoGallery: AOL DataLayer Beacon is not configured.")
        }
    }

    function b() {
        x && q && (u = 0 - (x - q.parent().innerWidth()), y = $(".gallery-nav-images-wrapper").width())
    }

    function c() {
        return h(p.index($(this)[0])), !1
    }

    function d() {
        t || (t = !0, $(document).on("click", "a.gallery-image-next", i).on("click", "a.gallery-image-prev", j).on("click", "a.gallery-nav-next", f).on("click", "a.gallery-nav-prev", g).on("click", "a.gallery-nav-image", c), eng.gallery.mmtrack(), $.Topic("width").subscribe(b))
    }

    function e() {
        return q = n.find("div.gallery-nav-images"), w = p.eq(0).outerWidth(!0), x = w * p.length, q.width(x), b(), window.Modernizr.cssanimations && window.Modernizr.touch ? (s = new window.iScroll(q[0], {
            snap: !1,
            disableTouchEvents: !1,
            momentum: !0,
            hScrollbar: !1,
            overflow: "hidden"
        }), void n.addClass("swipeable")) : void 0
    }

    function f() {
        if (y >= x) return !1;
        var a, b;
        return a = n.width() / 2, window.Modernizr.cssanimations && window.Modernizr.touch ? (b = s.x - a, b < s.maxScrollX && (b = s.maxScrollX), s.scrollTo(b, 0, "200ms"), !1) : (b = q.position().left - a, u > b && (b = u), q.stop().animate({
            left: b
        }, 200), !1)
    }

    function g() {
        if (y >= x) return !1;
        var a, b;
        return a = n.width() / 2, window.Modernizr.cssanimations && window.Modernizr.touch ? (b = s.x + a, b > 0 && (b = 0), s.scrollTo(b, 0, "200ms"), !1) : (b = q.position().left + a, b > 0 && (b = 0), q.stop().animate({
            left: b
        }, 200), !1)
    }

    function h(a) {
        var b;
        b = p.removeClass("active").eq(a).addClass("active"), m(b.find("img").attr("src")), eng.gallery.mmtrack();
        var c = b.position().left,
            d = $(".gallery-nav-images").position().left;
        if (w > d + c || d + c + w > y) {
            if (c = y > x ? 0 : -1 * u > c ? -1 * c : u, window.Modernizr.cssanimations && window.Modernizr.touch) return s.scrollTo(c, 0, "200ms"), !1;
            q.stop().animate({
                left: c
            }, 200)
        }
    }

    function i() {
        var a, b;
        return a = p.index(p.filter("a.active")[0]) + 1, b = p.length, a >= b && (a = 0), h(a), !1
    }

    function j() {
        var a;
        return a = p.index(p.filter("a.active")[0]) - 1, len = p.length, 0 > a && (a = len - 1), h(a), !1
    }

    function k() {
        var a;
        d(), eng.modal.isMobile || (htmlAdWH(modalGalleryMNo, "LB", "LB", "AJAX", "modal-ad"), $("#modal-ad").show()), n = $("#gallery"), o = n.find("div.gallery-image img"), o.on("load", eng.modal.checkHeight), a = o.data("image"), a && m(a), p = n.find("a.gallery-nav-image"), e()
    }

    function l() {
        r || (r = !0)
    }

    function m(a) {
        a = bs.resizeImage(a), o.attr("src", a)
    }
    var n, o, p, q, r, s, t, u, v, w, x, y, z, A;
    return v = 300, {
        mmtrack: a,
        init: k,
        initLinks: l,
        goNext: i,
        goPrev: j,
        goTo: h,
        setImage: m
    }
}(), eng.perm = {}, eng.perm.init = function () {
    eng.share.init(),$("div.post-body").fitVids(), eng.utils.localTimes(), gdgt.databox.enable();
    var a = $(".prevpost"),
        b = $(".nextpost"),
        c = a.height(),
        d = b.height();
    c !== d && (a.height() > b.height() ? b.height(a.height()) : a.height(b.height())), $(".postnav a").click(function (a) {
        var b = "";
        switch (a.target.className) {
        case "prevlink":
            b = "Previous text link";
            break;
        case "prevarrows":
            b = "Previous arrow link";
            break;
        case "nextlink":
            b = "Next text link";
            break;
        case "nextarrows":
            b = "Next arrow link"
        }
        _gaq.push(["_trackEvent", "Permalink", "Click on previous/next article", b])
    }), $(".thumbs").each(function (a, b) {
        $(".more.gallery-link").click(function () {
            _gaq.push(["_trackEvent", "Permalink", "Click on gallery " + a, "See all photos link"])
        }), $(b).children().each(function (b, c) {
            $(c).click(function () {
                _gaq.push(["_trackEvent", "Permalink", "Click on gallery " + a, " Thumbnail " + b])
            })
        })
    }), $(".share-more-toggle").click(function () {
        $(this).closest(".read-more").find(".share-more").slideToggle("fast")
    }), $(".meta-tags").hover(function () {
        $(this).css({
            overflow: "visible",
            height: "100%"
        })
    }, function () {
        $(this).css({
            overflow: "hidden",
            height: "1.2em"
        })
    }), $.Topic("breakpoint").subscribe(function (a) {
        if (a > 768 && $("body").hasClass("fullbleed")) {
            var b = $(".post-body img").first().height(),
                c = 30;
            $("#rail").css({
                position: "relative",
                top: b + c + "px"
            })
        }
    }), eng.utils.timeago(".timeago", !0), eng.perm.postnav(), $(".image-container iframe").parents(".image-container").removeClass("image-container")
}, eng.perm.initTitleSlider = function () {
    Modernizr.touch || $(".post-body", "#body").find("img").titleSlider()
}, eng.perm.initTOC = function () {
    var a = eng.utils.ieVersion();
    return 8 > a && a > -1 ? !1 : ($('<ul id="toc"><li class="active"><a href="#body">Table of contents</a></li></ul>').prependTo(".post-body", "#body"), $(".post-body", "#body").children("h2, h3, h4, h5, h6").each(function (a) {
        var b = $(this);
        b.attr("id", "title" + a), $("#toc").append($('<li><a id="link' + a + '" href="#title' + a + '">' + b.text() + "</a></li>"))
    }), $(window).click(function () {
        $("#toc").hasClass("open") && $("#toc").removeClass("open")
    }), $("#toc").find("a").click(function (a) {
        return a.preventDefault(), $toc = $("#toc"), $toc.hasClass("open") ? ($("#toc .active").removeClass("active"), $(this).parent().addClass("active"), $("html,body").animate({
            scrollTop: $($(this).attr("href")).offset().top
        }, "fast"), $toc.removeClass("open")) : $toc.addClass("open"), a.stopPropagation(), !1
    }), $("div.post-body", "#body").waypoint(function (a, b) {
        $("#toc").toggleClass("sticky", "down" === b), a.stopPropagation()
    }), void $("h1,h2,h3,h4,h5,h6", "#body").waypoint(function (a, b) {
        if (void 0 !== $(this).attr("id")) {
            var c = $(this).attr("id"),
                d = $("#toc a[href=#" + c + "]").parent("li");
            "down" === b ? ($("#toc li.active").removeClass("active"), d.addClass("active")) : ($("#toc li.active").removeClass("active"), d.prev().addClass("active"))
        }
        a.stopPropagation()
    }, {
        offset: "10px"
    }))
}, eng.perm.postnav = function () {
    
    $(window).on("scroll", function () {
	var a = $("#header-post-nav"),
	b = $("header.header").offset().top + 38;
        $(document).scrollTop() > b ? a.hasClass("visible") || a.animate({
            top: "30px"
        }, 300).addClass("visible") : a.hasClass("visible") && a.animate({
            top: "-50px"
        }, 300).removeClass("visible")
    })
}, eng.perm.engReviews = function () {
    var a = $(".product-criteria-bar").first(),
        b = function (a) {
            if (a.length > 0) {
                var b = $(window).scrollTop(),
                    c = b + $(window).height(),
                    d = a.offset().top,
                    e = d + a.height();
                return c >= e && d >= b
            }
        },
        c = function (a) {
            var b = $(".engadget-score");
            a >= 90 && 100 >= a ? b.addClass("green") : a >= 80 && 89 >= a ? b.addClass("light-green") : a >= 60 && 79 >= a ? b.addClass("yellow") : a > 0 && 59 >= a ? b.addClass("red") : 0 === a ? (b.addClass("none"), $(".score-card-title").css({
                "margin-left": 0
            })) : (b.addClass("none"), $(".score-card-title").css({
                "margin-left": 0
            }))
        };
    c($(".score-card-title").data("score-engadget"));
    var d = function (a) {
            if (a.length > 0) {
                var b = $(".product-criteria-bar").first().outerWidth(),
                    c = a * b / 10,
                    d = c / b * 100;
                return d
            }
        },
        e = function (a) {
            return a >= 9 && 10 >= a ? "green" : a >= 8 && 8.9 >= a ? "light-green" : a >= 6 && 7.9 >= a ? "yellow" : a > 0 && 5.9 >= a ? "red" : 0 == a ? "none" : void 0
        };
    $(".fill").each(function () {
        var a = $(this).parent().next();
        a.addClass(e(a.find(".score").text()))
    });
    var f = function () {
        $(".fill").each(function () {
            var a = $(this).parent().next().find(".score").text();
            $(this).addClass("filled").addClass(e(a)).animate({
                width: d(a) + "%"
            }, 500)
        })
    };
    b(a) && f(), $(window).on("scroll", function (c) {
        b(a) && 0 === $(".product-criteria-bars .filled").length && (f(), $(this).unbind(c))
    })
}, eng.video = function () {
    function a() {
        $("#video").fitVids(), eng.modal.checkHeight(), eng.modal.isMobile || (htmlAdWH(modalVideoMNo, "LB", "LB", "AJAX", "modal-ad"), $("#modal-ad").show())
    }

    function b() {
        var a, b, c;
        $(document).on("click", ".inline-video-wrapper a.inline-video-link", function (d) {
            d.preventDefault(), a = parseInt(document.documentElement.clientWidth, 10), 480 > a ? (b = 320, c = 194) : a >= 480 && 768 > a ? (b = 440, c = 266) : (b = 630, c = 380);
            var e = $(".inline-video-wrapper").find(".video-inner"),
                f = $(this).data("videoSource") || $(this).attr("data-video-source"),
                g = $.ajax({
                    url: f,
                    data: {
                        svar_PlayerWidth: b,
                        svar_PlayerHeight: c
                    },
                    dataType: "html"
                });
            g.done(function (a) {
                e.empty(), e.append(a)
            }), g.fail(function () {
                console.log("uk: 5min video error!"), e.prepend("<p><strong> Sorry! This video doesn't exist! </strong></p>")
            })
        })
    }

    function c() {
        d || ($(document).on("click", "a.video-link", function () {
            return eng.modal.open({
                url: $(this).attr("href") + " #video",
                onComplete: a
            }), !1
        }), d = !0)
    }
    var d;
    return {
        init: a,
        initLinks: c,
        init5min: b
    }
}(), eng.com = function () {
    window.bN_cfg = {
        h: location.hostname,
        p: {
            dL_ch: "us.engadget",
            dL_dpt: "web : main",
            dL_sDpt: "web : main",
            cms_src: "AMP",
            cobrand: "main"
        }
    }, lab._script("//o.aolcdn.com/os/aol/beacon.min.js").wait(function () {
        jQuery(document).ready(function (a) {
            var b = [],
                c = [];
            a(".beacon-ping-plids").each(function () {
                var c = a(this).data("beacon");
                c.p && c.p.plid && c.p.mnid && (c = c.p, b.push(c.plid + "|" + c.mnid))
            }), a(".beacon-ping-cids").each(function () {
                var b = a(this).data("beacon");
                b.p && b.p.cid && (b = b.p, c.push(b.cid))
            }), bN.set("plids", b.join(","), !0), bN.set("cids", c.join(","), !0), bN.ping("mlt")
        })
    })
}(), eng.beaconTracking = function () {}, eng.liveblog = function () {
    function a(a) {
        $.extend(b, a), LB.start(b)
    }
    var b;
    return b = {
        url: "http://"+data.blogUrl+"/live-update/",
        titleHtml: "",
        sponsorHtml: "",
        mediaBar: window.innerHeight > 600 && document.documentElement.clientWidth > 768
    }, {
        init: a,
        options: b
    }
}(), eng.lazy = function () {
    function a(a) {
        var b;
        a || (a = $("body")), a = $(a), b = a.find("img.lazy, iframe.lazy"), b.removeClass("lazy"), b.each(function () {
            $(this).attr("src", $(this).attr("data-original"))
        })
    }

    function b(b) {
        d ? a(b) : window.setTimeout(function () {
            d = !0, a(b)
        }, 100)
    }
    var c, d;
    return c = {
        offset: function () {
            return 2 * document.documentElement.clientHeight
        },
        triggerOnce: !0
    }, {
        init: b
    }
}(), eng.contact = function () {
    function a() {
        $("input[name=AuthorName]", "form[name=contactForm]").blur(function () {
            b()
        }), $("input[name=AuthorEmail]", "form[name=contactForm]").blur(function () {
            c()
        }), $("textarea[name=Comments]", "form[name=contactForm]").blur(function () {
            d()
        }), $("#sendContactButton", "form[name=contactForm]").click(function (a) {
            return e() ? !0 : (a.preventDefault(), !1)
        })
    }

    function b() {
        var a = $("input[name=AuthorName]", "form[name=contactForm]"),
            b = a.val();
        if (g(b)) return a.addClass("error"), !1;
        var c = /^([a-z0-9_\'\-]+ *)*[a-z0-9]+$/i;
        return c.test(b) ? (a.removeClass("error"), !0) : (a.addClass("error"), !1)
    }

    function c() {
        var a = $("input[name=AuthorEmail]", "form[name=contactForm]"),
            b = f(a.val()),
            c = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
        return g(b) ? (a.addClass("error"), !1) : b.match(c) ? (a.removeClass("error"), !0) : (a.addClass("error"), !1)
    }

    function d() {
        var a = $("textarea[name=Comments]", "form[name=contactForm]"),
            b = f(a.val());
        return g(b) ? (a.addClass("error"), !1) : (a.removeClass("error"), !0)
    }

    function e() {
        var a = !0;
        return b() || (a = !1), c() || (a = !1), d() || (a = !1), a
    }

    function f(a) {
        return a.replace(/^\s+|\s+$/g, "")
    }

    function g(a) {
        return 0 === a.length ? !0 : !1
    }
    return {
        init: a
    }
}(), eng.slideshow = function () {
    function a() {
        $(".knot-slideshow").length && lab._script("//o.aolcdn.com/os/aol/knot/jquery.knot.min.js?2").wait(function () {
            var a = $(".knot-slideshow");          
            $.each(a, function (a, b) {
                var c = $(b),
                    d = c.attr("data-slideshow-magicno"),
                    e = c.attr("data-slideshow-id"),
                    f = c.attr("data-refresh-rate");
                c.knot({
                    data: "/_/slideshow/" + e + "/with-slides",
                    thumbnails: !0,
                    thumbnailStyle: "carousel",
                    thumbnailControls: !0,
                    fullscreen: !0,
                    fullscreenThumbs: !0,
                    fullscreenThumbnailControls: !0,
                    fullscreenAdMN: d,
                    fullscreenAdHeight: "300",
                    fullscreenAdWidth: "250",
                    fullscreenRefreshDivId: ["knotFullscreenAd-1"],
                    galleryID: e,
                    refreshCount: f,
                    contentMap: {
                        entryArray: {
                            path: "slides"
                        },
                        photoSrc: {
                            path: function (a) {
                                return a.image_url_large || a.image_url_template.replace("{size}", "l")
                            }
                        },
                        thumbnail: {
                            path: function (a) {
                                return a.image_url_thumb || a.image_url_template.replace("{size}", "s")
                            }
                        },
                        caption: {
                            path: "text"
                        },
                        title: {
                            path: "title"
                        },
                        type: {
                            path: "type"
                        },
                        mediaId: {
                            path: "_id"
                        },
                        player: {
                            path: "data.video_embed_code"
                        },
                        tweetLink: {
                            path: "data.tweet_link"
                        },
                        body: {
                            path: "text"
                        },
                        quoteSource: {
                            path: "credits"
                        },
                        text: {
                            path: "text"
                        }
                    },
                    onSlideChange: function () {
                        $(".aol-knot-slide-info").hide(), $(".aol-knot-fullscreen-title, .aol-knot-fullscreen-caption").hide()
                    },
                    onSlideChangeComplete: function () {
                        if ($(".slide-number").text($(".aol-knot-active-slide").attr("data-slide-number") + " von "), $(".aol-knot-active-slide").hasClass("aol-knot-slide-quote")) {
                            if (0 == $(".aol-knot-slide-container .aol-knot-slide-quote-inner .quote-title").length) {
                                var a = $(".aol-knot-slide-title").first().text();
                                $(".aol-knot-slide-container .aol-knot-slide-quote-inner").prepend('<h2 class="quote-title">' + a + "</h2>"), $(".aol-knot-fullscreen-wrapper .aol-knot-slide-quote-inner").prepend('<h2 class="quote-title">' + a + "</h2>")
                            }
                            $(".aol-knot-slide-container .aol-knot-slide-quote-middle").fadeIn(500), $(".aol-knot-fullscreen-wrapper .aol-knot-slide-quote-middle").fadeIn(500)
                        } else $(".aol-knot-slide-info").show(), $(".aol-knot-fullscreen-title, .aol-knot-fullscreen-caption").show();
                        var b = $(".adcontainer").outerHeight() + $(".aol-knot-slide-info").outerHeight() > $(".aol-knot-slide-wrapper").outerHeight() ? $(".adcontainer").outerHeight() + $(".aol-knot-slide-info").outerHeight() + 25 + "px" : $(".aol-knot-slide-wrapper").height() + "px";
                        $(".engadget-slideshow-extras").css({
                            height: b
                        })
                    },
                    onUiBuilt: function () {
                        if ($(".gallery-image .aol-knot-slide-text iframe").length > 0 || $(".gallery-image .aol-knot-slide-tweet iframe").length > 0) {
                            var a = -1;
                            $(".gallery-image .aol-knot-slide-text iframe, .gallery-image .aol-knot-slide-tweet iframe").each(function () {
                                a = a > $(this).height() ? a : $(this).height()
                            }), $(".aol-knot-slide-container").height(a), $(".aol-knot-slide").height(a), $(".aol-knot-slide-text-outer").height(a)
                        }
                        $(".aol-knot-thumbs-container").remove(), $(".aol-knot-slide-container .aol-knot-slide").each(function (a, b) {
                            $(b).attr("data-slide-number", a + 1)
                        }), $(".aol-knot-fullscreen-slider .aol-knot-slide").each(function (a, b) {
                            $(b).attr("data-slide-number", a + 1)
                        });
                        var b = document.documentElement.clientWidth;
                        980 > b && $(".gallery-controls").css({
                            top: $(".aol-knot-slide-wrapper").height() + $(".aol-knot-slide-wrapper").offset().top + 15 + "px"
                        })
											
										 $.knotFullscreen.prototype["adInit"] = function(){	 	
					 							d = this.options.fullscreenAdMN,
					 							e = this.options.galleryId,
					 							fullscreen_div_id = '#knotFullscreenAd-' + e ;
					 	
					 							if (d) {
					 										$(fullscreen_div_id).html('<iframe src="http://eu-pn2.adserver.yahoo.com/a?f='+d+'&pn=aol&p=aol-eng&c=sh&l=LREC" width="300" height="250" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" scrolling="no"></iframe>');
					 							}
					 	
					 
					 					}                     
                    
                    },
                    onEnterFullscreen: function () {
                        $(".gallery-controls").clone().prependTo(".aol-knot-fullscreen-wrapper .aol-knot-fullscreen-right-infobar"), $(".aol-knot-fullscreen-wrapper .next").on("click", function (a) {
                            a.preventDefault(), $(".aol-knot-fullscreen-wrapper .aol-knot-nav-next").trigger("click")
                        }), $(".aol-knot-fullscreen-wrapper .prev").on("click", function (a) {
                            a.preventDefault(), $(".aol-knot-fullscreen-wrapper .aol-knot-nav-prev").trigger("click")
                        })
                    },
                    onExitFullscreen: function () {
                        $(".aol-knot-fullscreen-wrapper .gallery-controls").remove()
                    }
                }).bind("knotReady", function () {
                    $.Topic("breakpoint").subscribe(eng.slideshow.rebuild)
                })
            })
        })
    }

    function b() {
        e ? setTimeout(function () {
            $(".knot-slideshow").each(function () {
                $(this).data("knot").build()
            })
        }, 1e3) : e = !0
    }

    function c() {
        $(".gallery-controls .prev").on("click", function (a) {
            a.preventDefault(), $(".aol-knot-slide-container .aol-knot-nav-prev").trigger("click")
        }), $(".gallery-controls .next").on("click", function (a) {
            a.preventDefault(), $(".aol-knot-slide-container .aol-knot-nav-next").trigger("click")
        }), $(".gallery-info .trigger-fullscreen").on("click", function (a) {
            a.preventDefault(), $(".aol-knot-enter-fullscreen").trigger("click")
        })
    }

    function d() {
        ! function () {
            window.gravityInsightsParams = {
                type: "content",
                action: "",
                site_guid: "015756f28e553328b5d358aa09764558"
            };
            var a, b, c, d, e, f, g, h, i, j, k, l, m, n;
            e = function (a) {
                var b;
                return b = document.createElement("script"), b.async = !0, b.src = a, a = document.getElementsByTagName("script")[0], a.parentNode.insertBefore(b, a)
            }, b = "", i = (d = !0 === gravityInsightsParams.useGravityUserGuid ? 1 : 0) ? "" : gravityInsightsParams.user_guid || (null != (l = /grvinsights=([^;]+)/.exec(document.cookie)) ? l[1] : void 0) || "", j = "http://rma-api.gravity.com/v1/api/intelligence", f = (null != (m = window.jQuery) ? null != (n = m.fn) ? n.jquery : void 0 : void 0) || "", h = "iframe", a = gravityInsightsParams.ad || "", c = gravityInsightsParams.cburl || "", g = gravityInsightsParams.pfurl || "", k = "" + j + "/wl?jq=" + f + "&sg=" + gravityInsightsParams.site_guid + "&ug=" + i + "&ugug=" + d + "&id=grv-personalization-17&pl=17" + ("&type=" + h + "&ad=" + a + "&cburl=") + encodeURIComponent(c) + "&pfurl=" + encodeURIComponent(g) + ("&x=" + (new Date).getTime()) + ("undefined" != typeof forceArticleIds && null !== forceArticleIds && forceArticleIds.join ? "&ai=" + forceArticleIds.join(",") : "") + ("undefined" != typeof apids && null !== apids && "" !== apids ? "&apids=" + encodeURIComponent(apids) : ""), b && e(b), k && (window.gravityInsightsParams.sidebar && (window.gravityInsightsParams.wlStartTime = (new Date).getTime()), e(k))
        }()
    }
    var e = !1;
    return {
        init: a,
        rebuild: b,
        controls: c,
        gravity: d
    }
}(), eng.messagebar = function () {
    function a() {
        var a = $("#country-msg"),
            b = $("#categories-modal"),
            c = $("#dropdown-more"),
            d = $("#mobile-dropdown-container"),
            e = $("#dropdown-events"),
            f = $("#dropdown-edition"),
            g = a.parents("#header").find("div.header-ad-banner"),
            h = parseInt(b.css("top"), 10),
            i = parseInt(c.css("top"), 10),
            j = parseInt(d.css("top"), 10),
            k = parseInt(e.css("top"), 10),
            l = parseInt(f.css("top"), 10),
            m = function (g) {
                if (!(a.length < 1)) {
                    var m = a.outerHeight();
                    b.css({
                        top: g ? h + m : h
                    }), c.css({
                        top: g ? i + m : i
                    }), d.css({
                        top: g ? j + m : j
                    }), e.css({
                        top: g ? k + m : k
                    }), f.css({
                        top: g ? l + m : l
                    })
                }
            },
            n = function (a) {
                var b = document.documentElement.clientWidth,
                    c = b >= 980 ? "-5px" : "-18px";
                a ? g.css({
                    marginTop: "28px"
                }) : g.stop().animate({
                    marginTop: c
                }, 600)
            };
        1 == a.length && "none" !== a.css("display") && (m(!0), n(!0)), a.on("click", ".edition-yes,.edition-no,.edition-exit", function () {
            var b = $(this),
                c = "gdgt_edition",
                d = $.trim(b.data("edition")),
                e = "gdgt_msg_viewed",
                f = "1",
                g = new Date;
            g.setTime((Date.now() || (new Date).getTime()) + 31536e6);
            var h = g.toGMTString();
            document.cookie = c + "=" + d + "; expires=" + h + "; domain=.engadget.com; path=/";
            var i = document.cookie.match(/gdgt_msg_viewed\s*=\s*1/i);
            i || (document.cookie = e + "=" + f + "; expires=" + h + "; domain=.engadget.com; path=/"), a.slideUp(800, function () {
                a.css({
                    display: "none"
                })
            }), m(!1), n(!1)
        }), setTimeout(function () {
            a.length < 1 || "none" === a.css("display") || a.find(".edition-yes").trigger("click")
        }, 5e3)
    }
    return {
        init: a
    }
}();
var Validator = {
    messages: {},
    messagesLoaded: !1,
    optional: function () {
        return !0
    },
    recaptcha: function () {
        return !0
    },
    isAlpha: function (a, b) {
        var c = /^[A-Za-z]+$/;
        return c.test(b)
    },
    isAlphaNumeric: function (a, b) {
        var c = /^[A-Za-z0-9]+$/;
        return c.test(b)
    },
    isNumeric: function (a, b) {
        return !isNaN(b)
    },
    isMeridian: function (a, b) {
        return !!b.match(RegExp("^(a|p)m$", "i"))
    },
    isInteger: function (a, b) {
        var c = parseInt(b, 10);
        return c === b - 0
    },
    hasMinLength: function (a, b, c) {
        return b.length >= c
    },
    hasMaxLength: function (a, b, c) {
        return b.length <= c
    },
    required: function (a, b) {
        return b && b.length && "" != b && null != b ? !0 : !1
    },
    isEmail: function (a, b) {
        return b.match(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i)
    },
    isPostalCode: function (a, b) {
        var c = /^[\dA-Z\s-]+$/;
        return c.test(b)
    },
    isIpAddress: function (a, b) {
        var c = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        return c.test(b)
    },
    matchesOther: function (a, b, c) {
        return input = a.find('input[name="' + c + '"], textarea[name="' + c + '"]'), b == input.val()
    },
    validDate: function (a, b) {
        var c = b.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (!c || 4 != c.length) return !1;
        var d = new Date(b);
        return c[0] == b && d.getMonth() == c[1] - 1 && d.getDate() == c[2] && d.getFullYear() == c[3]
    },
    validTime: function (a, b) {
        var c = b.split(":");
        return 2 !== c.length && 2 != c[0].length && 2 != c[1].length ? !1 : c[0] >= 0 && c[0] <= 23 || c[1] >= 0 && c[1] <= 59
    },
    validDateMonthOrYear: function (a, b) {
        var c = b.split("/");
        switch (c.length) {
        case 1:
            return this.validDate(a, "01/01/" + b);
        case 2:
            return this.validDate(a, c[0] + "/01/" + c[1]);
        case 3:
            return this.validDate(a, b);
        default:
            return !1
        }
    },
    isBeforeDate: function (a, b, c) {
        if (input = a.find('input[name="' + c + '"][type="date"]'), !input || !input.val()) return !0;
        var d = new Date(input.val()),
            e = new Date(b);
        return e.getTime() < d.getTime()
    },
    isFutureDate: function (a, b) {
        var c = new Date(b);
        return c.getTime() > Date.now()
    },
    isPastDate: function (a, b) {
        return !this.isFutureDate(a, b)
    },
    doesntMatchOther: function (a, b, c) {
        return !this.matchesOther(a, b, c)
    },
    greaterThan: function (a, b, c) {
        return b > c
    },
    greaterThanOrEqual: function (a, b, c) {
        return b >= c
    },
    lessThan: function (a, b, c) {
        return c > b
    },
    lessThanOrEqual: function (a, b, c) {
        return c >= b
    }
};
! function ($) {
    var FormHandler = function (passed_form) {
        this.form = passed_form, this.name = this.form.attr("name"), this.rules = eval("(" + this.form.find('input[name="_' + this.name + '_rules"]').val() + ")"), this.form.bind("submit", {
            handler: this
        }, function (a) {
            var b, c, d = !0,
                e = a.data.handler;
            e.form.find(".submit").addClass("disabled");
            for (var f in e.rules)
                if (b = e.form.find('input[name="' + f + '"], textarea[name="' + f + '"], select[name="' + f + '"]'), b.length && (c = e.rules[f], c instanceof Array || (c = [c]), !e.applyRules(b, c))) {
                    d = !1;
                    var g = e.form.find(".submit.disabled");
                    if (0 === g.length) {
                        g = e.form.parent().siblings(".submit.disabled").removeClass("disabled");
                        var h = g.data("textAlt");
                        h && g.data("textAlt", g.text()).find("span").text(h)
                    }
                    e.form.find(".disabled").removeClass("disabled")
                }
            return d || $(e.form).trigger("error"), d
        }), this.applyRules = function (input, rules) {
            var rule, args = [],
                valid = !0,
                rvalid = !0,
                evalstr, message = null,
                field = input.attr("name");
            if ("" == input.val() || "checkbox" == input.attr("type") && !input.prop("checked")) {
                if (-1 != $.inArray("optional", rules)) return !0;
                for (var i = 0, m = rules.length; m > i; i++)
                    if ("object" == typeof rules[i] && "requiredBy" == rules[i][0] && rules[i].validates_with instanceof Array) {
                        for (var requiring_fields = rules[i].validates_with, required_field, j = 0, p = requiring_fields.length; p > j; j++)
                            if (required_field = this.form.find('[name="' + requiring_fields[j] + '"]'), "radio" == required_field.attr("type")) {
                                if (required_field.find(":checked").val()) return this.invalidateField(input, this.getErrorMessage(input, "required"), "required", [field]), !1
                            } else if ("checkbox" == required_field.attr("type")) {
                            if (required_field.prop("checked")) return this.invalidateField(input, this.getErrorMessage(input, "required"), "required", [field]), !1
                        } else if (required_field.is("select")) {
                            if (required_field.children(":selected").val()) return this.invalidateField(input, this.getErrorMessage(input, "required"), "required", [field]), !1
                        } else if ("" != required_field.val()) return this.invalidateField(input, this.getErrorMessage(input, "required"), "required", [field]), !1;
                        return !0
                    }
            }
            if (-1 != $.inArray("validPassword", rules)) return !0;
            if ("object" == typeof rules[0] && "validateIfOtherFieldIs" === rules[0][0] && this.form.find('[name="' + rules[0][1] + '"]').val() != rules[0][2]) return !0;
            for (var i = 0, m = rules.length; m > i && valid; i++) {
                if (rule = rules[i], args = [], rule instanceof Array) {
                    for (var a = 1, n = rule.length; n > a; a++) args.push(rule[a]);
                    rule = rule[0]
                }
                if ("object" == typeof rule) {
                    if (!Validator[rule[0]]) continue;
                    evalstr = "valid = Validator." + rule[0] + "(this.form, input.val()", $.each(rule.validates_with, function (a, b) {
                        evalstr += ', "' + b + '"'
                    }), evalstr += ");", eval(evalstr)
                } else if (Validator[rule])
                    if (message = null, "required" == rule && "checkbox" == input.attr("type")) valid = $('input[name="' + input.attr("name") + '"]:checked').length;
                    else if ("recaptcha" == rule) valid = Validator.recaptcha("recaptcha_response_field", this.name), valid.valid || this.invalidateField($("#recaptcha_error_sibling"), valid.message, "recaptcha", "recaptcha");
                else {
                    if (evalstr = "valid = Validator." + rule + "(this.form, input.val()", args.length)
                        for (var a = 0; a < args.length; a++) evalstr += ", args[" + a + "]";
                    evalstr += ");", eval(evalstr)
                } else $.ajaxSetup({
                    async: !1
                }), $.post("/form/" + this.name + "/validate.json", {
                    rule: rule,
                    field: field,
                    value: input.val(),
                    args: args
                }, function (a) {
                    a.valid || (message = a.message), valid = a.valid
                }, "json"), $.ajaxSetup({
                    async: !0
                });
                valid || (rvalid = !1, message || (message = this.getErrorMessage(input, "object" == typeof rule ? rule[0] : rule, args)), this.invalidateField(input, message, rule, field))
            }
            return rvalid
        }, this.getErrorMessage = function (a, b, c) {
            return this.loadErrorMessages(b), Validator.messages[b] ? c instanceof Array != !1 && c.length ? sprintf(Validator.messages[b], a.attr("name").ucfirst(), c[0]) : sprintf(Validator.messages[b], a.attr("name").ucfirst()) : Validator.messages.generic
        }, this.loadErrorMessages = function (a) {
            1 != Validator.messagesLoaded && Validator[a] && ($.ajaxSetup({
                async: !1
            }), $.post("/form/" + this.name + "/messages.json", {}, function (a) {
                Validator.messagesLoaded = !0, Validator.messages = a
            }, "json"), $.ajaxSetup({
                async: !0
            }))
        }, this.invalidateField = function (a, b, c, d) {
            var e = a.siblings(".message.error-" + d);
            message_container = e.size() >= 0 ? e.show() : a.siblings(".message").show(), message_container.length <= 0 && $(".message.error-" + d).length > 0 && (message_container = $(".message.error-" + d)), message_container.length <= 0 && (message_container = $(document.createElement("p")), message_container.addClass("message error"), a.before(message_container)), a.on("change", function () {
                message_container.text(""), a.off("change", this)
            }).focus(), b && (b = b.replace(/(_|-)/gi, " "), message_container.text(b).show())
        }
    };
    $.fn.form = function () {
        if ("yes" != this.data("handlerBound")) {
            var a = new FormHandler(this);
            this.data("handlerBound", "yes")
        }
        return a
    }, $(document).ready(function () {
        $('form[data-framework="true"]').each(function () {
            $(this).form()
        })
    })
}(jQuery);
var Auth = {};
! function (a) {
    a(document).ready(function () {
        a(document).on("click", ".auth", Auth.handler)
    }), Auth = {
        element_clicked: null,
        element_offset: null,
        xhr: !1,
        checkUsername: function (b, c) {
            Auth.xhr && Auth.xhr.abort(), Auth.xhr = a.get("/a/check_username/", {
                username: b
            }, function (d) {
                a(".check-username").val() == b && (d.success ? (a(".check-username-response").removeClass("taken").text("available").show(), c.text("")) : "Sorry, that username is already in use." == d.message ? a(".check-username-response").addClass("taken").text("taken").show() : (c.html(d.message.toString()), a(".check-username-response").removeClass("taken").text("").hide()))
            }, "JSON")
        },
        handler: function (b) {
            return gdgt.IS_USER_LOGGED_IN ? !0 : (b.stopImmediatePropagation(), b.preventDefault(), Auth.element_clicked = this, Auth.element_offset = a(this).offset(), a("#login-dialog").dialog({
                width: 607,
                modal: !0,
                draggable: !1,
                resizable: !1,
                fluid: !0,
                open: function () {
                    if (a("#username").focus(), a("#register-dialog #fb-root").length) {
                        var c = a("#fb-root");
                        a("#fb-root").remove(), c.appendTo(".login-facebook-block")
                    }
                    a("body").trigger("facebookConnect"), a(document).on("click", ".ui-widget-overlay", function () {
                        a("#login-dialog").dialog("close")
                    });
                    var d = a("#login-reason");
                    d.text(a(b.currentTarget).data("textAuthReason") ? a(b.currentTarget).data("textAuthReason") : d.data("textAuthPrompt")), d.show()
                },
                show: {
                    effect: "fade",
                    duration: 200
                },
                hide: {
                    effect: "fade",
                    duration: 160
                }
            }), _kmq.push(["record", "Opened login modal", {
                origin: "Auth trigger"
            }]), !1)
        }
    }
}(jQuery);
var Core = {};
! function (a) {
    Core = {
        compare: {
            toaster: function (b) {
                b = b.add, a(".compare-banner-category").text(b.category_name), a(".compare-banner-number").text(b.comparison_products), a(".compare-banner-icon").html('<img src="' + b.product_image_url + '" width="25" height="25" alt="" />');
                var c = a("#compare-banner"),
                    d = a("#actions").outerWidth() - a(".action.compare").position().left - 27 - c.outerWidth() / 2;
                c.css({
                    display: "block",
                    opacity: 0,
                    right: d
                }).animate({
                    "margin-top": 0,
                    opacity: 1
                }, 400, function () {
                    setTimeout(function () {
                        c.animate({
                            "margin-top": 7,
                            opacity: 0
                        }, 500, function () {
                            c.css({
                                display: "none",
                                "margin-top": -7
                            })
                        })
                    }, 4e3)
                })
            },
            add: function (b, c, d, e) {
                var f;
                f = b ? {
                    product_id: b
                } : {
                    product_instance_id: c
                }, d && (f.notification = !0), a.post("/a/compare/add", f, function (b) {
                    return b.success ? (e && e(b), a("#compare-shelf").length && (a("#shared-comparison-label").html(b.shared_comparison_label), a(".saved-comparisons-list").html(b.saved_comparisons), a(".saved-comparisons-list li").length <= 0 ? (a(".saved-comparisons-menu").hide(), a(".share-icons").hide(), a(".not-saved").show()) : (a(".saved-comparisons-menu").show(), a(".share-icons").show(), a(".not-saved").hide()), b.facebook_share_url || b.twitter_share_url ? (a(".share-icons").show(), a(".not-saved").hide()) : (a(".share-icons").hide(), a(".not-saved").show())), a(".action.compare").hasClass("comparing") || (a(".action.compare").addClass("comparing"), a(".action.compare span.arrow").show()), void a("#compare-menu").html(b.saved_comparisons)) : b.limit_dialog ? (a(b.limit_dialog).dialog({
                        width: 460,
                        modal: !0,
                        draggable: !1,
                        resizable: !1,
                        closeOnEscape: !1,
                        open: function () {},
                        close: function () {
                            a(this).dialog("destroy");
                            var b = a("#compare-shelf");
                            return b.length && "undefined" != typeof b.data("removedProductRefreshUrl") && "" != b.data("removedProductRefreshUrl") ? void(window.location = b.data("removedProductRefreshUrl")) : void 0
                        },
                        show: {
                            effect: "fade",
                            duration: 200
                        },
                        hide: {
                            effect: "fade",
                            duration: 160
                        }
                    }), a("#compare-limit-dialog .compare-modal-remove").click(function (b) {
                        b.preventDefault(), a(this).parents("li").slideUp(250), a("#compare-limit-dialog .compare-modal-done").addClass("product-removed");
                        var c = a(this).parent().data("productInstanceId");
                        Core.compare.remove(!1, c, function (b) {
                            a('#compare-limit-dialog li[data-product-instance-id="' + c + '"]').remove(), a("#compare-shelf").length && (a("#compare-shelf").data("removedProductRefreshUrl", b.comparison_url), a(".saved-comparisons-list").html(b.saved_comparisons), a("#compare-shelf .saved-comparisons-menu ul li").length <= 0 && a("#compare-shelf .saved-comparisons-menu").hide(), gdgt.SUPPORTS_PUSHSTATE && window.history.replaceState({}, a("title").html(), b.comparison_url))
                        })
                    }), void a("#compare-limit-dialog .compare-modal-done").click(function (b) {
                        b.preventDefault();
                        var c = a(this).data("productId");
                        if (a("#compare-limit-dialog").remove(), a(this).hasClass("product-removed")) {
                            var d = a("#compare-shelf").length <= 0 ? !0 : !1;
                            Core.compare.add(c, !1, d, function (b) {
                                return a("#compare-shelf").length ? void(window.location = b.comparison_url) : void 0
                            })
                        } else if (a("#product").length) {
                            var e = a(".compare-button"),
                                f = e.text();
                            e.removeClass("remove-from-compare success").addClass("add-to-compare"), e.find(".label").text(e.data("textAlt")), e.data("textAlt", f)
                        }
                    })) : void gdgt.notify.error(b.message)
                })
            },
            check: function (b, c, d) {
                var e;
                e = b ? {
                    product_id: b
                } : {
                    product_instance_id: c
                }, a.get("/a/compare/check", e, function (a) {
                    d && d(a)
                })
            },
            remove: function (b, c, d) {
                var e;
                e = b ? {
                    product_id: b
                } : {
                    product_instance_id: c
                }, a.post("/a/compare/remove", e, function (b) {
                    return b.success ? (d && d(b), a("#compare-shelf").length > 0 && (a("#shared-comparison-label").html(b.shared_comparison_label), a(".saved-comparisons-list").html(b.saved_comparisons), a(".saved-comparisons-list li").length <= 0 ? (a(".saved-comparisons-menu").hide(), a(".share-icons").hide(), a(".not-saved").show()) : (a(".saved-comparisons-menu").show(), a(".share-icons").show(), a(".not-saved").hide()), b.facebook_share_url || b.twitter_share_url ? (a(".share-icons").show(), a(".not-saved").hide()) : (a(".share-icons").hide(), a(".not-saved").show())), a("#compare-menu").html(b.saved_comparisons), void(a("#compare-menu li").length <= 0 && (a(".action.compare").removeClass("comparing"), a(".action.compare span.arrow").hide()))) : void gdgt.notify.error(b.message)
                })
            }
        },
        countWords: function (b, c, d, e) {
            var f = c,
                g = a.trim(b.val()),
                h = g.split(/\s+/),
                i = e - h.length;
            1 == i ? f.text(i + " word left").removeClass("negative") : 0 == i ? f.text("0 words left").removeClass("negative") : -1 == i ? f.text("1 word over").addClass("negative") : -1 > i ? f.text(i.toString().replace("-", "") + " words over").addClass("negative") : f.text(i + " words left").removeClass("negative"), 0 > i ? d.addClass("disabled") : d.removeClass("disabled")
        },
        countCharacters: function (b, c, d, e, f) {
            var g;
            if ("undefined" == typeof f && (f = !1), g = f ? a("<b>" + b.val() + "</b>").text().length : b.val().length, e >= g) {
                if (c.text(e - g).removeClass("negative"), a(".negative").length || d.removeClass("disabled"), a("#product-review-form").length) {
                    var h = b.parent().attr("id").substr(17);
                    a("#criteria-" + h + " .comment-error").remove()
                }
            } else if (c.text(e - b.val().length).addClass("negative"), d.addClass("disabled"), a("#product-review-form").length) {
                var h = b.parent().attr("id").substr(17),
                    i = a("#criteria-" + h),
                    j = a("#review-form-criteria-list").data("textLength");
                i.find(".comment-error").length || "undefined" == typeof j || a("#criteria-" + h).append('<p class="comment-error">' + j + "</p>")
            }
        },
        popLoginModal: function () {
            a("#register-dialog").dialog("close"), a("#login-dialog").dialog({
                width: 607,
                modal: !0,
                draggable: !1,
                resizable: !1,
                fluid: !0,
                open: function () {
                    if (a("#username").focus(), a("#register-dialog #fb-root").length) {
                        var b = a("#fb-root");
                        a("#fb-root").remove(), b.appendTo(".login-facebook-block")
                    }
                    a("body").trigger("facebookConnect"), a(document).on("click", ".ui-widget-overlay", function () {
                        a("#login-dialog").dialog("close")
                    })
                },
                show: {
                    effect: "fade",
                    duration: 200
                },
                hide: {
                    effect: "fade",
                    duration: 160
                }
            })
        },
        showFormErrors: function (b, c) {
            b.find(".error").hide(), a.each(c, function (a, c) {
                b.find(".error-" + a).text(c).show()
            })
        },
        buildSlug: function (b, c) {
            var d, e = [];
            "string" == typeof b && (b = [b]), "undefined" == typeof c && (c = "-");
            for (d in b) b[d] && e.push(a.trim(b[d]).toLowerCase().replace(/([^\x20-\x7f]+)/g, "-").replace(/(\W|\_)+/g, "-"));
            return e.join(c)
        },
        fixStack: function () {
            a.browser.msie && 7 == a.browser.version && a("div").parents().each(function () {
                var b = a(this),
                    c = b.css("position");
                ("relative" == c || "absolute" == c || "fixed" == c) && b.hover(function () {
                    a(this).addClass("z-index")
                }, function () {
                    a(this).removeClass("z-index")
                })
            })
        }
    }
}(jQuery), jQuery(function (a) {
    a(document).on("click", ".facebook-connect", function (b) {
        return b.preventDefault(), a(this).hasClass("disabled") ? !1 : void 0
    }), a(document).on("facebookConnect", function () {
        function b(b, c) {
            if (a("#fb-root").length) {
                var d = a("#fb-root");
                a("#fb-root").remove(), d.appendTo(".login-facebook-block")
            }
            jQuery().dialog ? (a("#login-dialog").is(":visible") && a("#login-dialog").dialog("close"), a("#register-dialog").remove(), a(".register").removeClass("triggered"), a('<div id="facebook-register-dialog" />').appendTo("body").html(b), a("#facebook-register-dialog").dialog({
                width: 607,
                modal: !0,
                draggable: !1,
                resizable: !1,
                open: function () {
                    a(".prompt-fb-connect").addClass("triggered"), a("#registration-form").form(), a(document).on("click", ".ui-widget-overlay", function () {
                        a("#facebook-register-dialog").dialog("close")
                    })
                },
                show: {
                    effect: "fade",
                    duration: 200
                },
                hide: {
                    effect: "fade",
                    duration: 160
                }
            }), _kmq.push(["record", "Opened facebook register modal", c])) : (a(".register").removeClass("triggered"), a(".wrapper").html(b))
        }
        return a(".register").hasClass("verified-facebook") ? (a(".facebook-connect").removeClass("disabled"), !0) : (a(document).on("submit", "#facebook-login-form", function (b) {
            var c = a(this);
            b.preventDefault(), a.post(c.attr("action"), c.serialize(), function (b) {
                b.success ? window.location.reload() : ($data = a("<div>" + b.message + "</div>"), $data.find("p.error").filter(function () {
                    return "" !== a(this).text().trim()
                }).addClass("active"), a("#facebook-connect-dialog").replaceWith($data), c.removeClass("disabled"))
            }, "json")
        }), void a.getScript("//connect.facebook.net/en_US/all.js", function () {
            a(".register").addClass("verified-facebook"), a("#fb-root .facebook-connect").removeClass("disabled"), FB.init({
                appId: gdgt.FACEBOOK_APP_ID,
                channelUrl: gdgt.MAIN_URL + "/fb-channel.html",
                oauth: !0,
                cookie: !0,
                status: !0,
                xfbml: !1
            }), FB.getLoginStatus(function (c) {
                c.authResponse ? a.getJSON("/a/facebook_user_test/", function (d, e) {
                    "success" === e && void 0 !== d.next && (d.has_linked_account === !0 ? a(document).on("click", ".facebook-connect", function (b) {
                        b.preventDefault(), a.get(d.next, function () {
                            window.location.reload()
                        })
                    }) : a(document).on("click", "#fb-root .facebook-connect", function () {
                        return a.get(d.next + "?uid=" + c.authResponse.userID, function (a) {
                            a ? b(a, {
                                origin: "Registration form"
                            }) : gdgt.notify.error(a.message)
                        }), !1
                    }))
                }) : a(document).on("click", "#fb-root .facebook-connect", function () {
                    FB.login(function (c) {
                        c.authResponse && a.getJSON("/a/facebook_user_test/", function (d, e) {
                            "success" === e && void 0 !== d.next && a.get(d.next + "?uid=" + c.authResponse.userID, function (a) {
                                a ? "login" === a.type && a.success === !0 ? window.location.reload() : b(a, {
                                    origin: "Registration form"
                                }) : gdgt.notify.error(a.message)
                            })
                        })
                    }, {
                        scope: "email"
                    })
                }), fb_container = null
            })
        }))
    });
    var b = a("body").attr("id");
    ("login" == b || "register" == b) && a("body").trigger("facebookConnect")
}),
function (a) {
    a.fn.isElement = function () {
        return !(null == this.attr("tagName"))
    }, a.fn.ajaxLoader = function () {
        var a = this;
        this.ajaxStart(function () {
            a.show()
        }).ajaxStop(function () {
            a.hide(), a.unbind("ajaxStart").unbind("ajaxStop").unbind("ajaxError")
        }).ajaxError(function () {
            gdgt.notify.error("Oops! Something went wrong. Please try again.")
        })
    }, a(document).ajaxComplete(function (b, c) {
        try {
            var d = a.parseJSON(c.responseText);
            null != d && (d.__r && a(d.__r).each(function () {
                gdgt.toaster.points(this)
            }), d.__total_points && a(window).trigger({
                type: "updateGdgtRep",
                user_rep: d.__total_points
            }), d.__c && a(d.__c).each(function () {
                Core.compare.toaster(this)
            }))
        } catch (b) {}
    }), a(document).on("click", "a.disabled", function (a) {
        a.preventDefault()
    })
}(jQuery), String.prototype.ucfirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1)
};
var sprintf = function () {
        function a(a) {
            return Object.prototype.toString.call(a).slice(8, -1).toLowerCase()
        }

        function b(a, b) {
            for (var c = []; b > 0; c[--b] = a);
            return c.join("")
        }
        var c = function () {
            return c.cache.hasOwnProperty(arguments[0]) || (c.cache[arguments[0]] = c.parse(arguments[0])), c.format.call(null, c.cache[arguments[0]], arguments)
        };
        return c.format = function (c, d) {
            var e, f, g, h, i, j, k, l = 1,
                m = c.length,
                n = "",
                o = [];
            for (f = 0; m > f; f++)
                if (n = a(c[f]), "string" === n) o.push(c[f]);
                else if ("array" === n) {
                if (h = c[f], h[2])
                    for (e = d[l], g = 0; g < h[2].length; g++) {
                        if (!e.hasOwnProperty(h[2][g])) throw sprintf('[sprintf] property "%s" does not exist', h[2][g]);
                        e = e[h[2][g]]
                    } else e = h[1] ? d[h[1]] : d[l++];
                if (/[^s]/.test(h[8]) && "number" != a(e)) throw sprintf("[sprintf] expecting number but found %s", a(e));
                switch (h[8]) {
                case "b":
                    e = e.toString(2);
                    break;
                case "c":
                    e = String.fromCharCode(e);
                    break;
                case "d":
                    e = parseInt(e, 10);
                    break;
                case "e":
                    e = h[7] ? e.toExponential(h[7]) : e.toExponential();
                    break;
                case "f":
                    e = h[7] ? parseFloat(e).toFixed(h[7]) : parseFloat(e);
                    break;
                case "o":
                    e = e.toString(8);
                    break;
                case "s":
                    e = (e = String(e)) && h[7] ? e.substring(0, h[7]) : e;
                    break;
                case "u":
                    e = Math.abs(e);
                    break;
                case "x":
                    e = e.toString(16);
                    break;
                case "X":
                    e = e.toString(16).toUpperCase()
                }
                e = /[def]/.test(h[8]) && h[3] && e >= 0 ? "+" + e : e, j = h[4] ? "0" == h[4] ? "0" : h[4].charAt(1) : " ", k = h[6] - String(e).length, i = h[6] ? b(j, k) : "", o.push(h[5] ? e + i : i + e)
            }
            return o.join("")
        }, c.cache = {}, c.parse = function (a) {
            for (var b = a, c = [], d = [], e = 0; b;) {
                if (null !== (c = /^[^\x25]+/.exec(b))) d.push(c[0]);
                else if (null !== (c = /^\x25{2}/.exec(b))) d.push("%");
                else {
                    if (null === (c = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(b))) throw "[sprintf] huh?";
                    if (c[2]) {
                        e |= 1;
                        var f = [],
                            g = c[2],
                            h = [];
                        if (null === (h = /^([a-z_][a-z_\d]*)/i.exec(g))) throw "[sprintf] huh?";
                        for (f.push(h[1]);
                            "" !== (g = g.substring(h[0].length));)
                            if (null !== (h = /^\.([a-z_][a-z_\d]*)/i.exec(g))) f.push(h[1]);
                            else {
                                if (null === (h = /^\[(\d+)\]/.exec(g))) throw "[sprintf] huh?";
                                f.push(h[1])
                            }
                        c[2] = f
                    } else e |= 2; if (3 === e) throw "[sprintf] mixing positional and named placeholders is not (yet) supported";
                    d.push(c)
                }
                b = b.substring(c[0].length)
            }
            return d
        }, c
    }(jQuery),
    vsprintf = function (a, b) {
        return b.unshift(a), sprintf.apply(null, b)
    };
jQuery(function (a) {
    a(document).on("click", ".disabled", function (a) {
        return a.stopImmediatePropagation(), !1
    });
    var b;
    a("#header").on({
        mouseenter: function () {
            clearTimeout(b);
            var c = a(this),
                d = a("#actions").outerWidth() - (c.position().left + c.outerWidth());
            return a("html").hasClass("webkit") && d > 0 && (d -= 1), a("#header .action").removeClass("active"), a(".action-modal").hide(), c.hasClass("compare") && !c.next(".action-modal").find("li").length ? void c.addClass("active") : (c.addClass("active"), void a("#user-menu").css("right", d).show())
        },
        mouseleave: function () {
            var c = a(this);
            b = setTimeout(function () {
                c.removeClass("active"), a("#user-menu").hide()
            }, 5)
        },
        click: function (b) {
            a(this).is(".publish, .user") && b.preventDefault()
        }
    }, ".action"), a("#header").on({
        mouseenter: function () {
            clearTimeout(b), a(this).show()
        },
        mouseleave: function () {
            var c = a(this);
            b = setTimeout(function () {
                c.hide().prev(".action").removeClass("active")
            }, 5)
        }
    }, "#user-menu"), a("#top-nav").on({
        mouseenter: function () {
            clearTimeout(b), a(this).addClass("active");
            var c = a("#category-list-group");
            "undefined" == typeof c.data("load") && (c.data("load", !0), c.load("/a/category_flyout/", function () {
                hover.length && a("#category-list-" + a.trim(hover.attr("class").replace("active", ""))).show()
            }))
        },
        mouseleave: function () {
            a(this);
            b = setTimeout(function () {
                a("#top-nav li:first-child").removeClass("active")
            }, 5)
        }
    }, "li:first-child"), a("html").hasClass("tablet") && (a("#header").on("touchstart", ".action-modal", function (a) {
        a.stopPropagation()
    }), a("html").on("touchstart", function (b) {
        b.currentTarget;
        a("#top-nav li:first-child").removeClass("active"), a(".action-modal").hide(), a(".action").removeClass("active")
    })), a.ui && a.ui.dialog && (a.ui.dialog.overlay.events = a.map("focus,keydown,keypress".split(","), function (a) {
        return a + ".dialog-overlay"
    }).join(" ")), a(document).on("keyup blur", ".check-username", function () {
        a(this).val().length > 1 ? Auth.checkUsername(a(this).val(), a(this).nextAll(".username-error:first")) : a(".check-username-response").removeClass("taken").text("").fadeOut(160)
    }), a(document).on("click", ".login", function (b) {
        a.Topic("breakpoint").subscribe(function (c) {
            if (c > 480) {
                if (b.preventDefault(), a("#login").length || a("#register").length || a("#api-registration").length || a("#contact-page").length || gdgt.SHOW_CAPTCHA) return !0;
                if (Core.popLoginModal(), a("html").hasClass("lt-ie10") || window.location.href.indexOf(".sandbox.") > -1) {
                    var d, e = a("#login-form").attr("action");
                    d = e.replace(/^https/, "http"), a("#login-form").attr("action", d)
                }
                return !1
            }
        })
    }), a(document).on("click", ".register", function (b) {
        var c = this;
        a.Topic("breakpoint").subscribe(function (d) {
            if (d > 480) {
                if (b.preventDefault(), a("#login").length || a("#register").length || a("#api-registration").length || a("#contact-page").length || gdgt.SHOW_CAPTCHA) return !0;
                var e = a("#login-dialog");
                e.is(":visible") && e.dialog("close"), a(c).hasClass("triggered") ? a("#register-dialog").dialog("open") : a.get("/register/a", function (b) {
                    b ? (e.is(":visible") && e.dialog("close"), a('<div id="register-dialog" />').appendTo("body").html(b), a("#register-dialog").dialog({
                        width: 572,
                        modal: !0,
                        draggable: !1,
                        resizable: !1,
                        open: function () {
                            if (a(".register").addClass("triggered"), a("#registration-form").form(), a("#login-dialog #fb-root").length) {
                                var b = a("#fb-root");
                                a("#fb-root").remove(), b.appendTo(".register-facebook-block")
                            }
                            a("body").trigger("facebookConnect"), a(document).on("click", ".ui-widget-overlay", function () {
                                a("#register-dialog").dialog("close"), a("#register-dialog").parents(".ui-dialog").removeClass("new-register")
                            }), a(this).parents(".ui-dialog").addClass("new-register")
                        },
                        show: {
                            effect: "fade",
                            duration: 200
                        },
                        hide: {
                            effect: "fade",
                            duration: 160
                        }
                    })) : gdgt.notify.error(b.message)
                })
            }
        })
    }), a(document).on("click", ".close-dialog", function (b) {
        b.preventDefault();
        var c = a(this).parents(".ui-dialog-content");
        c.length && c.dialog("close")
    }), a(document).on("click", ".submit-beta-login", function (b) {
        b.preventDefault(), a(this).parents("form").submit()
    }), a(document).on("keypress", ".beta-password", function (b) {
        (b.which && 13 == b.which || b.keyCode && 13 == b.keyCode) && a(this).parents("form").submit()
    }), a(document).on("click", ".submit-login", function (b) {
        b.preventDefault(), a(this).parents("form").submit()
    }), a(document).on("keypress", "#login-form #username, #login-form #password:not(.beta-password), #login-form #remember_me", function (b) {
        (b.which && 13 == b.which || b.keyCode && 13 == b.keyCode) && (b.preventDefault(), a(this).parents("form").submit())
    }), a(document).on("submit", "#login-form", function (b) {
        b.preventDefault(), a(".submit-login").addClass("disabled");
        var c = a(this);
        a.ajax({
            type: "POST",
            url: c.attr("action"),
            data: c.serialize(),
            dataType: "JSON",
            success: function (b) {
                b.success ? location.reload(!0) : ($data = a("<div>" + b.message + "</div>"), $data.find(".recaptcha_controls").length && (window.location = c.attr("action")), c.replaceWith(a("#" + c.attr("id"), $data)), a("#" + c.attr("id")).form(), a("#password").focus())
            },
            xhrFields: {
                withCredentials: !0
            },
            headers: {
                "X-Requested-With": "XMLHTTPRequest"
            }
        })
    }), a(document).on("click", ".submit-register", function (b) {
        b.preventDefault();
        var c = a(this),
            d = a("#registration-form");
        c.addClass("disabled"), d.find("#registration-recaptcha-widget").length ? d.submit() : a.post(d.attr("action"), d.serialize(), function (a) {
            a.success ? window.location = a.next ? a.next : gdgt.MAIN_URL : c.removeClass("disabled")
        }, "json")
    }), a(document).on("submit", "#registration-form", function () {
        var b = a(this);
        return a.ajax({
            type: "POST",
            url: b.attr("action"),
            data: b.serialize(),
            dataType: "JSON",
            success: function (c) {
                !c.success && c.form ? (a.getScript("/a/get_captcha/?dom=registration-recaptcha-widget"), b.html(a("<div>" + c.form + "</div>").find("form").html())) : (a("#registration-form, .register-standard-text").hide(), a(".register-facebook-block").hide().prev().hide(), a("#register-success").show(), a("#register-dialog").dialog("option", "position", "center"))
            },
            xhrFields: {
                withCredentials: !0
            },
            headers: {
                "X-Requested-With": "XMLHTTPRequest"
            }
        }), !1
    }), a(document).on("click", ".resend-verify", function (b) {
        b.preventDefault(), a.post(a(this).data("verifyHref"), {}, function () {
            a("#register-success").length ? a("#register-success-resend").slideDown(400) : a(".unverified-account-message").slideUp(400).next().slideDown(400)
        })
    }), a(document).on("click", ".resend-confirm", function (b) {
        b.preventDefault(), a(this).parent().slideUp(400).prev().slideDown(400)
    }), "login" == a("body").attr("id") && a("#username").focus(), a(".keep-me-signed-in").length > 0 && a(".keep-me-signed-in").live("click", function () {
        a.post("/a/remember_me/", {
            enable: this.checked
        }, function (a) {
            return a.success ? void 0 : void gdgt.notify.error(a.message)
        })
    })
}), eng.messagebar = function () {
    function a() {
        var a = $("#country-msg"),
            b = $("#categories-modal"),
            c = $("#dropdown-more"),
            d = $("#mobile-dropdown-container"),
            e = $("#dropdown-events"),
            f = $("#dropdown-edition"),
            g = parseInt(b.css("top"), 10),
            h = parseInt(c.css("top"), 10),
            i = parseInt(d.css("top"), 10),
            j = parseInt(e.css("top"), 10),
            k = parseInt(f.css("top"), 10),
            l = function (l) {
                if (!(a.length < 1)) {
                    var m = a.outerHeight();
                    b.css({
                        top: l ? g + m : g
                    }), c.css({
                        top: l ? h + m : h
                    }), d.css({
                        top: l ? i + m : i
                    }), e.css({
                        top: l ? j + m : j
                    }), f.css({
                        top: l ? k + m : k
                    })
                }
            };
        1 == a.length && "none" !== a.css("display") && l(!0), a.on("click", ".edition-yes,.edition-no,.edition-exit", function () {
            var b = $(this),
                c = "gdgt_edition",
                d = $.trim(b.data("edition")),
                e = (Date.now() || (new Date).getTime()) + 31536e6;
            document.cookie = c + "=" + d + ";expires=" + e + ";domain=.engadget.com;path=/", a.slideUp(800, function () {
                a.css({
                    display: "none"
                })
            }), l(!1)
        }), setTimeout(function () {
            a.length < 1 || "none" === a.css("display") || a.find(".edition-yes").trigger("click")
        }, 5e3)
    }
    return {
        init: a
    }
}(), eng.nav = function () {
    function a() {
        var a, b, c, d, e = $("#nav-main"),
            f = ($("#nav"), e.find(".shows"), e.find(".shows a")),
            h = ($("#nav-main .more"), e.find(".more a")),
            i = ($("#nav-main .events"), e.find(".events a")),
            j = $("#reviews-link"),
            k = $("#nav-flow"),
            l = $("#dropdown-edition"),
            m = ($("#guest-actions"), function (a, b) {
                b ? a.removeClass("s-icn-arw-gry-down").addClass("s-icn-arw-wh-up") : a.removeClass("s-icn-arw-wh-up").addClass("s-icn-arw-gry-down")
            });
        k.on("mouseenter", ".editions > a", function (a) {
            a.preventDefault(), $("#dropdown-shows, #dropdown-more, #categories-modal, #dropdown-events").hide();
            var b = $(this);
            b.hasClass("dropdownopen") ? window.clearTimeout(g) : (b.addClass("dropdownopen"), m(b.find("i"), !0), l.show())
        }).on("mouseleave", ".editions > a", function () {
            var a = $(this);
            g = window.setTimeout(function () {
                a.removeClass("dropdownopen"), m(a.find("i"), !1), l.hide()
            }, 100)
        }), l.on({
            mouseenter: function () {
                window.clearTimeout(g)
            },
            mouseleave: function () {
                g = window.setTimeout(function () {
                    $(".editions > a").trigger("mouseleave")
                }, 100)
            }
        }), h.on({
            mouseover: function () {
                $(this).hasClass("dropdownopen") ? window.clearTimeout(a) : ($(this).addClass("dropdownopen"), m($(this).find("i"), !0), $("#dropdown-more").show())
            },
            mouseout: function () {
                var b = this;
                a = window.setTimeout(function () {
                    h.removeClass("dropdownopen"), m($(b).find("i"), !1), $("#dropdown-more").hide()
                }, 100)
            }
        }), i.on({
            mouseover: function () {
                $(this).hasClass("dropdownopen") ? window.clearTimeout(b) : ($(this).addClass("dropdownopen"), m($(this).find("i"), !0), $("#dropdown-events").show())
            },
            mouseout: function () {
                var a = this;
                b = window.setTimeout(function () {
                    i.removeClass("dropdownopen"), m($(a).find("i"), !1), $("#dropdown-events").hide()
                }, 100)
            }
        }), j.on({
            mouseover: function () {
                return $("#dropdown-shows, #dropdown-more").hide(), m($(this).find("i"), !0), $("#categories-modal").show(), !1
            },
            mouseout: function () {
                return $("#categories-modal").is(":hidden") || ($("#categories-modal").hide(), m($(this).find("i"), !1)), !1
            }
        }), $("#nav").on({
            mouseover: function () {
                return m($(this).find("i"), !0), $("#guest-actions").hasClass("logged-in") ? $("#user-menu").show() : $("#user-actions-dropdown").show(), !1
            },
            mouseout: function () {
                m($(this).find("i"), !1), $("#guest-actions").hasClass("logged-in") ? $("#user-menu").is(":hidden") || $("#user-menu").hide() : $("#user-actions-dropdown").is(":hidden") || $("#user-actions-dropdown").hide()
            }
        }, "#guest-actions"), $("body").on("mouseenter", "#categories-modal", function () {
            $("#categories-modal").show()
        }), $("body").on("mouseleave", "#categories-modal", function () {
            j.trigger("mouseout")
        }), $("#dropdown-shows").on({
            mouseover: function () {
                window.clearTimeout(c)
            },
            mouseout: function () {
                c = window.setTimeout(function () {
                    f.trigger("mouseout")
                }, 100)
            }
        }), $("#dropdown-more").on({
            mouseover: function () {
                window.clearTimeout(a)
            },
            mouseout: function () {
                a = window.setTimeout(function () {
                    h.trigger("mouseout")
                }, 100)
            }
        }), $("#dropdown-events").on({
            mouseover: function () {
                window.clearTimeout(b)
            },
            mouseout: function () {
                b = window.setTimeout(function () {
                    i.trigger("mouseout")
                }, 100)
            }
        }), $("#user-actions-dropdown").on({
            mouseover: function () {
                $("#guest-actions").trigger("mouseover"), window.clearTimeout(d)
            },
            mouseout: function () {
                d = window.setTimeout(function () {
                    $("#guest-actions").trigger("mouseout")
                }, 100)
            }
        });
        var n = function (a) {
                var b = $("#mobile-dropdown-container");
                return b.css(a ? {
                    position: "fixed"
                } : {
                    position: "absolute"
                }), !1
            },
            o = $("#nav-mini"),
            p = $("#mobile-dropdown-container"),
            q = (p.find(".shows + .inner-dropdown"), p.find(".mobile-reviews + .inner-dropdown")),
            r = p.find(".mobile-reviews + .inner-dropdown + .inner-dropdown"),
            s = p.find("#show-all-cats"),
            t = p.find(".events + .inner-dropdown"),
            u = p.find(".more + .inner-dropdown"),
            v = p.find(".m-editions + .inner-dropdown");
        o.find(".s-icn-menu").on("click touchstart", function (a) {
            a.preventDefault(), p.is(":hidden") ? (p.show(), $("#nav").removeClass("showMiniSearch"), $(this).parent().addClass("dropdownactive")) : (n(!0), $("#categories-all").hide(), $(".inner-dropdown").hide(), s.show(), p.hide(), $(this).parent().removeClass("dropdownactive"))
        }), p.find(".events").on("click touchstart", function (a) {
            a.preventDefault(), t.is(":hidden") ? t.show() : t.hide()
        }), p.find(".more").on("click touchstart", function (a) {
            a.preventDefault(), u.is(":hidden") ? u.show() : u.hide()
        }), p.find(".m-editions").on("click touchstart", function (a) {
            a.preventDefault(), v.is(":hidden") ? v.show() : v.hide()
        }), p.find(".mobile-reviews").on("click touchstart", function (a) {
            a.preventDefault(), r.is(":hidden") && q.is(":hidden") ? (q.show(), r.show(), n(!1), $(window).scrollTop($(".mobile-reviews").offset().top - $("#nav").outerHeight())) : ($("#categories-all").hide(), s.show(), q.hide(), r.hide(), n(!0))
        }), s.on("click touchstart", function (a) {
            a.preventDefault(), $("#categories-all").show(), s.hide(), n(!1), $(window).scrollTop($("#categories-all").offset().top - $("#nav").outerHeight())
        });
        var w = $("#nav-mini .search");
        w.on("click", function (a) {
            a.preventDefault();
            var b = document.documentElement.clientWidth;
            768 > b ? ($("#search-container").show(), $("#nav").toggleClass("showMiniSearch"), $(this).addClass("miniSearch"), p.is(":visible") && o.find(".s-icn-menu").trigger("click")) : ($("#nav").removeClass("showMiniSearch"), $(this).removeClass("miniSearch"))
        }), $("ul.tab-nav").tinyNav({
            header: "Navigation"
        })
    }
    return {
        init: a
    }
}(), eng.homeCes = function () {
    var a = $("#ces-featured-videos"),
        b = $("#videos"),
        c = $("#ces-liveblog"),
        d = $("#liveblogs");
    a.appendTo(b), c.appendTo(d), 0 == d.find(".article").length && d.hide(), eng.ceslivestream(), eng.utils.timeago(".timeago", !1)
}, eng.cesAgenda = function () {
    $("#ceslivestream").fitVids()
}, eng.ceslivestream = function () {
    var a = $(".livestream"),
        b = $(".ces-header"),
        c = $("#homeceslivestream");
    b.appendTo(c), a.appendTo(c), $LAB.script("http://test.mighty.aol.net/mighty.min.js").wait(function () {
        eng.mighty()
    })
}, eng.mighty = function () {
    function a() {
        window.clearInterval(refreshTimeout)
    }
    var b = !0,
        c = 0;
    refreshTimeout = window.setInterval(function () {
        b && 3 > c ? ($(".reload").trigger("click"), c++) : a()
    }, 1500), Mighty && Mighty.subscribe(document.getElementsByClassName("mighty-mini")[0], "render", function () {
        b = !1
    })
};