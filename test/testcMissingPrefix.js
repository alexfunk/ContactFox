require('./testutilities.js');
function setup() {
    missingPrefix = new cMissingPrefix();
    missingPrefix.setParent({
        changeEntry : function(contact) {
        }
    });

    var fixtures = getFixtures();
    c = [];
    $.each(fixtures, function(i, e) {
        c.push(new cContact(e));
    });
}

exports.cMissingPrefix = {
    'correctDefect' : function(test) {
        test.expect(3);
        setup();
        missingPrefix.checkContactForDefect(c[25]);
        missingPrefix.correctDefect(c[25].key(), "+49");
        test.equal(c[25].c.tel.length, 2, "after correcting this defect 2 numbers should remain");
        test.equal(c[25].c.tel[0].value, "+49421 5551234", "first should be +49421 5551234");
        test.equal(c[25].c.tel[1].value, "+49421 5554321", "second should be +49421 5554321");
        test.done();
    },
    'apendPreviewToContainer' : function(test) {
        test.expect(7);

        setup();
        // test adding prefix that result in a number already in the contact
        // should give a result like that
        // <div><span data-i18n="contact.givenName"></span><span> : </span><span
        // class="contactcontent">John</span></div><div><span
        // data-i18n="contact.familyName"></span><span> : </span><span
        // class="contactcontent">Doe</span></div><div><span
        // data-i18n="contact.tel"></span><span> 1: </span><span
        // class="contactcontent">+49421 5551234</span></div><div><span
        // data-i18n="contact.tel"></span><span> 2: </span><span
        // class="contactcontent"><span>+49421 555</span> <span
        // class="contactcontentremoved">1234</span> <span
        // class="contactcontentadded">4321</span> </span></div><div><span
        // data-i18n="contact.tel"></span><span> 3: </span><span
        // class="contactcontentremoved">0421 5551234</span></div><div><span
        // data-i18n="contact.tel"></span><span> 4: </span><span
        // class="contactcontentremoved">0421 5554321</span></div>
        missingPrefix.checkContactForDefect(c[25]);
        var domId = "diffXXX";
        $(document.body).append('<div id="' + domId + '"></div>');
        var div = $('#' + domId);
        missingPrefix.appendPreviewToContainer(div, c[25].key(), "+49");
        // console.log(div.html());
        test.ok((div.find('.contactcontentremoved').length + div.find('.contactcontentadded').length) > 0,
                "there should be at least 1 change");
        var added = div.find('.contactcontentadded');
        test.equal(added.length, 1, "there is one fragment added");
        test.equal(added.first().html(), "4321", "4321 is added");
        var removed = div.find('.contactcontentremoved');
        test.equal(removed.length, 3, "there is one fragment and two numbers removed");
        test.equal($(removed[0]).html(), "1234", "1234 is removed");
        test.equal($(removed[1]).html(), "0421 5551234", "0421 5551234 is removed");
        test.equal($(removed[2]).html(), "0421 5554321", "0421 5554321 is removed");

        test.done();
    }
};
