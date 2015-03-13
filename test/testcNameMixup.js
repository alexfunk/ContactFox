require('./testutilities.js');
function setup() {
    nameMixup = new cNameMixup();
    nameMixup.setParent({
        changeEntry : function(contact) {
        }
    });

    var fixtures = getFixtures();
    c = [];
    $.each(fixtures, function(i, e) {
        c.push(new cContact(e));
    });
}

exports.cNameMixup = {
    'correctDefect' : function(test) {
        setup();
        var nameMixupTests = [ c[28], c[29], c[30], c[31], c[32], c[33] ];
        test.expect(6 * nameMixupTests.length);
        for ( var i = 0; i < nameMixupTests.length; i++) {
            var co = nameMixupTests[i];
            nameMixup.checkContactForDefect(co);
            test.equal(nameMixup.numDefects(), 1, "before correct the number of defects should be 1");
            nameMixup.correctDefect(co.key());
            test.equal(nameMixup.numDefects(), 0, "after correct the number of defects should be 0");
            test.equal(co.c.givenName[0], "John", "The given name should be just 'John'");
            test.equal(co.c.familyName[0], "Doe", "The family name should be just 'Doe'");
            test.equal(co.c.givenName.length, 1, "The given name should be just 'John'");
            test.equal(co.c.familyName.length, 1, "The family name should be just 'Doe'");
        }
        test.done();
    },
    'correctDefect2' : function(test) {
        setup();
        var nameMixupTests = [ c[28], c[29], c[30], c[31], c[32], c[33] ];
        test.expect(6 * nameMixupTests.length);
        for ( var i = 0; i < nameMixupTests.length; i++) {
            var co = nameMixupTests[i];
            nameMixup.checkContactForDefect(co);
            test.equal(nameMixup.numDefects(), 1, "before correct the number of defects should be 1");
            nameMixup.correctDefect(co.key(), {
                "switch" : true
            });
            test.equal(nameMixup.numDefects(), 0, "after correct the number of defects should be 0");
            test.equal(co.c.givenName[0], "Doe", "The given name should be 'Doe' because of switch");
            test.equal(co.c.familyName[0], "John", "The family name should be 'John' becaus of switch");
            test.equal(co.c.givenName.length, 1, "The given name should be just 'John'");
            test.equal(co.c.familyName.length, 1, "The family name should be just 'Doe'");
        }
        test.done();
    },
    'checkContactForDefect' : function(test) {
        setup();
        test.expect(2);
        nameMixup.checkContactForDefect(c[0]);
        test.equal(nameMixup.numDefects(), 0);
        nameMixup.checkContactForDefect(c[28]);
        test.equal(nameMixup.numDefects(), 1);
        test.done();
    }
};
