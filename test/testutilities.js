console.log("start");
var fs = require('fs');
Worker = require('webworker-threads').Worker;
// include the java script to test in the order of dependency from
// the one without dependencies to the one that builds on the others
require('../js/cContactBackup.js');
require('../js/cContacts.js');
require('../js/cContactUtils.js');
require('../js/cContactsList.js');

//function log(e) {
//    console.log(e);
//}

jsdom = require("jsdom").jsdom;
var jquery = fs.readFileSync("node_modules/jquery/dist/jquery.js", "utf-8");

jsdom.env({
  file: "m.html",
  src: [jquery],
  done: function (errors, window) {   
    console.log("done");
  },
  loaded: function (errors, w) {
    try {
      console.log("loaded");
      window = w;		
      $ = window.$;
      document = window.document;
      // Mock local storage
      MockLocalStorage = function() {
      };
      MockLocalStorage.prototype = {
        _localStorage : {},
        getItem : function(key) {
           var result = this._localStorage[key];
           if (typeof result === "undefined")
              result = null;
           return result;
        },
        setItem : function(key, value) {
           this._localStorage[key] = value;
        }
// TODO: mock the rest of the interface or look for a module that does it.
};
window.localStorage = new MockLocalStorage();

log = function(e) {
    console.log(e);
};

navigator = {
    mozContacts : {
        save : function(c) {
            return {};
        },
        remove : function(c) {
            return {};
        }
    }
};
// b2g 1.3 requires the mozContact class to encapsulate all contact objects
// before they are passed to navigator.mozContacts.save and other functions.
// this class mocks the mozContact class for the unit tests
mozContact = function() {
};


   } catch (e) {
     console.log("error 2 " + e + " " + errors) ;
   }
  }
});


