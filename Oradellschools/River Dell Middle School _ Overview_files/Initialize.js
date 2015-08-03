var homeURL = location.protocol + "//" + window.location.hostname;

function parseXML(xml) {
    if (window.ActiveXObject && window.GetObject) {
        var dom = new ActiveXObject('Microsoft.XMLDOM');
        dom.loadXML(xml);
        return dom;
    }

    if (window.DOMParser) {
        return new DOMParser().parseFromString(xml, 'text/xml');
    } else {
        throw new Error('No XML parser available');
    }
} 

function GetContent(URL, TargetClientID, Loadingtype, SuccessCallback, FailureCallback, IsOverlay) {
    (Loadingtype === undefined ? LoadingType = 3 : '');
    (SuccessCallback === undefined ? SuccessCallback = '' : '');
    (FailureCallback === undefined ? FailureCallback = '' : '');
    (IsOverlay === undefined ? IsOverlay = '0' : '');

    var LoadingHTML;
    var Selector;
    
    switch (Loadingtype)
    {
        //Small
        case 1:
            LoadingHTML = "SMALL LOADER HERE";
            break;
        //Large
        case 2:
          LoadingHTML = "<div class='ui-loading large'></div>";
          break;
        // None
        case 3:
          LoadingHTML = "";
          break;
    }
    
    Selector = "#" + TargetClientID;

    ajaxCall = $.ajax({
        url: URL,
        cache: false,
        beforeSend: function() {
            if (Loadingtype != 3) { BlockUserInteraction(TargetClientID, LoadingHTML, Loadingtype, 0, IsOverlay); }
        },
        success: function(strhtml) { 
            
            // check for calendar and empty div directly surrounding eventlist uc first 
            //      to avoid memory error in IE (Access violation reading location 0x00000018)
            //      need to figure out exactly why this is happening..
            //      Partially to do with this? http://support.microsoft.com/kb/927917/en-us
            //      The error/crash happens when .empty() is called on Selector 
            //          (.html() calls .empty().append() in jquery)
            //      * no one has come across this issue anywhere else in the product so far
             
            if ($(Selector).find('#calendar-pnl-calendarlist').length > 0) {
                $('#calendar-pnl-calendarlist').empty();
                $(Selector).html(strhtml); 
            } else {
                $(Selector).html(strhtml); 
            }
            
            
            // check for tabindex 
            if ($(Selector).find(":input[tabindex='1']:first").length > 0) {
                $(Selector).find(":input[tabindex='1']:first").focus();
            } else {
                $(Selector).find(":input[type='text']:first").not('.nofocus').focus();
            }

            //if (CheckDirty(Selector) === true) { BindSetDirty(Selector); }
            //CheckDirty(Selector);
            BlockUserInteraction(TargetClientID, '', '', 1);
            (SuccessCallback != '' ? eval(SuccessCallback) : '');
        },
        failure: function() {
             BlockUserInteraction(TargetClientID, '', '', 1);            
            (FailureCallback != '' ? eval(FailureCallback) : '');
        }
    });
}

function BlockUserInteraction(TargetClientID, LoadingHTML, Loadingtype, Unblock, IsOverlay) {
	if (LoadingHTML === undefined) {
		LoadingHTML = "<div class='ui-loading large'></div>";
    }
    
    if (Unblock == 1) {
        $('#'+TargetClientID).unblockinteraction();
    } else {
        if (IsOverlay == 1) {
            $('#'+TargetClientID).blockinteraction({message: LoadingHTML, type: Loadingtype, isOverlay: true});
        } else {
            $('#'+TargetClientID).blockinteraction({message: LoadingHTML, type: Loadingtype});
        }
    }
}

