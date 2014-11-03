require('./testutilities.js');
var fixture = [ {
    givenName : [ 'John' ],
    familyName : [ 'Doe' ],
    name : [ 'John Doe' ],
    tel : [ {
        type : 'mobile',
        value : '0421 5554321'
    } ]
}, {
    givenName : [ 'John' ],
    familyName : [ 'Doe' ],
    name : [ 'John Doe' ],
    tel : [ {
        type : 'mobile',
        value : '0421 5551234'
    } ]
}, {
    givenName : [ 'Bart' ],
    familyName : [ 'Simpson' ],
    name : [ 'The Bartman' ],
    tel : [ {
        type : 'mobile',
        value : '0421 555666'
    } ]
}, {
    givenName : [ 'Bart\\,' ],
    familyName : [ 'Simpson' ],
    name : [ 'The Bartman' ],
    tel : [ {
        type : 'mobile',
        value : '0421 555666'

    } ]
} ];
var c0 = new cContact(fixture[0]), c1 = new cContact(fixture[1]), c2 = new cContact(
        fixture[2]), c3 = new cContact(fixture[3]);
var contactList = new cContactList();
exports.cContacts = {
    'list' : function(test) {
        test.expect(23);

        test.equal(contactList.size(), 0);
        contactList.add(c0);
        test.equal(contactList.size(), 1);
        test.equal(contactList.hasDuplicates(), false);
        test.equal(contactList.getDefectList("DUPLICATES").hasDefects(), false);
        contactList.add(c1);
        test.equal(contactList.size(), 2);
        test.equal(contactList.hasDuplicates(), true);
        test.equal(contactList.getDefectList("DUPLICATES").hasDefects(), true);
        test.equal(contactList.numDuplicates(), 1);
        test.equal(contactList.getDefectList("DUPLICATES").numDefects(), 1);
        test.equal(contactList.hasMissingPrefix(), true);
        test.equal(contactList.getDefectList("MISSINGPREFIX").hasDefects(),
                true);
        test.equal(contactList.numMissingPrefix(), 2);
        test.equal(contactList.getDefectList("MISSINGPREFIX").numDefects(), 2);
        contactList.correctDuplicates(c0.key());
        test.equal(contactList.hasDuplicates(), false);
        test.equal(contactList.size(), 1);
        contactList.add(c3);
        test.equal(contactList.hasFunnyCharacters(), true);
        test.equal(contactList.getDefectList("FUNNYCHARS").hasDefects(), true);
        test.equal(contactList.numFunnyCharacters(), 1);
        test.equal(contactList.getDefectList("FUNNYCHARS").numDefects(), 1);
        contactList.getDefectList("FUNNYCHARS").correctDefect(c3.key());
        test.equal(contactList.hasFunnyCharacters(), false);
        test.equal(contactList.getDefectList("FUNNYCHARS").hasDefects(), false);
        test.equal(contactList.numFunnyCharacters(), 0);
        test.equal(contactList.getDefectList("FUNNYCHARS").numDefects(), 0);
        test.done();
    }
};
