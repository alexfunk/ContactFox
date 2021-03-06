cContactUtils = function() {};

cContactUtils.prototype = {
    /**
     * create a preview contact that would be created if this list of duplicate
     * contacts are merged
     * 
     * @param list
     *                of duplicate contacts
     */
    previewUnifiedContactList: function(list) {
        var primary = list[0].clone(); 
        for (var i = 1; i < list.length; i++) {
            var secondary = list[i];
            primary.unify(secondary);
        }
        return primary;
    },

    /**
     * adds some testdata to the phones adressbook to test the functions, even
     * if the addressbook is otherwise clean. It also adds them to the
     * contactlist, so the testdata is reflected in the app right away.
     */
    createDuplicateContactForTesting: function(contactList) {
        var contacts = [{
                givenName: ['John'],
                familyName: ['Doe'],
                name: ['John Doe'],
                tel: [{
                    type: ['voice'],
                    value: '0421 5551234'
                }],
                note: ['testContact'],
            }, {
                givenName: ['John'],
                familyName: ['Doe'],
                name: ['John Doe'],
                tel: [{
                    type: ['voice'],
                    value: '0421 5554321'
                }],
                note: ['testContact'] // to clean up test contacts
            },{
                givenName: ['John'],
                familyName: ['D\u00C3\u00B6'],
                name: ['John D\u00C3\u00B6'],
                tel: [{
                    type: ['voice'],
                    value: '0421 5554321'
                }],
                note: ['testContact'] // to clean up test contacts
            }, {
                givenName: ['Bart'],
                familyName: ['Simpson'],
                name: ['The Bartman'],
                tel: [{
                    type: ['voice'],
                    value: '0162 5554321'
                }],
                note: ['testContact'] // to clean up test contacts
            }

        ];
        $.each(contacts, function(i, e) {
            try {
                // this should work for b2g 1.2 and b2g 1.3
                var contact = new mozContact(e);
                if ("init" in contact)
                    contact.init(e);
                var saveResult = navigator.mozContacts.save(contact);
                saveResult.onerror = function() {
                    $('#' + ids.TEXTAREA).append(i + " contact saveError");
                };
                saveResult.onsuccess = function() {
                    $('#' + ids.TEXTAREA).append(i + "S!");
                };
                contactList.add(new cContact(contact));
            } catch (ex) {
                log(ex);
            }
        });
    },

    clearDuplicateContactForTesting: function() {
        var filter = {
            filterBy: ['note'],
            filterValue: 'testContact',
            filterOp: 'equals',
            filterLimit: 100
        };

        var request = window.navigator.mozContacts.find(filter);

        request.onsuccess = function() {
            $.each(result, function(i, e) {
                $('#' + ids.TEXTAREA).append("removing: " + e + " " + e.note);
                var deleteResult = navigator.mozContacts.remove(e);
                deleteResult.onerror = function() {
                    $('#' + ids.TEXTAREA)
                        .append("removing testContact removeError");
                };
                deleteResult.onsuccess = function() {
                    $('#' + ids.TEXTAREA).append(
                        "removing testContact removeSuccess");
                };

            });
        };

        request.onerror = function() {
            $('#' + ids.TEXTAREA).append("removing testContact failed");
        };
    },
    // by Garf
    getNewContactList: function()  {
        var newContactList = new cContactList();
        try {
             var allContacts = navigator.mozContacts.getAll();
             allContacts.onsuccess = function(event) {
                 try {
                     var cursor = event.target;
                     if (cursor.result) {
                         // the cursor contains a result: Another contact was
                            // found,
                         // so we add it to the contactList
                         var contact = new cContact(cursor.result);
                         newContactList.add(contact);
                         // find the next contact. This is marked as an error
                            // because
                         // the FirefoxOS API uses a reserved word as a
                            // function name
                         cursor.continue();
                         };
                    } catch (ex) {
                        log(ex);
                    };
                };
        } catch (exception) {
            log(exception);
        };
        return newContactList;
    },
    // returns whether a function-parameter is neither null nor undefined
    paramExists : function(param) {
        if ((param === null) && (param === undefined)) {
            return false;
        }
        return true;
    }
};

contactUtils = new cContactUtils();

// exports.cContact = cContact;
