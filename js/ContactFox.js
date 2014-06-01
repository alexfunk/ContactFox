// some pseudo-constants used in the applícation:

// the app is distributed amoung some pages that can be addressed by this ids
var pages = {
    INTRO: "pIntro",
    START: "pStart",
    DUPLICATES: "pDuplicates",
    CHANGECONTACT: "pChangeContact",
    FUNNYCHARS: "pFunnyCharacters",
    MISSINGPLUS: "pMissingPlus",
    ABOUT: "pAbout",
    DEBUG: "pDebug",
    RESTOREBACKUP: "pRestoreBackup"
};

// some elements in the pages have fixed ids that can be found here
var ids = {
    CONTACTLIST: "CONTACTLIST",
    MISSINGPREFIXLIST: "MISSINGPREFIXLIST",
    CONTACTCHANGE: "CONTACTCHANGE",
    TEXTAREA: "TEXTAREA",
    CONTACTSREAD: "CONTACTSREAD",
    CBINTRONOTAGAIN: "CBINTRONOTAGAIN",
    MISSINGPREFIXPANEL: "MISSINGPREFIXPANEL",
    MISSINGPREFIXCONTENT: "MISSINGPREFIXCONTENT",
    INPUTPREFIX: "INPUTPREFIX",
    SELECTPREFIX: "SELECTPREFIX",
    NUMDUPLICATES: "NUMDUPLICATES",
    NUMMISSINGPREFIX: "NUMMISSINGPREFIX",
    NUMFUNNYCHAR: "NUMFUNNYCHAR",
    NUMMESSAGES: "NUMMESSAGES",
    RESTOREBACKUPPANEL: "RESTOREBACKUPPANEL",
    RESTOREBACKUPCONTENT: "RESTOREBACKUPCONTENT",
    BUTTONRESTOREBACKUP: "ButtonRestoreBackup",
    BUTTONRESTOREBACKUPLOSE: "RestoreBackupClose"
};

// error messages are not only writen to the console, but to an textarea on the debug page
// so that we can trace problems even on an actual device.
// TODO: Add a Send Debug as email to developer function
function log(e) {
    console.log(e);
    $('#' + ids.TEXTAREA).append(e + "\n");
}

// all contacts are kept in this object during application runtime
var contactList = new cContactList();

/**
 * This function is usefull for debuging
 * TODO: Remove from the final product
 */
function getEventsList($obj) {
    var ev = [],
        events = jQuery._data($obj, "events"),
        i;
    for (i in events) {
        ev.push(i);
    }
    return ev.join(' ');
}

/**
 * This function is called once when the user interface is initialized
 */
