var fs = require('fs');
// include the java script to test in the order of dependency from 
// the one without dependencies to the one that builds on the others
require('../js/cContactBackup.js');
require('../js/cContacts.js');
require('../js/cContactUtils.js');
require('../js/cContactsList.js');

jqFactory = require('../node_modules/jquery/dist/jquery.js');
jsdom = require("jsdom").jsdom;
document = jsdom(fs.readFileSync("m.html", {
    encoding: "utf8"
}));
//document = jsdom("<html><head></head><body>hello world</body></html>");
window = document.createWindow();
// Mock local storage
MockLocalStorage = function() {};
MockLocalStorage.prototype = {
    _localStorage: {},
    getItem: function(key) {
        var result = this._localStorage[key];
        if (typeof result === "undefined") result = null;
        return result;
    },
    setItem: function(key, value) {
        this._localStorage[key] = value;
    }
    //TODO: mock the rest of the interface or look for a module that does it.
};
window.localStorage = new MockLocalStorage();

function log(e) {
    console.log(e);
}

navigator = {
    mozContacts: {
        save: function(c) {
            return {};
        },
        remove: function(c) {
            return {};
        }
    }
};
// b2g 1.3 requires the mozContact class to encapsulate all contact objects
// before they are passed to navigator.mozContacts.save and other functions.
// this class mocks the mozContact class for the unit tests
mozContact = function() {};
$ = jqFactory(window);
