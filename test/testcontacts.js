require('./testutilities.js');
// some contacts as test data
var c = [];
$.each(getFixtures(), function(i, e) {
    c.push(new cContact(e));
});

exports.cContacts = {
    'key' : function(test) {
        test.expect(1);

        test.equal(c[0].key(), "Doe_John");
        test.done();
    },
    'clone' : function(test) {
        test.expect(2);
        var cclone = c[0].clone();
        cclone.c.givenName[0] = "Jack";
        // the clone is a copy but reflects tha change
        test.equal(cclone.key(), "Doe_Jack");
        // the original is unchanged
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
    'clearDuplicateNumbers' : function(test) {
        test.expect(6);
        var cclone = c[13].clone();
        cclone.clearDuplicateNumbers();
        test.equal(cclone.c.tel.length, 1);
        cclone = c[14].clone();
        cclone.clearDuplicateNumbers();
        test.equal(cclone.c.tel.length, 2);
        cclone = c[27].clone();
        cclone.clearDuplicateNumbers();
        var tel = cclone.c.tel;
        console.log(JSON.stringify(tel));
        test.equal(tel.length, 3);
        test.equal(tel[0].value, "1234");
        test.equal(tel[1].value, "4321");
        test.equal(tel[2].value, "5555");
        test.done();
    },
    'checkAllStrings' : function(test) {
        test.expect(2);
        var testOe = function(s) {
            return s.indexOf("\u00C3\u00B6") != -1;
        };
        test.equal(c[14].checkAllStrings(testOe), false);
        test.equal(c[15].checkAllStrings(testOe), true);
        test.done();
    },
    'filterAllStrings' : function(test) {
        test.expect(2);
        var filter = function(s) {
            if (s == "John")
                return "Jack";
            return s;
        };
        var cclone = c[14].clone();
        cclone.filterAllStrings(filter);
        test.equals(cclone.c.givenName[0], "Jack");
        test.equals(cclone.c.familyName[0], "Doe");
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
        test.equal(c[5].addressToString(c[7].c.adr[0]), 'Bakerstreet 221a,AB1 CD2,London,UK');
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
        var domId = "AppendAsString";
        $(document.body).append('<div id="' + domId + '"></div>');
        var div = $('#' + domId);
        c[0].appendAsString(div);
        test.equal($('#' + domId + ' div').length, 4);
        test.done();
    },
    'stringDiff1' : function(test) {
        test.expect(7);
        var a = "abcdef".stringDiff("abcfed");
        test.equal(a.length, 3);
        var first = a[0];
        test.equal(first[0], "unchanged");
        test.equal(first[1], "abc");
        var second = a[1];
        test.equal(second[0], "removed");
        test.equal(second[1], "def");
        var third = a[2];
        test.equal(third[0], "added");
        test.equal(third[1], "fed");
        test.done();
    },
    'stringDiff2' : function(test) {
        test.expect(9);
        var a = "abcdefghi".stringDiff("abcfedghi");
        test.equal(a.length, 4);
        var first = a[0];
        test.equal(first[0], "unchanged");
        test.equal(first[1], "abc");
        var second = a[1];
        test.equal(second[0], "removed");
        test.equal(second[1], "def");
        var third = a[2];
        test.equal(third[0], "added");
        test.equal(third[1], "fed");
        var fourth = a[3];
        test.equal(fourth[0], "unchanged");
        test.equal(fourth[1], "ghi");
        test.done();
    },
    'stringDiff3' : function(test) {
        test.expect(7);
        var a = "Kurier am Sonntag".stringDiff("Kurier der Woche");
        test.equal(a.length, 3);
        var first = a[0];
        test.equal(first[0], "unchanged");
        test.equal(first[1], "Kurier ");
        var second = a[1];
        test.equal(second[0], "removed");
        test.equal(second[1], "am Sonntag");
        var third = a[2];
        test.equal(third[0], "added");
        test.equal(third[1], "der Woche");
        test.done();
    },
    'stringDiff4' : function(test) {
        test.expect(7);
        var a = "0421123456".stringDiff("+49421123456");
        test.equal(a.length, 3);
        var first = a[0];
        test.equal(first[0], "removed");
        test.equal(first[1], "0");
        var second = a[1];
        test.equal(second[0], "added");
        test.equal(second[1], "+49");
        var third = a[2];
        test.equal(third[0], "unchanged");
        test.equal(third[1], "421123456");
        test.done();
    },
    'appendDiffAsString' : function(test) {
        test.expect(14);
        var domId = "AppendDiffAsString1";
        $(document.body).append('<div id="' + domId + '"></div>');
        var div = $('#' + domId);
        c[16].appendDiffAsString(div, c[17]);
        test.equal($('#' + domId + ' div').length, 3);
        test.equal(div.find('.contactcontentremoved').length, 1);
        test.equal(div.find('.contactcontentadded').length, 1);

        domId = "AppendDiffAsString2";
        $(document.body).append('<div id="' + domId + '"></div>');
        div = $('#' + domId);
        c[18].appendDiffAsString(div, c[19]);
        test.equal($('#' + domId + ' div').length, 4);
        test.equal(div.find('.contactcontentremoved').length, 0);
        test.equal(div.find('.contactcontentadded').length, 2);

        domId = "AppendDiffAsString3";
        $(document.body).append('<div id="' + domId + '"></div>');
        div = $('#' + domId);
        c[20].appendDiffAsString(div, c[21]);
        test.equal($('#' + domId + ' div').length, 3);
        test.equal(div.find('.contactcontentremoved').length, 1);
        test.equal(div.find('.contactcontentadded').length, 1);

        domId = "AppendDiffAsString4";
        $(document.body).append('<div id="' + domId + '"></div>');
        div = $('#' + domId);
        c[23].appendDiffAsString(div, c[22]);
        test.equal($('#' + domId + ' div').length, 3);
        var removed = div.find('.contactcontentremoved');
        test.equal(removed.length, 1);
        test.equal(removed.text(), "Alice");
        var added = div.find('.contactcontentadded');
        test.equal(added.length, 1);
        test.equal(added.text(), "Bob");
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
            test.equal(id.indexOf(contact.key()) != -1, true, "the id of the li contains the id of the contact");
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