function initApp() {
    // make the title a bit wider, so that more information
    // can be
    // displayed
    $('.ui-title').css({
        'margin-left': '10%',
        'margin-right': '10%'
    });

    // link pages with their buttons.
    // each button knows it destination page by the data-nav attibute
    var buttons = {};
    buttons[pages.DUPLICATES] = $('[data-nav="nav.pDuplicates"]');
    buttons[pages.DEBUG] = $('[data-nav="nav.pDebug"]');
    buttons[pages.START] = $('[data-nav="nav.home"]');
    buttons[pages.FUNNYCHARS] = $('[data-nav="nav.pFunnyCharacters"]');
    buttons[pages.MISSINGPLUS] = $('[data-nav="nav.pMissingPlus"]');
    buttons[pages.ABOUT] = $('[data-nav="nav.pAbout"]');
    $.each(buttons, function(key, value) {
        value.click(function(e) {
            $(':mobile-pagecontainer').pagecontainer("change", '#' + key);
        });
    });
    // if the start button is called, an extra function is called: loadContacts
    // to init the contactList from the contacts stored in the device.
    buttons[pages.START].click(function(e) {
        loadContacts();
    });
    // some functions for the buttons on other pages
    try {
        $('[data-i18n = "duplicates.mergeall"]').click(function(e) {
            mergeAll();
        });
        $('[data-i18n = "missingplus.correctall"]').click(function(e) {
            correctAll();
        });
    } catch (ex) {
        log(ex);
    }

    //    $('#' + ids.CBINTRONOTAGAIN).on("click", function(e) {
    //        try {
    //            e.preventDefault();
    //            var $checkbox = $(this).find(':checkbox');
    //            $checkbox.trigger("checked");
    //        } catch (ex) {
    //            log(ex);
    //        }
    //    });

    //Init i18n and replace text on objects in the class="i18n"
    i18n.init(function(t) {
        // translate app
        $(".i18n").i18n();
    });
    try {
        // check if the intro was disabled by the user, and proceed to the start page
        var intronotagain = window.localStorage.getItem("ContactFox." + ids.CBINTRONOTAGAIN);
        log("intronotagain was selected: " + intronotagain);
        if (intronotagain == 'true') {
            loadContacts();
            $(':mobile-pagecontainer').pagecontainer("change", '#' + pages.START);
        }
    } catch (ex) {
        log(ex);
    }
    // The intro explains the purpose of the app and ask the user to confirm 
    // the access to the contact list. 
    // By a checkbox the user can controll if he wants to see the intro again
    // on program start. 
    // It is initialized to not show the intro again. This setting is stored in local
    // storage so it is there on program start 
    var cb = $('#' + ids.CBINTRONOTAGAIN).find(':checkbox');
    cb.prop('checked', true).checkboxradio("refresh");
    window.localStorage.setItem("ContactFox." + ids.CBINTRONOTAGAIN, true);
    cb.bind('change', function(e) {
        var wasChecked = $(this).prop('checked');
        log("wasChecked " + wasChecked);
        window.localStorage.setItem("ContactFox." + ids.CBINTRONOTAGAIN, wasChecked);
    });
    // For debugging log all events that are bound to the checkbox and look if the state changed  
    //log("EventList: " + getEventsList(cb[0]));
    //cb.on(getEventsList(cb[0]), function(e) {
    //    try {
    //        log("checkbox event: " + e.type);
    //        var wasChecked = $(this).prop('checked');
    //        log("Checkbox was checked " + wasChecked);
    //    } catch (ex) {
    //        log(ex);
    //    }
    //});
    $('#' + ids.SELECTPREFIX).bind('change', function(e) {
        var value = $('#' + ids.SELECTPREFIX).val();
        log("selectedPrefix: " + value);
        $('#' + ids.INPUTPREFIX).val(value);
    });
    $('#' + ids.INPUTPREFIX).bind('change', function(e) {
        var prefix = $("#" + ids.INPUTPREFIX).val();
        $('#' + ids.SELECTPREFIX + ' option').filter(function() {
            return $(this).text() == prefix;
        }).prop('selected', true);
        $('#' + ids.SELECTPREFIX).selectmenu('refresh', true);
    });
}

/**
 * depending on the content of the contact some functions are available or not.
 * If there is nothing to do the button for this function is disabled
 * This is done in this function
 */
function updateButtons() {
    if (contactList.hasDuplicates()) {
        $('[data-nav="nav.pDuplicates"]').removeClass('ui-disabled');
    } else {
        $('[data-nav="nav.pDuplicates"]').addClass('ui-disabled');
    }
    var nd = contactList.numDuplicates();
    $('#' + ids.NUMDUPLICATES).html(nd);
    if (contactList.hasFunnyCharacters()) {
        $('[data-nav="nav.pFunnyCharacters"]').removeClass('ui-disabled');
    } else {
        $('[data-nav="nav.pFunnyCharacters"]').addClass('ui-disabled');
    }
    $('#' + ids.NUMFUNNYCHARACTERS).html(contactList.numFunnyCharacters());
    if (contactList.hasMissingPrefix()) {
        $('[data-nav="nav.pMissingPlus"]').removeClass('ui-disabled');
    } else {
        $('[data-nav="nav.pMissingPlus"]').addClass('ui-disabled');
    }
    $('#' + ids.NUMMISSINGPREFIX).html(contactList.numMissingPrefix());
    // if the list changed, also replace the html lists on the pages
    replaceMissingPrefixListHTML();
}

/**
 * Read the contacts from the firefox OS device using its api.
 */