function OpenDialogOverlay (OverlayClientID, options, Callback) {  
    var defaults = {
        LoadType: 'U',
        LoadURL: '',
        TargetDivID: '',
        LoadContent: '',
        NoResize: false,
        ScrollTop: false,
        CloseCallback: undefined
    };
            
    jQuery.extend(defaults, options);

    //check what browser/version we're on
    var isIE = GetIEVersion();

    if ((isIE == 0) || isIE >= 11) {
        // IE 11+ and Firefox/Chrome
        $('body').css('overflow', 'hidden');
    } else {
        // IE 10-
        $('html').css('overflow', 'hidden');
    }
    
    var OverlaySelector;
    var BodyClientID;
    var TargetDivSelector;
    var CurrentScrollPosition;

    if (defaults.ScrollTop) {
       $.scrollTo(0, { duration: 0 });
    }
    
    OverlaySelector = "#dialog-overlay-" + OverlayClientID + "-base";
    BodyClientID = "dialog-overlay-" + OverlayClientID + "-body";
    TargetDivSelector = "#" + defaults.TargetDivID;
    
    $(OverlaySelector).appendTo('body');
    //Get current scroll position and adjust the dialog overlay
    CurrentScrollPosition = $(window).scrollTop();
    $("#" + OverlayClientID).css("top", (parseInt(CurrentScrollPosition) + 45) + "px");   
    $("#" + BodyClientID).html("");
    
    if ($.browser.msie) {
    	$(OverlaySelector).show();
    } else {
    	$(OverlaySelector).fadeIn();
    }
    
    if ($.trim($('#dialog-overlay-' + OverlayClientID + '-body').html()) != "") {
        CloseDialogOverlay(OverlayClientID);
    }
    
    // U = URL
    // H - HTML
    // D - Divider

    var success = "";

    if (Callback !== undefined) {
        success += Callback;
    }

    // Block user interaction
    $('#' + BodyClientID).css({'min-height':'100px'});
    BlockUserInteraction(BodyClientID, "<div class='ui-loading large'></div>", 2, 0, 1);

    switch(defaults.LoadType) {
        case 'U':
            GetContent(defaults.LoadURL, BodyClientID, 3, success);
            break;    
        case 'H':
            $("#" + BodyClientID).html(defaults.LoadContent);
            break;
        case 'D':
            $("#" + BodyClientID).html($(TargetDivSelector).html());
            break;

    };

    if (defaults.CloseCallback !== undefined) {
        $(OverlaySelector + ' .ui-dialog-overlay-close').attr('onclick', 'CloseDialogOverlay(\'' + OverlayClientID + '\',' + defaults.CloseCallback + ')')
    }

    // check for tabindex 
    if ($("#" + BodyClientID).find(":input[tabindex='1']:first").length > 0) {
        $("#" + BodyClientID).find(":input[tabindex='1']:first").focus();
    } else {
        $("#" + BodyClientID).find(":input[type='text']:first").focus();
    }
    
    var baseHeight = CurrentScrollPosition + $(window).height();
	$('#dialog-overlay-' + OverlayClientID + '-base').css({'height':baseHeight + "px",'overflow':'auto','top':'0', 'width':'100%', 'left':'0'});
}

function GetIEVersion() {
    var sAgent = window.navigator.userAgent;
    var Idx = sAgent.indexOf("MSIE");

    if (Idx > 0) {
        // If IE, return version number
        return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));
    } else if (!!navigator.userAgent.match(/Trident\/7\./)) {
        // If IE 11 then look for Updated user agent string
        return 11;
    } else {
        //It is not IE
        return 0;
    }
}

// DETERMINE TEXT COLOR 

function rgbstringToTriplet(rgbstring) {
	var commadelim = rgbstring.substring(4,rgbstring.length-1);
	var strings = commadelim.split(",");
	var numeric = [];

	for (var i=0; i<3; i++) { 
	    numeric[i] = parseInt(strings[i]);
	}

	return numeric;
}

function adjustColour(someelement) {
    var rgbstring = someelement.css('background-color');
    var triplet = [];
    var newtriplet = [];

    if (rgbstring != 'transparent') {
        if (/rgba\(0, 0, 0, 0\)/.exec(rgbstring)) {
            triplet = [255,255,255];
        } else { 
            if (rgbstring.substring(0,1).toLowerCase() != 'r') {
                CheckScript('RGBColor', staticURL + '/GlobalAssets/Scripts/ThirdParty/rgbcolor.js');
                // not rgb, convert it
                var color = new RGBColor(rgbstring);
                rgbstring = color.toRGB();
            }
            triplet = rgbstringToTriplet(rgbstring);
        }
    } else {
        triplet = [255,255,255];
    }

    // black or white:
    var total = 0; for (var i=0; i<triplet.length; i++) { total += triplet[i]; }

    if (total > (3*256/2)) {
   	    newtriplet = [0,0,0];
    } else {
        newtriplet = [255, 255, 255];
    }

    var newstring = "rgb(" + newtriplet.join(",") + ")";

    someelement.css('color', newstring);
    someelement.find('*').css('color', newstring);

    return true;
}


