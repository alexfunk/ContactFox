require('./testutilities.js');
// some contacts as test data
var fixture = [ {
    // 0
    givenName : [ 'John' ],
    familyName : [ 'Doe' ],
    name : [ 'John Doe' ],
    tel : [ {
        type : 'mobile',
        value : '0421 5554321'
    } ]
}, {
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
} ];
var c1 = [];
$.each(fixture, function(i, e) {
    c1.push(new cContact(e));
});
var funnyCharacters = new cFunnyCharacters();

exports.cContacts = {
    'correctDefect' : function(test) {
        test.expect(1);
        funnyCharacters.correctDefect(c1[1]);
        test.equal(c1[1].c.givenName[0], "Jöhn");
        test.done();
    },
    'checkContactForDefect' : function(test) {
        test.expect(2);
        funnyCharacters.checkContactForDefect(c1[0]);
        test.equal(funnyCharacters.numDefects(), 0);
        funnyCharacters.checkContactForDefect(c1[2]);
        test.equal(funnyCharacters.numDefects(), 1);
        test.done();
    }
};