function loadContacts() {
    try {
        updateButtons();
        if (contactList.size() === 0) {
            contactList.addChangeListener(updateButtons);
            var allContacts = navigator.mozContacts.getAll({
                sortBy: "familyName",
                sortOrder: "descending"
            });

            allContacts.onsuccess = function(event) {
                try {
                    var cursor = event.target;
                    if (cursor.result) {
                        var contact = new cContact(cursor.result);
                        contactList.add(contact);
                        try {
                            $('#' + ids.CONTACTSREAD).text(" " + contactList.size());
                            // updateButtons();
                        } catch (ex) {
                            log(ex);
                        }
                        cursor.
                        continue();
                    } else {
                        addListsToHTML();
                    };
                } catch (ex) {
                    log(ex);
                };
            };

            allContacts.onerror = function() {
                //TODO: better error handling and i18n
                alert("Can not read your contacts. Did you give permissions?");
                log("Something went terribly wrong! :(");
            };
        };
    } catch (exception) {
        log(exception);
    };
}

/**
 * when all lists for the problems are available or they are changes, they are enterd into the 
 * application document
 */ 
function addListsToHTML() {
    replaceDuplicatesListHTML();
    replaceMissingPrefixListHTML();
}

/**
 * create the HTML-Code for the duplicates list and replace it at the prepared ID in the DOM
 */
function replaceDuplicatesListHTML() {
    // duplicates
    // let jquery mobile make this list filterable
    var cls = '#' + ids.CONTACTLIST;
    $(cls).empty();
    $(cls).append('<ul data-filter="true"></ul>');
    contactList.appendUnifyListToUL($(cls + ' ul'));
    $(cls + ' ul li').click(function(event) {
        mergeContactSelected(event);
    });
    $(cls + " ul").listview()
        .listview('refresh');
}

/**
 * create the HTML-Code for the missing prefix list and replace it at the prepared ID in the DOM
 */
function replaceMissingPrefixListHTML() {
    //missingprefix
    // let jquery mobile make this list filterable
    var mls = '#' + ids.MISSINGPREFIXLIST;
    $(mls).empty();
    $(mls).append('<ul data-filter="true"></ul>');
    contactList.appendMissingPrefixListToUL($(mls + ' ul'));
    $(mls + ' ul li').click(function(event) {
        addPrefixContactSelected(event);
    });
    $(mls + " ul").listview()
        .listview('refresh');
}

/**
 * this merges all contacts in one entry of the duplicates list.
 * It is also hidden from the list view after that.
 */
function merge(id) {
    $('#' + id).css("display", "none");
    contactList.merge(id);
}

/**
 * merge all entries in the duplicates list
 */
function mergeAll() {
    try {
        var cls = '#' + ids.CONTACTLIST;
        $(cls + ' ul li').each(function(i, e) {
            if (!$(e).hasClass('ui-screen-hidden')) {
                var id = $(e).attr("id");
                merge(id);
            }
        });
    } catch (ex) {
        log(ex);
    }
}

/**
 * This is called when one entry in the dpulicates list is selected. A submenu is opened showing
 * the potential result of the merge. Butons are created to apply or cancel the merge 
 */