// END DETERMINE TEXT color

function CheckScript2(ModuleName, ScriptSRC) {
	$.ajax({
		url: ScriptSRC,
		async: false,
		//context: document.body,
		success: function(html){
			var script = 
				document.createElement('script');
				document.getElementsByTagName('head')[0].appendChild(script);
				script.text = html;
		}
	});
}

// AREA / SCREEN CODES

function setCurrentScreenCode(screenCode) {
    SetCookie('currentScreenCode', screenCode); 
    AddAnalyticsEvent(getCurrentAreaCode(), screenCode, 'Page View');
}

function getCurrentScreenCode() {
	var cookieValue = GetCookie('currentScreenCode');
    return (cookieValue != '' ? cookieValue : 0);
}

function setCurrentAreaCode(areaCode) {
	SetCookie('currentAreaCode', areaCode);
}

function getCurrentAreaCode() {
	var cookieValue = GetCookie('currentAreaCode');
    return (cookieValue != '' ? cookieValue : 0);
}

// END AREA / SCREEN CODES

// CLICK HOME TAB IN HEADER SECTION

function GoHome() {
    window.location.href = homeURL + "/cms/Workspace";
}

// END CLICK HOME TAB IN HEADER SECTION

// HELP PANEL

function OpenHelpPanel() {
    var ScreenCode = getCurrentScreenCode();
    OpenDialogOverlay('HelpPanel', {LoadType : 'U', LoadURL : homeURL + '/GlobalUserControls/HelpPanel/HelpPanelWrapper.aspx?ScreenCode=' + ScreenCode});
}

// END HELP PANEL

// COOKIES
function SetCookie(name, value, days, ms) {
    var expires = "";

    if (ms) {
        var date = new Date();

        date.setMilliseconds(date.getMilliseconds() + ms);
        expires = "; expires=" + date.toGMTString();
    } else if (days) {
        var date = new Date();

        date.setDate(date.getDate() + days);
        expires = "; expires=" + date.toGMTString();
    }

	document.cookie = name + "=" + escape(value) + expires + "; path=/";
}

function GetCookie(name) {
    var value = "";
    
    if (document.cookie.length > 0) {
        var start = document.cookie.indexOf(name + "=");

        if (start != -1) {
            start = start + name.length + 1;

            var end = document.cookie.indexOf(";", start);

            if (end == -1) end = document.cookie.length;
            value = unescape(document.cookie.substring(start, end));
        }
    }

    return value;
}

function DeleteCookie(name) {
    SetCookie(name, '', -1);
}

function SetUnescapedCookie(name, value, days, ms) {
	var expires = "";
    
	if (ms) {
	    var date = new Date();

        date.setMilliseconds(date.getMilliseconds() + ms);
        expires = "; expires=" + date.toGMTString();
    } else if (days) {
        var date = new Date();

		date.setDate(date.getDate() + days);
		expires = "; expires=" + date.toGMTString();
	}

	document.cookie = name + "=" + value + expires + "; path=/";
}
// END COOKIES



// IFRAME FUNCTIONS
function BindResizeFrame(FrameID) {
    $(document).on('load', "#" + FrameID, function() {
		var bodyHeight = $("#" + FrameID).contents().height() + 40;
		$("#" + FrameID).attr("height", bodyHeight + "px");
	});
}

function AdjustLinkTarget(FrameID) {
    $(document).on('load', "#" + FrameID, function() {
		$("#" + FrameID).contents().find("a").attr("target", "_parent");
	});
}

// END IFRAME FUNCTIONS


// SCROLL TOP

function ScrollTop() {
    $.scrollTo(0, { duration: 1000 });
}

// END SCROLL TOP

