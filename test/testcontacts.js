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
} ];
var c = [];
$.each(fixture, function(i, e) {
    c.push(new cContact(e));
});

exports.cContacts = {
    'key' : function(test) {
        test.expect(1);

        test.equal(c[0].key(), "Doe_John");
        test.done();
    },
    'displayName' : function(test) {
        test.expect(4);
        test.equal(c[0].displayName(), "John Doe");
        test.equal(c[2].displayName(), "The Bartman");
        test.equal(c[3].displayName(), "NoLastName");
        test.equal(c[9].displayName(), "John Doe Inc");
        test.done();
    },
    'containsNumber' : function(test) {
        test.expect(7);
        test.equal(c[0].containsNumber('0421 5554321'), true);
        test.equal(c[0].containsNumber('0421 5551234'), false);
        test.equal(c[1].containsNumber('0421 5551234'), true);
        test.equal(c[1].containsNumber('0421 5554321'), false);
        test.equal(c[4].containsNumber('0421 5551234-1'), true);
        test.equal(c[4].containsNumber('0421 5551234-2'), true);
        test.equal(c[4].containsNumber('0421 5554321-2'), false);
        test.done();
    },
    'hasMissingPrefix' : function(test) {
        test.expect(10);
        test.equal(c[0].hasMissingPrefix(), true);
        test.equal(c[1].hasMissingPrefix(), true);
        test.equal(c[2].hasMissingPrefix(), true);
        test.equal(c[3].hasMissingPrefix(), true);
        test.equal(c[4].hasMissingPrefix(), true);
        test.equal(c[5].hasMissingPrefix(), true);
        test.equal(c[6].hasMissingPrefix(), false);
        test.equal(c[10].hasMissingPrefix(), false);
        test.equal(c[11].hasMissingPrefix(), true);
        test.equal(c[12].hasMissingPrefix(), true);
        test.done();
    },
    'clearDuplicateNumbers' : function(test) {
        test.expect(2);
        c[13].clearDuplicateNumbers();
        test.equal(c[13].c.tel.length, 1);
        c[14].clearDuplicateNumbers();
        test.equal(c[14].c.tel.length, 2);
        test.done();
    },
    'insertPrefix' : function(test) {
        test.expect(7);
        test.equal(c[10].hasMissingPrefix(), false);
        c[10].insertPrefix("+44");
        test.equal(c[10].hasMissingPrefix(), false);
        test.equal(c[11].hasMissingPrefix(), true);
        c[11].insertPrefix("+49");
        test.equal(c[11].hasMissingPrefix(), false);
        test.equal(c[12].hasMissingPrefix(), true);
        c[12].insertPrefix("+49");
        test.equal(c[12].hasMissingPrefix(), false);
        c[14].insertPrefix("+49");
        test.equal(c[14].c.tel.length, 1);
        test.done();
    },
    'containsEMail' : function(test) {
        test.expect(3);
        test.equal(c[4].containsEMail('John@JohnDoe.de'), false);
        test.equal(c[5].containsEMail('John@JohnDoe.de'), true);
        test.equal(c[1].containsEMail('0421 5551234'), false);
        test.done();
    },
    'addressEqual' : function(test) {
        test.expect(7);
        var differentType = {
            type : 'home',
            streetAddress : 'Bakerstreet 221a',
            locality : 'London',
            postalCode : 'AB1 CD2',
            countryName : 'UK'
        };
        // same adress differen type should be equal
        test.equal(c[1].addressEqual(differentType, c[7].c.adr[0]), true);
        test.equal(c[1].addressEqual(c[7].c.adr[0], differentType), true);
        //
        test.equal(c[1].addressEqual(c[7].c.adr[0], c[7].c.adr[0]), true);
        test.equal(c[2].addressEqual(c[7].c.adr[0], c[7].c.adr[1]), false);
        test.equal(c[3].addressEqual(c[7].c.adr[0], null), false);
        test.equal(c[4].addressEqual(null, c[7].c.adr[0]), false);
        test.equal(c[5].addressEqual(null, null), true);
        test.done();
    },
    'addressToString' : function(test) {
        test.expect(2);
        test.equal(c[5].addressToString(c[7].c.adr[0]),
                'Bakerstreet 221a,AB1 CD2,London,UK');
        test.equal(c[5].addressToString({
            type : 'home',
            locality : 'London',
            postalCode : 'AB1 CD2',
            countryName : 'UK'
        }), 'AB1 CD2,London,UK');
        test.done();
    },
    'contactMemberToString' : function(test) {
        test.expect(15);
        var strings = c[7].contactMemberToString('adr');
        test.equal($.isArray(strings), true);
        test.equal(strings.length, 2);
        test.equal(strings[0], 'Bakerstreet 221a,AB1 CD2,London,UK');
        test.equal(strings[1], 'Musterweg 1,33666,Bielefeld,Germany');
        strings = c[6].contactMemberToString('adr');
        test.equal($.isArray(strings), true);
        test.equal(strings.length, 1);
        test.equal(strings[0], 'Bakerstreet 221a,AB1 CD2,London,UK');
        strings = c[6].contactMemberToString('photo');
        test.equal($.isArray(strings), true);
        test.equal(strings.length, 0);
        strings = c[6].contactMemberToString('bday');
        test.equal($.isArray(strings), true);
        test.equal(strings.length, 0);
        strings = c[8].contactMemberToString('honorificSuffix');
        test.equal($.isArray(strings), true);
        test.equal(strings.length, 0);
        strings = c[8].contactMemberToString('id');
        test.equal($.isArray(strings), true);
        test.equal(strings.length, 1);

        test.done();
    },
    'unify' : function(test) {
        test.expect(20);
        test.equal(c[0].c.givenName.length, 1);
        test.equal(c[0].isUnifiyable(c[1]), true);
        test.equal(c[0].isUnifiyable(c[2]), false);
        test.equal(c[2].isUnifiyable(c[2]), true);
        test.equal(c[0].unify(c[1]), null);
        test.equal(c[0].c.tel.length, 2);
        test.equal(c[0].containsNumber('0421 5554321'), true);
        test.equal(c[0].containsNumber('0421 5551234'), true);
        test.equal(c[0].c.givenName.length, 1);
        test.equal(c[1].c.familyName.length, 1);
        c[1].unify(c[4]);
        test.equal(c[1].c.tel.length, 3);
        test.equal(c[1].containsNumber('0421 5551234-1'), true);
        test.equal(c[1].containsNumber('0421 5551234-2'), true);
        c[1].unify(c[5]);
        test.equal(c[1].c.tel.length, 3);
        test.equal(c[1].containsNumber('0421 5551234-1'), true);
        test.equal(c[1].containsNumber('0421 5551234-2'), true);
        test.equal(c[1].containsEMail('John@JohnDoe.de'), true);
        c[1].unify(c[6]);
        test.equal(c[1].c.adr.length, 1);
        test.equal(c[1].containsAddress({
            type : 'home',
            streetAddress : 'Bakerstreet 221a',
            locality : 'London',
            postalCode : 'AB1 CD2',
            countryName : 'UK'
        }), true);
        test.equal(c[1].c.familyName.length, 1);

        test.done();
    },
    'addToUnifyList' : function(test) {
        test.expect(4);
        var list = [];
        for ( var i = 0; i < 4; i++) {
            list = c[i].addToUnifyList(list);
        }
        test.equal(list.length, 3);
        test.equal(list[0].length + list[1].length, 3);
        c[2].addToUnifyList(list);
        test.equal(list[0].length, 2);
        test.equal(list[1].length, 2);
        test.done();
    },
    'appendAsString' : function(test) {
        test.expect(1);
        $(document.body).append('<div id="CONTACTCHANGE"></div>');
        var div = $('#CONTACTCHANGE');
        c[0].appendAsString(div);
        test.equal($('#CONTACTCHANGE div').length, 4);
        test.done();
    },
    'appendUnifyListToUL' : function(test) {
        test.expect(11);
        var list = [];
        for ( var i = 0; i < 4; i++) {
            list = c[i].addToUnifyList(list);
        }
        list = c[2].addToUnifyList(list);

        test.equal($(document.body).length, 1);
        $(document.body).append('<ul></ul>');
        var ul = $('ul');
        test.equal(ul.length, 1);
        contactUtils.appendUnifyListToUL(list, ul);
        // how many list items (li) how many contacts to merge
        test.equal($('ul li').length, 2);
        $('ul li').each(function(index) {
            var id = $(this).attr('id');
            var data = $(this).data('list');
            test.equal(typeof id === 'undefined', false);
            test.equal(typeof data === 'undefined', false);
            test.equal(data === null, false, "data may not be null");
            test.equal(data === '', false, "data may not be empty string");
        });
        test.done();
    },
    'appendBackupListToUL' : function(test) {
        var backup = new cContactBackup();
        // one entry was backed up before
        backup.backup(c[2]);
        backup.backup(c[3]);
        var expectedLength = 3;
        // two tests for the list and 5 tests for each list entires
        test.expect(2 + expectedLength * 5);
        $('#RESTOREBACKUPLIST').append('<ul></ul>');
        var ul = $('#RESTOREBACKUPLIST ul');
        test.equal(ul.length, 1);
        // add backuplist has no relation to c[0], should be static
        backup.appendBackupListToUL(ul);
        // get the list of li elements
        var lis = $('#RESTOREBACKUPLIST ul li');
        test.equal(lis.length, expectedLength);
        lis.each(function(index) {
            var id = $(this).attr('id');
            var contact = $(this).data('contact');
            test.equal(typeof id === 'undefined', false);
            test.equal(typeof contact === 'undefined', false);
            test.equal(contact === null, false, "data may not be null");
            test.equal(contact === '', false, "data may not be empty string");
            test.equal(id.indexOf(contact.key()) != -1, true,
                    "the id of the li contains the id of the contact");
        });
        test.done();
        $('#RESTOREBACKUPLIST').empty();
    },
    'appendBackupListToUL2' : function(test) {
        test.expect(3);
        var oldLength = c[0].getBackup().length();
        // use contacts with an id so that they create unique ids in the contact
        // list
        c[8].remove();
        c[9].remove();
        var newLength = c[0].getBackup().length();
        test.equal(newLength, oldLength + 2);
        $('#RESTOREBACKUPLIST').append('<ul></ul>');
        var ul = $('#RESTOREBACKUPLIST ul');
        test.equal(ul.length, 1);
        // add backuplist has no relation to c[0], should be static
        c[0].getBackup().appendBackupListToUL(ul);
        // get the list of li elements
        var lis = $('#RESTOREBACKUPLIST ul li');
        // console.log("list: " + $('#RESTOREBACKUPLIST ul').html() + " !!!");
        test.equal(lis.length, oldLength + 2);
        test.done();
        $('#RESTOREBACKUPLIST').empty();
    }
};