function mergeContactSelected(event) {
    try {
        var li = $(event.target).parent();
        var id = li.attr("id");
        var data = li.data("list");
        if (data.length > 0) {
            var contact = contactUtils.unifyContactList(data);
            var cname = contact.displayName();
            // TODO use a template
            var n = $('#' + ids.CONTACTCHANGE);
            n.empty();
            var mergeButtonID = 'merge' + contact.key();
            n.append('<a data-role="button" data-i18n="contact.merge" id="' + mergeButtonID + '"></a>');
            n.append('<div class="contactaction" data-i18n="contact.keep"></div>');
            n.append('<div><span data-i18n="contact.name"></span><span>: </span><span class="contactcontent" >' + cname + '</span></div>');
            contact.appendAsString(n);
            n.append('<div><span  class="contactaction" data-i18n="contact.delete"></span><span>: </span><span class="contactcontent" >' + (data.length - 1) + ' </span> <span data-i18n="contact.copies"></span></div>');
            $('.contactcontent').css('font-weight', 'bold');
            $('.contactaction').css('color', 'blue');
            $('.contactaction').css('font-style', 'italic');
            $('#' + mergeButtonID).data("contact", contact);
            $('#' + mergeButtonID).data("data", data);
            $('#' + mergeButtonID).click(function(e) {
                try {
                    var contact = $(this).data("contact");
                    merge(contact.key());
                    $(':mobile-pagecontainer').pagecontainer("change", '#' + pages.DUPLICATES);
                } catch (ex) {
                    log(ex);
                }
            });

            // translate all
            $('#' + ids.CONTACTCHANGE).i18n();

            // apply styles to the newly created subelements of the page
            $('#' + pages.CHANGECONTACT).trigger("create");
            $(':mobile-pagecontainer').pagecontainer("change", '#' + pages.CHANGECONTACT);
        }
    } catch (exception) {
        log(exception);
    }
}

/**
 * correct the prefix in all phonenumbers of the given contact 'c' with the given 'prefix'
 * The contact is than hidden from the missing prefix list
 */ 
function correctPrefix(c, prefix) {
    log("correctPrefix " + c.key() + " " + prefix);
    contactList.correctPrefix(c.key(), prefix);
    $('#prefix' + c.key()).hide();
}

/**
 * correct all contacts in the missing prefix list
 */
function correctAll() {
    try {
        var prefix = $("#" + ids.INPUTPREFIX).val();
        var mpls = '#' + ids.MISSINGPREFIXLIST;
        $(mpls + ' ul li').each(function(i, e) {
            if (!$(e).hasClass('ui-screen-hidden')) {
                var id = $(e).attr("id");
                id = id.substring("prefix".length);
                c = contactList.getById(id);
                correctPrefix(c, prefix);
            }
        });
    } catch (ex) {
        log(ex);
    }
}

/**
 * This is called when an item in the missing prefix list is selected.
 * it opens a submenu, letting the user decide if he wants to correct this entry.
 */
function addPrefixContactSelected(event) {
    try {
        var prefix = $("#" + ids.INPUTPREFIX).val();
        var li = $(event.target).parent();
        var id = li.attr("id");
        var c = contactList.getById(id.substring('prefix'.length));
        var panel = $('#' + ids.MISSINGPREFIXPANEL);
        var content = $('#' + ids.MISSINGPREFIXCONTENT);
        content.empty();
        c.appendAsString(content);
        panel.i18n();
        panel.trigger("updatelayout");
        $('#close').click(function(e) {
            panel.panel("close");
        });
        $('#correct').click(function(e) {
            try {
                log("correct clicked");
                panel.panel("close");
                correctPrefix(c, prefix);
            } catch (ex) {
                log(ex);
            }
        });
        panel.panel("open");
    } catch (exception) {
        log(exception);
    }
}

// Init the start page
$(document)
    .on(
        'pagecreate',
        '#' + pages.INTRO,
        function() {
            try {
                initApp();
            } catch (e) {
                log(e);
            }
        });

$(document)
    .on(
        'pagecreate',
        '#' + pages.DEBUG,
        function() {
            try {
                $('[data-i18n = "debug.addtestdata"]').click(function(e) {
                    try {
                        contactUtils.createDuplicateContactForTesting(contactList);
                    } catch (ex) {
                        log(ex);
                    }
                });
                $('[data-i18n = "debug.showintroagain"]').click(function(e) {
                    try {
                        log("showintroagain clicked");
                        var cb = $('#' + ids.CBINTRONOTAGAIN).find(':checkbox');
                        cb.prop('checked', false).checkboxradio("refresh");
                        cb.trigger("change");
                        var intronotagain = window.localStorage.getItem("ContactFox." + ids.CBINTRONOTAGAIN);
                        log("intronotagain was selected: " + intronotagain);
                    } catch (ex) {
                        log(ex);
                    }
                });
                //TODO: Add click function for backup restore
            } catch (ex) {
                log(ex);
            }
        });