// ANALYTICS TRACKING

function AddAnalyticsEvent(category, action, label) {
    _gaq.push(['_trackEvent', category, action, label]);
}

// END ANYLYTICS TRACKING


// BEGIN INCLUDE DOC READY SCRIPTS

function IncludeDocReadyScripts() {
	var arrScripts = [
		staticURL + '/GlobalAssets/Scripts/min/external-combined.min.js',
		staticURL + '/GlobalAssets/Scripts/Utilities.js'
		
	];
	
    var script = document.createElement('script');
    script.type = 'text/javascript';

    $.each(arrScripts, function() {
		//script.src = this;
		//$('head').append(script);
		$.ajax({
	        url: this,
	        async: true,
	        cache: true,
	        success: function(msg) {
	            var result = msg.d;
	            script.text = result;

                $('head').append(script);
	        }
        });
    });
   
}

// END INCLUDE DOC READY SCRIPTS

// BEGIN DOCUMENT READY
$(document).ready(function() {
    if ($('#sw-sidebar').height() > 1500) {
        $('#sw-page').css('min-height', $('#sw-sidebar').height() + 'px');
        $('#sw-inner').css('min-height', $('#sw-sidebar').height() + 'px');
    } else {
        $('#sw-page').css('min-height', $(document).height() + 'px');
        $('#sw-inner').css('min-height', $(document).height() + 'px');
    }

    $('#sw-footer').show();

    // add focus class to textboxes for IE
    $(document).on('focus', 'input', function() {
        $(this).addClass('focus');
    });

    $(document).on('blur', 'input', function() {
        $(this).removeClass('focus');
    });

    // default ajax setup
    $.ajaxSetup({
        cache: false,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            //swalert(XMLHttpRequest.status + ' ' + textStatus + ': ' + errorThrown, 'Ajax Error', 'critical', 'ok');
            swalert("Something went wrong. We're sorry this happened. Please refresh your page and try again.", "Error", "critical", "ok");
        }
    });
    
    // make :Contains (case-insensitive version of :contains)
    jQuery.expr[':'].Contains = function(a, i, m) {
        return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase())>=0;
    };

    // HIDE / SHOW DETAILS IN LIST SCREEN
    $(document).on('click', 'span.ui-show-detail', function() {
        var $this = $(this);

        if ($this.hasClass('open')) {
            // do nothing
        } else {
            $this.addClass('open').parent('div.ui-article-header').nextAll('div.ui-article-detail').slideDown(function() {
                // add close button
                $this.append("<span class='ui-article-detail-close'></span>");
            });
        }
    });

    $(document).on('click', 'span.ui-article-detail-close', function() {
        $this = $(this);
        $this.parents('.ui-article-header').nextAll('.ui-article-detail').slideUp(function() {
            $this.parent('.ui-show-detail').removeClass('open');
            // remove close button
            $this.remove();
        });
    });
    

    // LIST/EXPANDED VIEW ON LIST PAGES
    $(document).on('click', '#show-list-view', function() {
        $(this).addClass('ui-btn-toolbar-primary').removeClass('ui-btn-toolbar');
        $('#show-expanded-view').addClass('ui-btn-toolbar').removeClass('ui-btn-toolbar-primary');
        $('div.ui-article-detail').slideUp(function() {
            // remove close buttons
            $(this).prevAll('.ui-article-header').find('.ui-article-detail-close').remove();
            //$this.children('.ui-article-detail-close').remove();
        });
        $('span.ui-show-detail').removeClass('open');
    });

    $(document).on('click', '#show-expanded-view', function(i) {
        $(this).addClass('ui-btn-toolbar-primary').removeClass('ui-btn-toolbar');
        $('#show-list-view').addClass('ui-btn-toolbar').removeClass('ui-btn-toolbar-primary');
        $('div.ui-article-detail').slideDown('', function() {
            // add close buttons
            $(this).prevAll('.ui-article-header').children('.ui-show-detail').append("<span class='ui-article-detail-close'></span>");
        });
        $('span.ui-show-detail').addClass('open');
    });

}); // end document ready

// load scripts after everything else
$(window).load(IncludeDocReadyScripts);