//<!-- BEGIN: Signup Form Popup Code from Benchmark Email Ver 4.0  -->

function CheckField_7EKNW(fldName, frm){var fldObj = document.getElementsByName(fldName);if ( fldObj.length > 1 ) {  for ( var i = 0, l = fldObj.length; i < l; i++ ) {   if ( fldObj[0].type == 'select-one' ) { if( fldObj[i].selected && i==0 && fldObj[i].value == '' ) { return false; }   if ( fldObj[i].selected ) { return true; } }  else { if ( fldObj[i].checked ) { return true; } }; } return false; }  else  { if ( fldObj[0].type == "checkbox" ) { return ( fldObj[0].checked ); }  else if ( fldObj[0].type == "radio" ) { return ( fldObj[0].checked ); }  else { fldObj[0].focus(); return (fldObj[0].value.length > 0); }} }
function rmspaces(x) {var leftx = 0;var rightx = x.length -1;while ( x.charAt(leftx) == ' ') { leftx++; }while ( x.charAt(rightx) == ' ') { --rightx; }var q = x.substr(leftx,rightx-leftx + 1);if ( (leftx == x.length) && (rightx == -1) ) { q =''; } return(q); }
function checkfield(data) {if (rmspaces(data) == ""){return false;}else {return true;}}
function isemail(data) {var flag = false;if (  data.indexOf("@",0)  == -1 || data.indexOf("\\",0)  != -1 ||data.indexOf("/",0)  != -1 ||!checkfield(data) ||  data.indexOf(".",0)  == -1  ||  data.indexOf("@")  == 0 ||data.lastIndexOf(".") < data.lastIndexOf("@") ||data.lastIndexOf(".") == (data.length - 1)   ||data.lastIndexOf("@") !=   data.indexOf("@") ||data.indexOf(",",0)  != -1 ||data.indexOf(":",0)  != -1 ||data.indexOf(";",0)  != -1  ) {return flag;} else {var temp = rmspaces(data);if (temp.indexOf(' ',0) != -1) { flag = true; }var d3 = temp.lastIndexOf('.') + 4;var d4 = temp.substring(0,d3);var e2 = temp.length  -  temp.lastIndexOf('.')  - 1;var i1 = temp.indexOf('@');if (  (temp.charAt(i1+1) == '.') || ( e2 < 1 ) ) { flag = true; }return !flag;}}
function focusPlaceHolder(obj) { }
function blurPlaceHolder(obj) { }
function isValidDate(year, month, day) { 
if (year.toString() == '' || month.toString() == '' || day.toString() == '') { return false;} try { year = parseInt(year); month = parseInt(month); day = parseInt(day); } catch (e) { return false;} var d = new Date(year, month - 1, day, 0, 0, 0, 0); return (!isNaN(d) && (d.getDate() == day && d.getMonth() + 1 == month && d.getFullYear() == year));}var submitButton_7EKNW = document.getElementById("btnSubmit_7EKNW");
var subscribeScreen_7EKNW = document.getElementById("formbox_screen_subscribe_7EKNW");
var signupFormContainer_7EKNW = document.getElementById("signupFormContainer_7EKNW");
var signupFormLoader_7EKNW = document.getElementById("popupFormLoader_7EKNW");
function submit_7EKNWClick(){
 var retVal = true; var contentdata = ""; var frm = document.getElementById("formbox_screen_subscribe_7EKNW");if ( !isemail(document.getElementsByName("fldemail_7EKNW")[0].value) ) { 
   alert("Please enter a Valid Email Address");
document.getElementById("fldemail_7EKNW").focus(); retVal = false;} if ( retVal == true ) {var frm = "_7EKNW"; var f = document.createElement("form"); f.setAttribute('accept-charset', "UTF-8");  f.setAttribute('method', "post"); f.setAttribute('action', "https://lb.benchmarkemail.com//code/lbform"); var elms = document.getElementsByName("frmLB" + frm)[0].getElementsByTagName("*");var ty = ""; for (var ei = 0; ei < elms.length; ei++) {ty = elms[ei].type; if (ty == "hidden" || ty == "text" || (ty == "checkbox" && elms[ei].checked) || (ty == "radio" && elms[ei].checked) || ty == "textarea" || ty == "select-one" || ty == "button") {elm = elms[ei]; if(elm.id != "") { var i = document.createElement("input"); i.type = "hidden"; i.name = elm.name.replace("_7EKNW", ""); i.id = elm.id; i.value = elm.value; f.appendChild(i); } } } document.getElementsByTagName('body')[0].appendChild(f);f.submit(); }
if(isemail(document.getElementById("fldemail_7EKNW").value) && window && window.JB_TRACKER && typeof window.JB_TRACKER.jbSubmitForm === 'function') { 
 window.JB_TRACKER.jbSubmitForm({ 
 email: document.getElementById("fldemail_7EKNW").value, didSubmit: true 
 }); 
 }

return retVal;}  var bmePopupFormViewed_7EKNW = localStorage.getItem('bmePopupFormSignedUp1410777'); 
  if ( bmePopupFormViewed_7EKNW != 'true') {
  } 
function debounce_7EKNW(func, wait, immediate) {
var timeout;
return function() {
var context = this, args = arguments;
var later = function() {timeout = null; if (!immediate) func.apply(context, args); };
var callNow = immediate && !timeout; clearTimeout(timeout); timeout = setTimeout(later, wait); if (callNow) func.apply(context, args); };
};
var hasVerticalCenter_7EKNW = document.getElementsByClassName('position-centered');
function verticalCenter_7EKNW(element) { if(element) { element.style.opacity = 0;  element.style.display = 'block';  }
setTimeout(function () { if (hasVerticalCenter_7EKNW.length > 0) { var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0); 
 var formElement_7EKNW = document.getElementsByClassName('formbox-editor_7EKNW')[0]; var formHeight_7EKNW = formElement_7EKNW.clientHeight; 
 if (formHeight_7EKNW < windowHeight) { var newPosition = 0; newPosition = (windowHeight - formHeight_7EKNW) / 2; formElement_7EKNW.style.top = newPosition + 'px'; } else { formElement_7EKNW.style.top = '0px'; } }
if(element) { element.style.opacity = 1;  }
 }, 100);
}
if (hasVerticalCenter_7EKNW.length > 0) { var resizeEvent_7EKNW = debounce_7EKNW(function() { verticalCenter_7EKNW(); }, 250); window.addEventListener('resize', resizeEvent_7EKNW); } 

// <!-- END: Signup Form Popup Code from Benchmark Email Ver 4.0  -->
