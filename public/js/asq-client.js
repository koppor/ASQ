;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
  @fileoverview entry point for vendor libraries
**/

'use strict';

require('./form');
require('./dom').init()


},{"./dom":2,"./form":3}],2:[function(require,module,exports){
/* Presentations DOM */
'use strict'
var $ = require("jQuery");

var init = function (){
  $(function(){
    if(!window.navigator.standalone && navigator.userAgent.match(/(iPhone|iPod)/g) ? true : false ){
      $('#iOSWebAppInfo').popover({
        placement: "top",
        title: "Install ASQ as Web-app",
        html: true,
      });
      $('#iOSWebAppInfo').popover('show');
    }
    if(!window.navigator.standalone && navigator.userAgent.match(/(iPad)/g) ? true : false ){
      $('#iOSWebAppInfo').popover({
        placement: "bottom",
        title: "Install ASQ as Web-app",
        html: true,
      });
      $('#iOSWebAppInfo').popover('show');
    }
    
    document.addEventListener("touchstart", hidePopover, false);
    function hidePopover(){
      $('#iOSWebAppInfo').popover('destroy');
    };
    
    $('.thumb').click(function (event) {
        
        event.stopPropagation();
        $(".thumb").removeClass("flipped").css("z-index", "1");
        
        $(this).addClass("flipped");
        $(this).parent().css("z-index", "10");
    });

    $('.dropdown-toggle').click(function(event) {
      event.stopPropagation();
      $(this).parent().toggleClass("open");
    });

//     $('.start').on('click', function(event) {
//   event.stopPropagation();
//   console.log('Start presentation');
//   console.log($(this).data('username'));
 
// });
    
    $(".buttons a").click(function (event) {
        event.preventDefault();
        var $this = $(this);

        if($this.hasClass("start")){
          //start presentation
          var username = $this.data('username');
          var presentationId = $this.data('id');
          var authLevel = $this.data('authLevel');
          var url = ['/', username, '/presentations/', presentationId, '/live/?start&al=',
            authLevel].join('');
          $.post(url, null , function(data){
            console.log(data)
            if(!window.navigator.standalone){
              window.open("/admin", '');
              slideshow.blur();
              window.focus();
            }else{
              window.location = $this.attr("href");
              console.log(window.navigator.standalone);
            }
          });
        }
    });
    
    
    $(document).click(function () {
        $(".thumb").removeClass("flipped");
        $(".thumb").parent().css("z-index", "100");
    });
  })
}

var dom = module.exports={
  init : init
}    
},{}],3:[function(require,module,exports){
var $ = require("jQuery")


var usernameOk = false;
var emailOk = false;
var pwdOk = false;

// var isValidUserName = function(candidateUser) {
//   // Match string between 3 and 12 chars starting with a letter, lower or upper case 
//   // and containing only letters (both cases, digits, dashes, underscores and dots.
//   var userRegex = /(?=[a-zA-Z])(?=^.{3,12}$)[a-zA-Z0-9_\-\.]*$/;
//   return userRegex.test(candidateUser);

// }

// var isValidPassword = function(candidatePass) {
//   // Match a string between 8 and 30 chars
//   // and containing only letters (both cases), digits and the following characters: ! @ # % : _ ( ) $ ^ & * - . ?
//   // It also must contain at least one upper case letter, one lower case and one digit and it cannot contain spaces.
//   var passwordRegex = /(?=^.{8,30}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z:!@#%_\(\)\$\^\&\*\-\.\?]*$/;
//   return passwordRegex.test(candidatePass);
// }


function checkUsername (input) {
  var username = input.value;
  if (username != '') {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/checkusername/' + username + '/', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status == 200) {
        var html = [];
        var reply = xhr.responseText;
        if (reply == 1) {
          $('#checkuser').html('Not available');
          $('#groupUsername').attr('class', 'control-group error');
          usernameOk = false;

        } else if (reply == 2) {
          $('#checkuser').html('Invalid name')
          $('#groupUsername').attr('class', 'control-group error');
          usernameOk = false;
        } else {
          $('#checkuser').html('<i class="icon-ok"></i>');
          $('#groupUsername').attr('class', 'control-group');
          usernameOk = true;
        }
      }
    }
    checkAllOk();
    xhr.send(null);
    return false;
  } else {
    $('#checkuser').html('');
  }
  checkAllOk();
}

function validateMail() {

  var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  var address = $('#inputEmail').value;
  if (reg.test(address) == false) {

    $('#checkmail').html('Not valid');
    $('#groupEmail').attr('class', 'control-group error');
    emailOk = false;
  } else {
    $('#checkmail').html('<i class="icon-ok"></i>');
    $('#groupEmail').attr('class', 'control-group');
    emailOk = true;
  }
  checkAllOk();
}

function validatePassword() {

  var pwd1 = $('#inputPassword').value;
  var pwd2 = $('#inputRepeatPassword').value;

  if (pwd1 === pwd2) {
    $('#checkpwd').html('<i class="icon-ok"></i>');
    $('#checkpwd2').html('<i class="icon-ok"></i>');
    $('#groupPassword1').attr('class', 'control-group');
    $('#groupPassword2').attr('class', 'control-group');
    pwdOk = true;
  } else {
    $('#checkpwd').html(' ');
    $('#checkpwd2').html('Mismatch!');
    $('#groupPassword1').attr('class', 'control-group error');
    $('#groupPassword2').attr('class', 'control-group error');
    pwdOk = false;
  }
  checkAllOk();
}

function checkAllOk() {
  if (pwdOk && emailOk && usernameOk) {

    $('#createAccount').removeClass('disabled');
    $('#createAccount').disabled = false;
  } else {
    $('#createAccount').addClass('disabled');
    $('#createAccount').disabled = true;
  }
}


var form = module.exports = {
    checkAllOk        : checkAllOk,
    checkUsername     : checkUsername,
    validateMail      : validateMail,
    validatePassword  : validatePassword
}
},{}]},{},[1])
;