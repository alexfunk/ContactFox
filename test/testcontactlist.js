require('./testutilities.js');

var contactList = new cContactList();
exports.cContacts = {
    'list' : function(test) {
        var fixtures = getFixtures();
        var c = [];
        $.each(fixtures, function(i, e) {
            c.push(new cContact(e));
        });
        test.expect(23);

        test.equal(contactList.size(), 0);
        contactList.add(c[0].clone());
        test.equal(contactList.size(), 1);
        test.equal(contactList.hasDuplicates(), false);
        test.equal(contactList.getDefectList("DUPLICATES").hasDefects(), false);
        contactList.add(c[1].clone());
        test.equal(contactList.size(), 2);
        test.equal(contactList.hasDuplicates(), true);
        test.equal(contactList.getDefectList("DUPLICATES").hasDefects(), true);
        test.equal(contactList.numDuplicates(), 1);
        test.equal(contactList.getDefectList("DUPLICATES").numDefects(), 1);
        test.equal(contactList.hasMissingPrefix(), true);
        test.equal(contactList.getDefectList("MISSINGPREFIX").hasDefects(), true);
        test.equal(contactList.numMissingPrefix(), 2);
        test.equal(contactList.getDefectList("MISSINGPREFIX").numDefects(), 2);
        contactList.correctDuplicates(c[0].clone().key());
        test.equal(contactList.hasDuplicates(), false);
        test.equal(contactList.size(), 1);
        contactList.add(c[15].clone());
        test.equal(contactList.hasFunnyCharacters(), true);
        test.equal(contactList.getDefectList("FUNNYCHARS").hasDefects(), true);
        test.equal(contactList.numFunnyCharacters(), 1);
        test.equal(contactList.getDefectList("FUNNYCHARS").numDefects(), 1);
        contactList.getDefectList("FUNNYCHARS").correctDefect(c[15].clone().key());
        test.equal(contactList.hasFunnyCharacters(), false);
        test.equal(contactList.getDefectList("FUNNYCHARS").hasDefects(), false);
        test.equal(contactList.numFunnyCharacters(), 0);
        test.equal(contactList.getDefectList("FUNNYCHARS").numDefects(), 0);
        test.done();
    },
    'defectList._insertMissingPrefix' : function(test) {
        test.expect(7);
        var fixtures = getFixtures();
        var c = [];
        $.each(fixtures, function(i, e) {
            c.push(new cContact(e));
        });

        var missingPrefix = new cMissingPrefix();
        var cclone = c[10].clone();
        test.equal(missingPrefix._hasDefect(cclone), false);
        missingPrefix._insertMissingPrefix(cclone, "+44");
        test.equal(missingPrefix._hasDefect(cclone), false);
        cclone = c[11].clone();
        test.equal(missingPrefix._hasDefect(cclone), true);
        missingPrefix._insertMissingPrefix(cclone, "+49");
        test.equal(missingPrefix._hasDefect(cclone), false);
        cclone = c[12].clone();
        test.equal(missingPrefix._hasDefect(cclone), true);
        missingPrefix._insertMissingPrefix(cclone, "+49");
        test.equal(missingPrefix._hasDefect(cclone), false);
        cclone = c[14].clone();
        missingPrefix._insertMissingPrefix(cclone, "+49");
        test.equal(cclone.c.tel.length, 1);
        test.done();
    },
    'missingPrefix._hasDefect' : function(test) {
        test.expect(10);
        var fixtures = getFixtures();
        var c = [];
        $.each(fixtures, function(i, e) {
            c.push(new cContact(e));
        });
        var missingPrefix = new cMissingPrefix();

        test.equal(missingPrefix._hasDefect(c[0]), true);
        test.equal(missingPrefix._hasDefect(c[1]), true);
        test.equal(missingPrefix._hasDefect(c[2]), true);
        test.equal(missingPrefix._hasDefect(c[3]), true);
        test.equal(missingPrefix._hasDefect(c[4]), true);
        test.equal(missingPrefix._hasDefect(c[5]), true);
        test.equal(missingPrefix._hasDefect(c[6]), false);
        test.equal(missingPrefix._hasDefect(c[10]), false);
        test.equal(missingPrefix._hasDefect(c[11]), true);
        test.equal(missingPrefix._hasDefect(c[12]), true);
        test.done();
    },
    'contactList.integration' : function(test) {
        var fixtures = getFixtures();
        var c = [];
        $.each(fixtures, function(i, e) {
            c.push(new cContact(e));
        });
        var defects = [ "DUPLICATES", "MISSINGPREFIX", "FUNNYCHARS" ];
        // test.expect(c.length * defects.length * 3);
        var counter = 0;
        $.each(defects, function(j, listName) {
            $.each(c,
                    function(i, e) {
                        // if (i == 8) {
                        var contactList = new cContactList();
                        var defectList = contactList.getDefectList(listName);
                        contactList.add(e);
                        var idForMsg = listName + " " + e.key();
                        if (defectList.hasDefects()) {
                            test.equal(defectList.numDefects(), 1, "Has defect true, so num defects should be 1: "
                                    + idForMsg);
                            var domId = "diff" + counter++;
                            $(document.body).append('<div id="' + domId + '"></div>');
                            var div = $('#' + domId);
                            defectList.appendPreviewToContainer(div, e.key(), "+49");
                            var hasChanges = (div.find('.contactcontentremoved').length + div
                                    .find('.contactcontentadded').length) > 0;
                            if (!hasChanges)
                                console.log("no changes in index " + i + ": " + div.html());
                            test.ok(hasChanges, "changes need to be larger then 0: " + idForMsg);

                            defectList.correctDefect(e.key(), "+49");
                            // console.log("after " +
                            // JSON.stringify(defectList));
                        } else {
                            test.equal(defectList.numDefects(), 0, "no defects so numDefects should be null: "
                                    + idForMsg);
                        }
                        test.equal(defectList.numDefects(), 0);
                        // }
                    });
        });
        test.done();
    }
};
