cContactUtils = function() {};

cContactUtils.prototype = {
    appendUnifyListToUL: function(list, ul) {
        try {
            $.each(list, function(i, e) {
                try {
                    if (e.length > 1) {
                        var entry = e[0];
                        var html = '<li id="' +
                            entry.key() +
                            '"><a>' +
                            entry.displayName() +
                            '<span class="ui-li-count">' + e.length + '</span>' +
                            '</a></li>';
                        var li = ul.find('li');
                        var inserted = false;
                        $.each(li, function(i1, e1) {
                            var list = $(e1).data("list");
                            if (list.length > e.length) {
                                $(e1).insertBefore(html);
                                $('#' + entry.key()).data('list', e);
                            }
                        });
                        if (!inserted) {
                            ul.append(html);
                            ul.children().last().data("list", e);
                        }
                    }
                } catch (ex) {
                    log(ex);
                }
            });
        } catch (ex) {
            log(ex);
        }
    },
    unifyContactList: function(list) {
        var primary = list[0];
        for (var i = 1; i < list.length; i++) {
            var secondary = list[i];
            primary.unify(secondary);
        }
        return primary;
    },

    createDuplicateContactForTesting: function() {
        var contacts = [{
                givenName: ['John'],
                familyName: ['Doe'],
                name: ['John Doe'],
                tel: [{
                    type: 'mobile',
                    value: '0421 5551234'
                }],
                note: ['testContact'],
            }, {
                givenName: ['John'],
                familyName: ['Doe'],
                name: ['John Doe'],
                tel: [{
                    type: 'mobile',
                    value: '0421 5554321'
                }],
                note: ['testContact'], // to clean up test contacts
            }, {
                givenName: ['Bart'],
                familyName: ['Simpson'],
                name: ['The Bartman'],
                tel: [{
                    type: 'mobile',
                    value: '0162 5554321'
                }],
                note: ['testContact'], // to clean up test contacts
            }

        ];
        $.each(contacts, function(i, e) {
            var saveResult = navigator.mozContacts.save(e);
            saveResult.onerror = function() {
                $('#' + ids.TEXTAREA).append(i + " contact saveError");
            };
            saveResult.onsuccess = function() {
                $('#' + ids.TEXTAREA).append(i + "S!");
            };
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
    }
};

contactUtils = new cContactUtils();

//exports.cContact = cContact;
