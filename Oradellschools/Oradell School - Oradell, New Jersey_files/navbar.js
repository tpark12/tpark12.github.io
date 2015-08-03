
HoverHideTime = 300;
HoverShowTime = 300;

//document.onclick = new Function("hide()")
var cm = null;

function getPos(el,sProp) {
    var iPos = 0;
    while (el!=null) {
        iPos += el["offset" + sProp];

// this is to compensate for Chrome/Safari handling of offsetTop
// in Chrome / Safari - only when using relative positioning...
        if (sProp == "Left") {
            if (el.style.position == "relative") {
                if (browser.isCh) { return iPos; }
                if (browser.isSa) { return iPos; }
            }
        }

        el = el.offsetParent;
    }
    return iPos;
}

function show(m1,m2,num) {
    m2.style.display='';
    m2.style.left = getPos(m1,"Left") + 'px';
    m2.style.top = getPos(m1,"Top") + m1.offsetHeight + 'px';
    cm = m2;

    if (browser.isIE)
    {
	var ifr = document.getElementById('zumu_nb'+num+'_menu_iframe');
	if (m2.offsetHeight > 25) {

	    //alert(m2.style.marginTop);
	    ifr.style.marginTop = m2.style.marginTop;

	    ifr.style.left = m2.style.left;
	    ifr.style.top  = m2.style.top;
	    ifr.style.width  = m2.offsetWidth + "px";
	    ifr.style.height = m2.offsetHeight + "px";
	    ifr.style.display = "";
	}
    }
}

function hide(m1,num) {
    if (cm) {
        cm.style.display='none';
	if (browser.isIE)
	{
	    var ifr = document.getElementById('zumu_nb'+num+'_menu_iframe');
	    ifr.style.display='none';
	}
    }
}

function zumu_nb_hoverin(m1,m2,num) {
   m1x = document.getElementById(m1);
   m2x = document.getElementById(m2);

   if (m1x.className == 'zumu_nb'+num+'_head_selected') {
       m1x.className = 'zumu_nb'+num+'_head_selected_hoverin';
   }
   else {
       m1x.className = 'zumu_nb'+num+'_head_hoverin';
   }

   if (m1x.showTimeout != null)
      window.clearTimeout(m1x.showTimeout);
   if (m1x.hideTimeout != null)
      window.clearTimeout(m1x.hideTimeout);
   if (m2x != null) {
       if (HoverShowTime <= 0)
	   show(m1x,m2x);
       else
	   m1x.showTimeout = window.setTimeout(function () { show(m1x,m2x,num); }, HoverShowTime);
   }
}

function zumu_nb_hoverout(m1,num) {
   m1 = document.getElementById(m1);

   m1.style.backgroundColor = '';

   if (m1.className == 'zumu_nb'+num+'_head_selected_hoverin') {
	m1.className = 'zumu_nb'+num+'_head_selected';
   }
   else {
	m1.className = 'zumu_nb'+num+'_head';
   }

   if (m1.showTimeout != null)
      window.clearTimeout(m1.showTimeout);
   if (m1.hideTimeout != null)
      window.clearTimeout(m1.hideTimeout);
   if (HoverHideTime <= 0)
       hide();
   else
       m1.hideTimeout = window.setTimeout(function () { hide(m1,num); }, HoverHideTime);
}

function zumu_nb_mouseover(el,num) {
    if (browser.isIE) {
	//el.style.width = "100%";
    }
    el.className = 'zumu_nb'+num+'_menuitem_mouseover';
}

function zumu_nb_mouseout(el,num) {
    if (browser.isIE) {
        //el.style.width = "100%";
    }
    el.className = 'zumu_nb'+num+'_menuitem';
}
