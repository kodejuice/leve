// <!-- BEGIN: Signup Form Popup Code from Benchmark Email Ver 4.0  -->

function CheckField_YPLMC(fldName, frm){var fldObj = document.getElementsByName(fldName);if ( fldObj.length > 1 ) {  for ( var i = 0, l = fldObj.length; i < l; i++ ) {   if ( fldObj[0].type == 'select-one' ) { if( fldObj[i].selected && i==0 && fldObj[i].value == '' ) { return false; }   if ( fldObj[i].selected ) { return true; } }  else { if ( fldObj[i].checked ) { return true; } }; } return false; }  else  { if ( fldObj[0].type == "checkbox" ) { return ( fldObj[0].checked ); }  else if ( fldObj[0].type == "radio" ) { return ( fldObj[0].checked ); }  else { fldObj[0].focus(); return (fldObj[0].value.length > 0); }} }
function rmspaces(x) {var leftx = 0;var rightx = x.length -1;while ( x.charAt(leftx) == ' ') { leftx++; }while ( x.charAt(rightx) == ' ') { --rightx; }var q = x.substr(leftx,rightx-leftx + 1);if ( (leftx == x.length) && (rightx == -1) ) { q =''; } return(q); }
function checkfield(data) {if (rmspaces(data) == ""){return false;}else {return true;}}
function isemail(data) {var flag = false;if (  data.indexOf("@",0)  == -1 || data.indexOf("\\",0)  != -1 ||data.indexOf("/",0)  != -1 ||!checkfield(data) ||  data.indexOf(".",0)  == -1  ||  data.indexOf("@")  == 0 ||data.lastIndexOf(".") < data.lastIndexOf("@") ||data.lastIndexOf(".") == (data.length - 1)   ||data.lastIndexOf("@") !=   data.indexOf("@") ||data.indexOf(",",0)  != -1 ||data.indexOf(":",0)  != -1 ||data.indexOf(";",0)  != -1  ) {return flag;} else {var temp = rmspaces(data);if (temp.indexOf(' ',0) != -1) { flag = true; }var d3 = temp.lastIndexOf('.') + 4;var d4 = temp.substring(0,d3);var e2 = temp.length  -  temp.lastIndexOf('.')  - 1;var i1 = temp.indexOf('@');if (  (temp.charAt(i1+1) == '.') || ( e2 < 1 ) ) { flag = true; }return !flag;}}
function focusPlaceHolder(obj) { 
obj.className = "formbox-field_YPLMC"; }
function blurPlaceHolder(obj) { 
if ( obj.value == '' ) { obj.className = "formbox-field_YPLMC text-placeholder"; }
} 
function isValidDate(year, month, day) { 
if (year.toString() == '' || month.toString() == '' || day.toString() == '') { return false;} try { year = parseInt(year); month = parseInt(month); day = parseInt(day); } catch (e) { return false;} var d = new Date(year, month - 1, day, 0, 0, 0, 0); return (!isNaN(d) && (d.getDate() == day && d.getMonth() + 1 == month && d.getFullYear() == year));}var submitButton_YPLMC = document.getElementById("btnSubmit_YPLMC");
var subscribeScreen_YPLMC = document.getElementById("formbox_screen_subscribe_YPLMC");
var signupFormContainer_YPLMC = document.getElementById("signupFormContainer_YPLMC");
var signupFormLoader_YPLMC = document.getElementById("popupFormLoader_YPLMC");
function submit_YPLMCClick(){
 var retVal = true; var contentdata = ""; var frm = document.getElementById("formbox_screen_subscribe_YPLMC");if ( !isemail(document.getElementsByName("fldemail_YPLMC")[0].value) ) { 
   alert("Please enter a valid Email Address");
document.getElementById("fldemail_YPLMC").focus(); retVal = false;} if ( retVal == true ) {var frm = "_YPLMC"; var f = document.createElement("form"); f.setAttribute('accept-charset', "UTF-8");  f.setAttribute('method', "post"); f.setAttribute('action', "https://lb.benchmarkemail.com//code/lbform"); var elms = document.getElementsByName("frmLB" + frm)[0].getElementsByTagName("*");var ty = ""; for (var ei = 0; ei < elms.length; ei++) {ty = elms[ei].type; if (ty == "hidden" || ty == "text" || (ty == "checkbox" && elms[ei].checked) || (ty == "radio" && elms[ei].checked) || ty == "textarea" || ty == "select-one" || ty == "button") {elm = elms[ei]; if(elm.id != "") { var i = document.createElement("input"); i.type = "hidden"; i.name = elm.name.replace("_YPLMC", ""); i.id = elm.id; i.value = elm.value; f.appendChild(i); } } } document.getElementsByTagName('body')[0].appendChild(f);f.submit(); }
if(isemail(document.getElementById("fldemail_YPLMC").value) && window && window.JB_TRACKER && typeof window.JB_TRACKER.jbSubmitForm === 'function') { 
 window.JB_TRACKER.jbSubmitForm({ 
 email: document.getElementById("fldemail_YPLMC").value, didSubmit: true 
 }); 
 }
return retVal;}  var bmePopupFormViewed_YPLMC = localStorage.getItem('bmePopupFormSignedUp1410777'); 
  if ( bmePopupFormViewed_YPLMC != 'true') {
  } 
function debounce_YPLMC(func, wait, immediate) {
var timeout;
return function() {
var context = this, args = arguments;
var later = function() {timeout = null; if (!immediate) func.apply(context, args); };
var callNow = immediate && !timeout; clearTimeout(timeout); timeout = setTimeout(later, wait); if (callNow) func.apply(context, args); };
};
var hasVerticalCenter_YPLMC = document.getElementsByClassName('position-centered');
function verticalCenter_YPLMC(element) { if(element) { element.style.opacity = 0;  element.style.display = 'block';  }
setTimeout(function () { if (hasVerticalCenter_YPLMC.length > 0) { var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0); 
 var formElement_YPLMC = document.getElementsByClassName('formbox-editor_YPLMC')[0]; var formHeight_YPLMC = formElement_YPLMC.clientHeight; 
 if (formHeight_YPLMC < windowHeight) { var newPosition = 0; newPosition = (windowHeight - formHeight_YPLMC) / 2; formElement_YPLMC.style.top = newPosition + 'px'; } else { formElement_YPLMC.style.top = '0px'; } }
if(element) { element.style.opacity = 1;  }
 }, 100);
}
if (hasVerticalCenter_YPLMC.length > 0) { var resizeEvent_YPLMC = debounce_YPLMC(function() { verticalCenter_YPLMC(); }, 250); window.addEventListener('resize', resizeEvent_YPLMC); } 

// <!-- END: Signup Form Popup Code from Benchmark Email Ver 4.0  -->