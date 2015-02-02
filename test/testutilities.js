var fs = require('fs');
Worker = require('webworker-threads').Worker;
// include the java script to test in the order of dependency from
// the one without dependencies to the one that builds on the others
require('../js/cContactBackup.js');
require('../js/cContacts.js');
require('../js/cContactUtils.js');
require('../js/cContactsList.js');

jqFactory = require('../node_modules/jquery/dist/jquery.js');
jsdom = require("jsdom").jsdom;
document = jsdom(fs.readFileSync("m.html", {
    encoding : "utf8"
}));
// document = jsdom("<html><head></head><body>hello world</body></html>");
window = document.createWindow();
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

getFixtures = function() {
    return [ {
        // 0
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5554321'
        } ]
    }, {
        // 1
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5551234'
        } ]
    }, {
        // 2
        givenName : [ 'Bart' ],
        familyName : [ 'Simpson' ],
        name : [ 'The Bartman' ],
        tel : [ {
            type : 'mobile',
            value : '0421 555666'
        } ]
    }, {
        // 3
        givenName : [ 'NoLastName' ],
        name : [ 'NoLastName' ],
        tel : [ {
            type : 'mobile',
            value : '0421 555666'
        } ]
    }, {
        // 4
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5551234-1'
        }, {
            type : 'mobile',
            value : '0421 5551234-2'
        } ]
    }, {
        // 5
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5551234-1'
        }, {
            type : 'mobile',
            value : '0421 5551234-2'
        } ],
        email : [ {
            type : "home",
            value : "John@JohnDoe.de"
        } ]
    }, {
        // 6
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        adr : [ {
            type : 'home',
            streetAddress : 'Bakerstreet 221a',
            locality : 'London',
            postalCode : 'AB1 CD2',
            countryName : 'UK'
        } ]
    }, {
        // 7
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        adr : [ {
            type : 'work',
            streetAddress : 'Bakerstreet 221a',
            locality : 'London',
            postalCode : 'AB1 CD2',
            countryName : 'UK'
        }, {
            type : 'home',
            streetAddress : 'Musterweg 1',
            locality : 'Bielefeld',
            postalCode : '33666',
            countryName : 'Germany'
        } ]
    }, {
        // 8
        id : "abcd",
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        honorificSuffix : []
    }, {
        // 9
        id : "xyz",
        org : [ 'John Doe Inc' ],
        honorificSuffix : []
    }, {
        // 10
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '00421 5551234-1'
        }, {
            type : 'mobile',
            value : '+49421 5551234-2'
        } ]
    }, {
        // 11
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5551234-1'
        }, {
            type : 'mobile',
            value : '+49421 5551234-2'
        } ]
    }, {
        // 12
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '00421 5551234-1'
        }, {
            type : 'mobile',
            value : '0421 5551234-2'
        } ]
    }, {
        // 13
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '+49421 5551234-1'
        }, {
            type : 'mobile',
            value : '+49421 5551234-1'
        } ]
    }, {
        // 14
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '+49421 5551234-1'
        }, {
            type : 'mobile',
            value : '0421 5551234-1'
        } ]
    }, {
        // 15 with incorrect converted german characters
        givenName : [ 'J\u00C3\u00B6hn' ],
        familyName : [ 'D\u00C3\u00B6' ],
        name : [ 'Jöhn Dö' ],
        tel : [ {
            type : 'mobile',
            value : '+49421 5551234-1'
        }, {
            type : 'mobile',
            value : '0421 5551234-1'
        } ]
    }, {
        // 16
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5554321'
        } ]
    }, {
        // 17
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5551234'
        } ]
    }, {
        // 18
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5551234'
        }, {
            type : 'mobile',
            value : '0421 5554321'
        } ]
    }, {
        // 19
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ]
    }, {
        // 20
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5551234'
        } ]
    }, {
        // 21
        givenName : [ 'John' ],
        familyName : [ 'Doe' ],
        name : [ 'John Doe' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5552134'
        } ]
    }, {
        // 22
        givenName : [ 'John' ],
        familyName : [ 'DAlice' ],
        name : [ 'John DAlice' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5551234'
        } ]
    }, {
        // 23
        givenName : [ 'John' ],
        familyName : [ 'DBob' ],
        name : [ 'John DBob' ],
        tel : [ {
            type : 'mobile',
            value : '0421 5551234'
        } ]
    } ];
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
$ = jqFactory(window);
