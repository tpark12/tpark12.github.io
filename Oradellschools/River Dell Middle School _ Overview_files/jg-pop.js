/**
 * This is a Schoolwires specific widget that will allow a user to have a popup window work from an announcement.
 * @author Joel Grannas - Creative Director at Schoolwires, Inc. 
 */
$(document).ready(function(){
     	alertClosed = 0;
     checkPopCookie();
	checkWindowResize();
});
function checkWindowResize() {
	$(window).resize(function(){
     		if(alertClosed !== 1){
         	 	checkPopCookie();     	
     		}				  
	});
}

function checkTag(){
     //LOOKS FOR [ALERT] AND ADDS CLASS
     $(".ui-widget.app.announcements .ui-article-description:contains('[ALERT]')").addClass("sw-alert");
	 
}


function runAlert(){
     checkTag();
     //IF THE CLASS EXISTS THEN
     if($(".sw-alert").size()){
        //STRIP OUT [ALERT]
        stripAlert();
        //BUILD DIVS
        buildStructure();
        //RUN FUNCTION TO DISPLAY THE ANNOUNCEMENT
        displayAlert(stripAlert);
        //WRITE COOKIE
        writePopCookie();
     }
}

function stripAlert(){
        //CLEAR ALERT TEXT FROM ANNOUNCEMENT
        if($(".sw-alert").size()){
			stripAlert = $(".sw-alert").html().replace(/\[ALERT\]/i, "");
	        $(".sw-alert").html(stripAlert);
		}
}


function displayAlert(){
    //POPULATE POPUP
    $("#jg-pop-content").html(stripAlert);
    //POSITIONS THE FADEOUT
    browserWidth = $(window).width(); 
    browserHeight = $(window).height();
    $("#jg-pop-fader").css({
           'width' : browserWidth,
           'height' : browserHeight,
           'display' : 'block'
    });
    //POSITIONS THE POPUP BOX
    topValue = (browserHeight - $("#jg-pop-container").height()) / 2;
    leftValue = (browserWidth - $("#jg-pop-container").width()) / 2;
    if(topValue < 0){
          topValue = 0;
    }
    $("#jg-pop-bg").height($("#jg-pop-container").height());
    $("#jg-pop-container").css({
           'top' : topValue,
           'left' : leftValue,
           'display' : 'block'
    });
    //ACTIVATES CLOSE BUTTON
    $("#jg-pop-x").click(function(){
         closeAlert();
    });
}

function closeAlert(){
     alertClosed = 1;
     $("#jg-pop-fader").fadeOut("fast");
     $("#jg-pop-container").fadeOut("fast");
     $("#jg-pop-x").fadeOut("fast");
}

function buildStructure(){
     //BUILD THE DIVS
     $("body").append("<div id='jg-pop-fader'></div><div id='jg-pop-container'><div id='jg-pop-bg'><div id='jg-pop-t'></div><div id='jg-pop-tr'></div><div id='jg-pop-r'></div><div id='jg-pop-br'></div><div id='jg-pop-b'></div><div id='jg-pop-bl'></div><div id='jg-pop-l'></div><div id='jg-pop-tl'></div></div><div id='jg-pop-content'></div><div id='jg-pop-x'></div></div>");
}

function writePopCookie(){
     // Create (or update) the value of a cookie:
     $.cookies.set('popCookie', 'pop', { path: '/', domain: window.location.host });
};

function checkPopCookie(){
         runAlert(); 
};


