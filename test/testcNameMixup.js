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
        test.expect(3);
        setup();
        nameMixup.checkContactForDefect(c[28]);
        console.log(c[28].key());
        test.equal(nameMixup.numDefects(), 1);
        nameMixup.correctDefect(c[28].key());
        test.equal(nameMixup.numDefects(), 0);
        test.equal(c[28].c.givenName[0], "John");
        test.equal(c[28].c.familyName[0], "Doe");
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
