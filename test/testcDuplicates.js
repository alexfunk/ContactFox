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
} ];
var c1 = [];
$.each(fixture, function(i, e) {
    c1.push(new cContact(e));
});
var duplicates;
function setup() {
    duplicates = new cDuplicates();
    duplicates.setParent({
        changeEntry : function(contact) {
        }
    });
}

exports.cDuplicates = {
    'correctDefect' : function(test) {
        test.expect(3 + 2 * 4);
        setup();
        for ( var i = 0; i < 4; i++) {
            duplicates.checkContactForDefect(c1[i]);
        }
        duplicates.checkContactForDefect(c1[2]);

        test.equal($(document.body).length, 1);
        $(document.body).append('<ul></ul>');
        var ul = $('ul');
        test.equal(ul.length, 1, "expect one list element");
        duplicates.addToUI(ul);
        // how many list items (li) how many contacts to merge
        test.equal($('ul li').length, 2, "expect 2 listitems in merge list");
        $('ul li').each(function(index) {
            var id = $(this).attr('id');
            var data = $(this).data('list');
            test.ok(typeof id !== 'undefined', "id must be defined");
            test.ok(typeof data !== 'undefined', "data must be defined");
            test.ok(data !== null, "data may not be null");
            test.ok(data !== '', "data may not be empty string");
        });
        test.done();
    },
};
