require('./testutilities.js');
function setup() {
    funnyCharacters = new cFunnyCharacters();
    funnyCharacters.setParent({
        changeEntry : function(contact) {
        }
    });

    var fixtures = getFixtures();
    c = [];
    $.each(fixtures, function(i, e) {
        c.push(new cContact(e));
    });
}

exports.cCFunnyCharacters = {
    'correctDefect' : function(test) {
        test.expect(1);
        setup();
        funnyCharacters.checkContactForDefect(c[15]);
        funnyCharacters.correctDefect(c[15].key());
        test.equal(c[15].c.givenName[0], "Jöhn");
        test.done();
    },
    'checkContactForDefect' : function(test) {
        setup();
        test.expect(2);
        funnyCharacters.checkContactForDefect(c[0]);
        test.equal(funnyCharacters.numDefects(), 0);
        funnyCharacters.checkContactForDefect(c[15]);
        test.equal(funnyCharacters.numDefects(), 1);
        test.done();
    }
};
