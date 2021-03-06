// some pseudo-constants used in the application:

// the app is distributed among some pages that can be addressed by this IDs
var pages = {
    HELP: "pHelp",
    HOME: "pHome",
    DUPLICATES: "pDuplicates",
    CHANGECONTACT: "pChangeContact",
    FUNNYCHARS: "pFunnyCharacters",
    MISSINGPREFIX: "pMissingPrefix",
    NAMEMIXUP: "pNameMixup",
    ABOUT: "pAbout",
    DEBUG: "pDebug",
    RESTOREBACKUP: "pRestoreBackup"
};

// some elements in the pages have fixed IDs that can be found here
var ids = {
    MISSINGPREFIXLIST: "MISSINGPREFIXLIST",
    MISSINGPREFIXPANEL: "MISSINGPREFIXPANEL",
    MISSINGPREFIXCONTENT: "MISSINGPREFIXCONTENT",
    BUTTONMISSINGPREFIXCORRECT : "BUTTONMISSINGPREFIXCORRECT",
    BUTTONMISSINGPREFIXCLOSE : "BUTTONMISSINGPREFIXCLOSE",
    TEXTAREA_MISSINGPREFIX: "TEXTAREA_MISSINGPREFIX",
    NUMMISSINGPREFIX: "NUMMISSINGPREFIX",
    SELECTPREFIX: "SELECTPREFIX",
    INPUTPREFIX: "INPUTPREFIX",
    
    CONTACTLIST: "CONTACTLIST",    
    CONTACTCHANGE: "CONTACTCHANGE",
    NUMCONTACTSREAD: "NUMCONTACTSREAD",
    
    // DUPLICATES
    DUPLICATESCONTENT: "DUPLICATESCONTENT",
    DUPLICATESPANEL: "DUPLICATESPANEL",
    BUTTONDUPLICATESCORRECT : "BUTTONDUPLICATESCORRECT",
    BUTTONDUPLICATESCLOSE : "BUTTONDUPLICATESCLOSE",
    TEXTAREA_DUPLICATES: "TEXTAREA_DUPLICATES",
    NUMDUPLICATES: "NUMDUPLICATES",
    
    // FUNNYCHARS
    TEXTAREA_FUNNYCHARS: "TEXTAREA_FUNNYCHARS",
    NUMFUNNYCHARS: "NUMFUNNYCHARS",
    FUNNYCHARSPANEL: "FUNNYCHARSPANEL",
    FUNNYCHARSCONTENT: "FUNNYCHARSCONTENT",
    FUNNYCHARSLIST: "FUNNYCHARSLIST",
    BUTTONFUNNYCHARS: "BUTTONFUNNYCHARS",
    BUTTONFUNNYCHARSCLOSED: "BUTTONFUNNYCHARSCLOSED",
    
    // NAMEMIXUP
    TEXTAREA_NAMEMIXUP: "TEXTAREA_NAMEMIXUP",
    NUMNAMEMIXUP: "NUMNAMEMIXUP",
    NAMEMIXUPPANEL: "NAMEMIXUPPANEL",
    NAMEMIXUPCONTENT: "NAMEMIXUPCONTENT",
    NAMEMIXUPLIST: "NAMEMIXUPLIST",
    BUTTONNAMEMIXUPCORRECT : "BUTTONNAMEMIXUPCORRECT",
    BUTTONNAMEMIXUPCLOSE: "BUTTONNAMEMIXUPCLOSE",
    
    // RESTOREBACKUP
    TEXTAREA_RESTOREBACKUP:  "TEXTAREA_RESTOREBACKUP",
    RESTOREBACKUPPANEL: "RESTOREBACKUPPANEL",
    RESTOREBACKUPCONTENT: "RESTOREBACKUPCONTENT",
    RESTOREBACKUPLIST: "RESTOREBACKUPLIST",
    BUTTONRESTOREBACKUP: "BUTTONRESTOREBACKUP",
    BUTTONRESTOREBACKUPLOSE: "RESTOREBACKUPCLOSE",    
    
    TEXTAREA: "TEXTAREA",
    CBHELPNOTAGAIN: "CBHELPNOTAGAIN",
    NUMMESSAGES: "NUMMESSAGES",
    BEXIT: "BEXIT"

};

var numMessages = 0;
// error messages are not only written to the console, but to an text-area on
// the debug page so that we can trace problems even on an actual device.
// TODO: Add a Send Debug as email to developer function
function log(e, target) {
    window.navigator.vibrate(100);
    console.log(e);
    // $('#' + ids.TEXTAREA).append(e + "\n");
    $('#' + ids.TEXTAREA).prepend(e + "\n");
    if (contactUtils.paramExists(target)) {
        $('#' + target).prepend(e + "\n");
    }
    $('#' + ids.NUMMESSAGES).text(" " + numMessages++);

}

// all contacts are kept in this object during application runtime
var contactList = new cContactList();


/**
 * This function is use-full for debugging TODO: Remove from the final product
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
    // can be displayed
    $('.ui-title').css({
        'margin-left': '10%',
        'margin-right': '10%'
    });

    // link pages with their buttons.
    // each button knows its destination page by the data-nav attribute
    var buttons = {};
    buttons[pages.DUPLICATES] = $('[data-nav="nav.pDuplicates"]');
    buttons[pages.DEBUG] = $('[data-nav="nav.pDebug"]');
    buttons[pages.HOME] = $('[data-nav="nav.home"]');
    buttons[pages.FUNNYCHARS] = $('[data-nav="nav.pFunnyCharacters"]');
    buttons[pages.MISSINGPREFIX] = $('[data-nav="nav.pMissingPrefix"]');
    buttons[pages.NAMEMIXUP] = $('[data-nav="nav.pNameMixup"]');
    buttons[pages.ABOUT] = $('[data-nav="nav.pAbout"]');
    // byGarf
    buttons[pages.HELP] = $('[data-nav="nav.pHelp"]');
    buttons[pages.RESTOREBACKUP] = $('[data-nav="nav.pRestoreBackup"]');
    // /byGarf
    $.each(buttons, function(key, value) {
        value.click(function(e) {
            $(':mobile-pagecontainer').pagecontainer("change", '#' + key);
        });
    });
    // if the home button is pressed the first time, an extra function is
    // called: loadContacts() to init the contactList from the contacts stored
    // in the device.
    buttons[pages.HOME].click(function(e) {
        loadContacts();
    });
    // exit
    $('#' + ids.BEXIT).click(function(e) {
        window.close();
    });
    // some functions for the buttons on other pages
    try {
        $('[data-i18n = "duplicates.mergeall"]').click(function(e) {
            mergeAll();
        });
        $('[data-i18n = "MissingPrefix.correctall"]').click(function(e) {
            correctAllMissingPrefix();
        });
        $('[data-i18n = "funnycharacters.correctall"]').click(function(e) {
            correctAllFunnyChars();
        });
        $('[data-i18n = "NameMixup.correctall"]').click(function(e) {
            correctAllNameMixup();
        });
    } catch (ex) {
        log(ex);
    }

    // $('#' + ids.CBHELPNOTAGAIN).on("click", function(e) {
    // try {
    // e.preventDefault();
    // var $checkbox = $(this).find(':checkbox');
    // $checkbox.trigger("checked");
    // } catch (ex) {
    // log(ex);
    // }
    // });

    // Init i18n and replace text on objects in the class="i18n"
    i18n.init(function(t) {
        // translate app
        $(".i18n").i18n();
    });
    try {
        // check if the help was disabled by the user, and proceed to the home
        // page
        var helpnotagain = window.localStorage.getItem("ContactFox." + 
                ids.CBHELPNOTAGAIN);
        log("helpnotagain was selected: " + helpnotagain);
        if (helpnotagain == 'true') {
            loadContacts();
            $(':mobile-pagecontainer').pagecontainer("change", '#' + 
                    pages.HOME);
        }
    } catch (ex) {
        log(ex);
    }
    // The help explains the purpose of the app and ask the user to confirm
    // the access to the contact list.
    // By a checkbox the user can control if he wants to see the help again
    // on program start.
    // It is initialized to not show the help again. This setting is stored in
    // local
    // storage so it is there on program start
    var cb = $('.checkbox-help');
    cb.prop('checked', true).checkboxradio("refresh");
    window.localStorage.setItem("ContactFox." + ids.CBHELPNOTAGAIN, true);
    cb.bind('change', function(e) {
        var wasChecked = $(this).prop('checked');
        window.localStorage.setItem("ContactFox." + ids.CBHELPNOTAGAIN, wasChecked);
    });
    // For debugging log all events that are bound to the checkbox and look if
    // the state changed
    // log("EventList: " + getEventsList(cb[0]));
    // cb.on(getEventsList(cb[0]), function(e) {
    // try {
    // log("checkbox event: " + e.type);
    // var wasChecked = $(this).prop('checked');
    // log("Checkbox was checked " + wasChecked);
    // } catch (ex) {
    // log(ex);
    // }
    // });
    $('#' + ids.SELECTPREFIX).bind('change', function(e) {
        var value = $('#' + ids.SELECTPREFIX).val();
        $('#' + ids.INPUTPREFIX).val(value);
    });
    $('#' + ids.INPUTPREFIX).bind('change', function(e) {
        var prefix = $("#" + ids.INPUTPREFIX).val();
        $('#' + ids.SELECTPREFIX + ' option').filter(function() {
            return $(this).text() == prefix;
        }).prop('selected', true);
        $('#' + ids.SELECTPREFIX).selectmenu('refresh', true);
    });
    // All links that should open in browser shall have the ".open-inbrowser"
    // class and the "data-url"
    // Attribute with the url to open. So they use this function, when clicked.
    $(".open-in-browser").click(function(e) {
        var url = $(this).data("url");
        openLinkInBrowser(url);
    });
    $('[data-i18n = "debug.sendToSupport"]').click(function(e) {
        try {
           sendEMailToSupport($('#' + ids.TEXTAREA).text());
        } catch (ex) {
           log(ex);
        }
    });
}

/**
 * depending on the content of the contact some functions are available or not.
 * If there is nothing to do the button for this function is disabled This is
 * done in this function
 */
function updateButtons() {
    var pages = [
      { defect: 'DUPLICATES',
        button: $('[data-nav="nav.pDuplicates"]'),
        numdiv: $('#' + ids.NUMDUPLICATES) },
      { defect: 'FUNNYCHARS',
        button: $('[data-nav="nav.pFunnyCharacters"]'),
        numdiv: $('#' + ids.NUMFUNNYCHARS) },
      { defect: 'MISSINGPREFIX',
        button: $('[data-nav="nav.pMissingPrefix"]'),
        numdiv: $('#' + ids.NUMMISSINGPREFIX) },
          { defect: 'NAMEMIXUP',
        button: $('[data-nav="nav.pNameMixup"]'),
        numdiv: $('#' + ids.NUMNAMEMIXUP) },
        
    ];
        // for all defect pages: update enabled and number of defects
        // -----------------------
    for (var i = 0; i < pages.length; i++) {
        if (contactList.getDefectList(pages[i].defect).hasDefects()) {
            pages[i].button.removeClass('ui-disabled');
        } else {
            pages[i].button.addClass('ui-disabled');
        }
        var nd = contactList.getDefectList(pages[i].defect).numDefects();
        pages[i].numdiv.html(nd);
    
    }
    // -----------------------------------------------------------------------
    // if the list changed, also replace the html lists on the pages
    replaceAllListsInHTML();
    // update the number of contacts read at all------------------------------
    $('#' + ids.NUMCONTACTSREAD).text(" " + contactList.size());

}

/**
 * Read the contacts from the firefox OS device using its api. Called by
 * buttonHome and pHelp
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
                        // the cursor contains a result: Another contact was
                        // found, so we add it to the contactList
                        var contact = new cContact(cursor.result);
                        
                        // The contactlist is a smart list which is aware of
                        // all defects at any time. So the contact is not only
                        // added but also tested for defects.
                        contactList.add(contact);
                        // find the next contact. This is marked as an error
                        // because the FirefoxOS API uses a reserved word as
                        // a function name
                        cursor.
                        continue();
                    } else {
                        // no more contacts were found:
                        // TODO: Show the user, that the processing is complete
                        log("reading contacts complete");
                    };
                } catch (ex) {
                    log(ex);
                };
            };

            allContacts.onerror = function() {
                // TODO: better error handling and i18n
                alert("Can not read your contacts. Did you give permissions?");
                log("Can not read your contacts. Did you give permissions?");
            };
        };
    } catch (exception) {
        log(exception);
    };
}

/**
 * when all lists for the problems are available or there are changes, they are
 * entered into the application document
 */
function replaceAllListsInHTML() {
    replaceDuplicatesListHTML();
    replaceMissingPrefixListHTML();
    replaceFunnyCharListHTML();
    replaceNameMixupListHTML();
}

/**
 * create the HTML-Code for the duplicates list and replace it at the prepared
 * ID ids.CONTACTLIST in the DOM
 */
function replaceDuplicatesListHTML() {
    // duplicates
    var cls = '#' + ids.CONTACTLIST;
    $(cls).empty();
    // let jquery mobile make this list filterable by setting data-filter to
    // true
    $(cls).append('<ul data-filter="true"></ul>');
    contactList.appendUnifyListToUL($(cls + ' ul'));
    $(cls + ' ul li').click(function(event) {
        showMergeContactSelected(event);
    });
    $(cls + " ul").listview()
        .listview('refresh');
}

/**
 * create the HTML-Code for the missing prefix list and replace it at the
 * prepared ID in the DOM
 */
function replaceMissingPrefixListHTML() {
    // missingprefix
    var mls = '#' + ids.MISSINGPREFIXLIST;
    $(mls).empty();
    // let jquery mobile make this list filterable by setting data-filter to
    // true
    $(mls).append('<ul data-filter="true"></ul>');
    contactList.appendMissingPrefixListToUL($(mls + ' ul'));
    $(mls + ' ul li').click(function(event) {
        showContactSelected(event, 'MISSINGPREFIX');
    });
    $(mls + " ul").listview()
        .listview('refresh');
}
/**
 * create the HTML-Code for the list and replace it at the prepared ID in the
 * DOM
 */
function replaceFunnyCharListHTML() {
    // funny chars
    var mls = '#' + ids.FUNNYCHARSLIST;
    $(mls).empty();
    // let jquery mobile make this list filterable by setting data-filter to
    // true
    $(mls).append('<ul data-filter="true"></ul>');
    contactList.appendFunnyCharacterListToUL($(mls + ' ul'));
    $(mls + ' ul li').click(function(event) {
        try {
           showContactSelected(event, 'FUNNYCHARS');
        } catch (ex) {
            log(ex);
        }
    });
    $(mls + " ul").listview()
        .listview('refresh');
}

/**
 * create the HTML-Code for the list and replace it at the prepared ID in the
 * DOM
 */
function replaceNameMixupListHTML() {
    // funny chars
    var mls = '#' + ids.NAMEMIXUPLIST;
    $(mls).empty();
    // let jquery mobile make this list filterable by setting data-filter to
    // true
    $(mls).append('<ul data-filter="true"></ul>');
    contactList.getDefectList("NAMEMIXUP").addToUI($(mls + ' ul'));
    $(mls + ' ul li').click(function(event) {
        try {
           showContactSelected(event, 'NAMEMIXUP');
        } catch (ex) {
            log(ex);
        }
    });
    $(mls + " ul").listview()
        .listview('refresh');
}

// fill the backup list on the backup page
function replaceBackupListHTML() {
    var buls = '#' + ids.RESTOREBACKUPLIST;
    $(buls).empty();
    // let jquery mobile make this list filterable by setting data-filter to
    // true
    $(buls).append('<ul data-filter="true"></ul>');
    cContact._backup.appendBackupListToUL($(buls + ' ul'));
    $(buls + ' ul li').click(function(event) {
        showContactSelected(event, 'RESTOREBACKUP');
    });
    $(buls + " ul").listview()
        .listview('refresh');
}

/**
 * this merges all contacts in one entry of the duplicates list. It is also
 * hidden from the list view after that.
 */
function merge(id) {
    contactList.correctDuplicates(id);
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
                contactList.correctDuplicates(id);
            }
        });
    } catch (ex) {
        log(ex);
    }
}

/**
 * This is called when an entry in the duplicates list is selected. A submenu is
 * opened showing the potential result of the merge. Buttons are created to
 * apply or cancel the merge This is different from the other defects, that are
 * implemented in "showContactSelected"
 * 
 * @event contains the id of the selected contact
 */
function showMergeContactSelected(event) {
    try {
        var li = $(event.target).parent();
        var data = li.data("list");
        if (data.length > 0) {
            var contact = contactUtils.previewUnifiedContactList(data);
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
            // show the ids of all contact objects for debugging
            // $.each(data, function(i, c) {n.append('<div>' + c.c.id +
            // '</div>');});
            
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
 * correct the prefix in all phonenumbers of the given contact 'c' with the
 * given 'prefix' The contact is than hidden from the missing prefix list
 */
function correctPrefix(c, prefix) {
    log("correctPrefix " + c.key() + " " + prefix);
    contactList.correctPrefix(c.key(), prefix);
}

/**
 * correct all contacts in the missing prefix list
 */
function correctAllMissingPrefix() {
    try {
        var prefix = $("#" + ids.INPUTPREFIX).val();
        contactList.getDefectList("MISSINGPREFIX").correctAll(prefix);
    } catch (ex) { 
        log(ex);
    }
}

/**
 * correct all contacts in the funny character list
 */
function correctAllFunnyChars() {
    try {
        contactList.getDefectList("FUNNYCHARS").correctAll();
    } catch (ex) { 
        log(ex);
    }
}

/**
 * correct all contacts in the funny character list
 */
function correctAllNameMixup() {
    try {
        contactList.getDefectList("NAMEMIXUP").correctAll();
    } catch (ex) { 
        log(ex);
    }
}


/**
 * This is called when an item in the missing prefix list is selected. it opens
 * a submenu, letting the user decide if he wants to correct this entry.
 *//**
     * function showPrefixContactSelected(event) { try { var li =
     * $(event.target).parent(); var id =
     * li.attr("id").substring('prefix'.length);
     * 
     * var c = contactList.getById(id); var panel = $('#' +
     * ids.MISSINGPREFIXPANEL); var content = $('#' + ids.MISSINGPREFIXCONTENT);
     * content.empty(); // save the current selected id in a content data
     * attribute content.data("contactid", id); c.appendAsString(content);
     * panel.i18n(); panel.trigger("updatelayout"); panel.panel("open"); } catch
     * (exception) { log(exception); } }
     */
/**
 * This is called when an item in a list is selected. It opens a submenu in a
 * panel, that displays the content of the defect contact and how it will be
 * corrected. The panel lets the user decide if he wants to correct this entry
 * or to cancel the operation.
 * 
 * @param event
 *                the click event with the source of the click, that contains
 *                the ID of the selected contact
 * @param listname
 *                the name of the list, this also determines the IDs of the
 *                elements to edit
 */
function showContactSelected(event, listname) {
    try {
        // get the li element that was clicked in this event
        var li = $(event.target).parent();
        // the id attribute of the li element always has the from
        // listname + contactid. so we extract the id of the contact like that:
        var id = li.attr("id").substring(listname.length);
        listname = listname.toUpperCase();
        // get the panel and the content of the panel for the given listname:
        var panelname = ids[ listname + 'PANEL'];
        var panel = $('#' + panelname);
        var contentname = ids[ listname + 'CONTENT'];
        var content = $('#' + contentname);
        // remove everything that was in the content of the panel before
        content.empty();
        // save the current selected id in a content data attribute
        content.data("contactid", id);
        // show an html representation of the contact in the panel
        // log("listname.indexOf('BACKUP'): " + listname + " " +
        // listname.indexOf("BACKUP"));
        if (listname.indexOf("BACKUP") != -1) {
            c = cContact._backup.getBackupContactById(id);
            c.appendAsString(content);
        } else {
            updatePreview(content, listname, id);
        }
        panel.i18n();
        panel.trigger("updatelayout");
        panel.panel("open");
    } catch (exception) {
        log(exception);
    }
}

function updatePreview(content, listname, id) {
    var params;
    if (listname == "MISSINGPREFIX")
        params = $("#" + ids.INPUTPREFIX).val();
    else if (listname == "NAMEMIXUP") {
        var switchNames = $('.checkbox-namemixup').prop('checked');
        params = { "switch" : switchNames};
    }
    else
        params = null;
    contactList.getDefectList(listname).appendPreviewToContainer(content, id, params);
    $('.contactcontent').css('font-weight', 'bold');
    $('.contactcontentadded').css('color', 'green');
    $('.contactcontentremoved').css('color', 'red');
    $('.contactcontentremoved').css('text-decoration', 'line-through');
    $('.contactaction').css('font-style', 'italic');

}

/**
 * This is called when an item in the restore backup list is selected. it opens
 * a submenu, letting the user decide if he wants to correct this entry.
 *//**
     * function showBackupContactSelected(event) { try { var li =
     * $(event.target).parent(); var id =
     * li.attr("id").substring('RestoreBackup'.length); var c =
     * cContact._backup.getBackupContactById(id); var panel = $('#' +
     * ids.RESTOREBACKUPPANEL); var content = $('#' + ids.RESTOREBACKUPCONTENT);
     * content.empty(); c.appendAsString(content); panel.i18n();
     * panel.trigger("updatelayout"); panel.panel("open"); } catch (exception) {
     * log(exception); } }
     */

// Init the help page
$(document)
    .on(
        'pagecreate',
        '#' + pages.HELP,
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
                $('[data-i18n = "debug.restorebackup"]').click(function(e) {
                    try {
                        log("debug.restorebackup clicked");
                        replaceBackupListHTML();
                     } catch (ex) {
                        log(ex);
                     }
                });
                $('[data-i18n = "restorebackup.restoreall"]').click(function(e) {
                    try {
                        log("restorebackup.restoreall clicked");
                     } catch (ex) {
                        log(ex);
                     }
                });
                
            } catch (ex) {
                log(ex);
            }
        });

/**
 * Define the event handlers for the missing prefix page and its panel. This has
 * to be done only once on page create.
 */
$(document)
.on(
    'pagecreate',
    '#' + pages.MISSINGPREFIX,
    function() {
        try {
            var panel = $('#' + ids.MISSINGPREFIXPANEL);
            // if the close button is pressed, the panel is closed and
            // the list is shown again.
            $('#' + ids.BUTTONMISSINGPREFIXCLOSE).click(function(e) {
                panel.panel("close");
            });
            $('#' + ids.BUTTONMISSINGPREFIXCORRECT).click(function(e) {
                try {
                    // what prefix ins to be added to the current contact
                    var prefix = $("#" + ids.INPUTPREFIX).val();
                    // find the content object to extract the current id
                    var content = $('#' + ids.MISSINGPREFIXCONTENT);
                    // get the saved current selected id from the content data
                    // attribute
                    var id = content.data("contactid");
                    // get the contact for this id
                    var c = contactList.getById(id);
                    // log("correct clicked: " + id);
                    panel.panel("close");
                    // and finally perform the requested operation
                    correctPrefix(c, prefix);
                } catch (ex) {
                    log(ex);
                }
            });
        } catch (e) {
            log(e);
        }
    });

/**
 * Define the event handlers for the duplicates page and its panel. This has to
 * be done only once on page create.
 */
$(document)
.on(
    'pagecreate',
    '#' + pages.DUPLICATES,
    function() {
        try {
            var panel = $('#' + ids.DUPLICATESPANEL);
            // if the close button is pressed, the panel is closed and
            // the list is shown again.
            $('#' + ids.BUTTONDUPLICATESCLOSE).click(function(e) {
                panel.panel("close");
            });
            $('#' + ids.BUTTONDUPLICATESCORRECT).click(function(e) {
                try {
                    // what prefix ins to be added to the current contact
                    // var prefix = $("#" + ids.INPUTPREFIX).val();
                    // find the content object to extract the current id
                    var content = $('#' + ids.DUPLICATESCONTENT);
                    // get the saved current selected id from the content data
                    // attribute
                    var id = content.data("contactid");
                    // get the contact for this id
                    var c = contactList.getById(id);
                    // log("correct clicked: " + id);
                    panel.panel("close");
                    // and finally perform the requested operation
                    contactList.correctDuplicates(id);
                } catch (ex) {
                    log(ex);
                }
            });
        } catch (e) {
            log(e);
        }
    });


/**
 * Define the event handlers for the backup restore page and its panel. This has
 * to be done only once on page create.
 */
$(document)
.on(
    'pagecreate',
    '#' + pages.RESTOREBACKUP,
    function() {
        try {
            var panel = $('#' + ids.RESTOREBACKUPPANEL);
            // if the close button is pressed, the panel is closed and
            // the list is shown again.
            $('#' + ids.BUTTONRESTOREBACKUPLOSE).click(function(e) {
                panel.panel("close");
            });
            $('#' + ids.BUTTONRESTOREBACKUP).click(function(e) {
                try {
                    // find the content object to extract the current id
                    var content = $('#' + ids.RESTOREBACKUPCONTENT);
                    // get the saved current selected id from the content data
                    // attribute
                    var id = content.data("contactid");
                    // get the contact for this id
                   // var c = contactList.getById(id);
                    // log("cContact._backup.restoreContact(id) called: " + id);
                    panel.panel("close");
                    // and finally perform the requested operation
                    cContact._backup.restoreContact(id);
                } catch (ex) {
                    log(ex);
                }
            });
        } catch (e) {
            log(e);
        }
    });
/**
 * Define the event handlers for the funny characters page and its panel. This
 * has to be done only once on page create.
 */
$(document)
.on(
    'pagecreate',
    '#' + pages.FUNNYCHARS,
    function() {
        try {
            var panel = $('#' + ids.FUNNYCHARSPANEL);
            // if the close button is pressed, the panel is closed and
            // the list is shown again.
            $('#' + ids.BUTTONFUNNYCHARSCLOSED).click(function(e) {
                panel.panel("close");
            });
            $('#' + ids.BUTTONFUNNYCHARS).click(function(e) {
                try {
                    // find the content object to extract the current id
                    var content = $('#' + ids.FUNNYCHARSCONTENT);
                    // get the saved current selected id from the content data
                    // attribute
                    var id = content.data("contactid");
                    // get the contact for this id
                   // var c = contactList.getById(id);
                    // log("cContact.correctFunnyCharacter(id): " + id);
                    panel.panel("close");
                    // and finally perform the requested operation
                    contactList.correctFunnyCharacter(id);
                } catch (ex) {
                    log(ex);
                }
            });
        } catch (e) {
            log(e);
        }
    });

/**
 * Define the event handlers for the funny characters page and its panel. This
 * has to be done only once on page create.
 */
$(document)
.on(
    'pagecreate',
    '#' + pages.NAMEMIXUP,
    function() {
        try {
            var img;
            var panel = $('#' + ids.NAMEMIXUPPANEL);
            // if the close button is pressed, the panel is closed and
            // the list is shown again.
            $('#' + ids.BUTTONNAMEMIXUPCLOSE).click(function(e) {
                panel.panel("close");
            });
            $('#' + ids.BUTTONNAMEMIXUPCORRECT).click(function(e) {
                try {
                    // find the content object to extract the current id
                    var content = $('#' + ids.NAMEMIXUPCONTENT);
                    // get the saved current selected id from the content data
                    // attribute
                    var id = content.data("contactid");
                    // get the contact for this id
                    var c = contactList.getById(id);
                    log(JSON.stringify(c));
                    log("img: " + img);

                    if (typeof c.c.photo === 'undefined' || c.c.photo === null) {
                        log("photo undefined");
                        c.c.photo = [];
                        log(JSON.stringify(c));
                    }
                    c.c.photo.push(img);
                    // log("cContact.correctFunnyCharacter(id): " + id);
                    panel.panel("close");
                    var switchNames = $('.checkbox-namemixup').prop('checked');
                    // and finally perform the requested operation
                    contactList.getDefectList("NAMEMIXUP").correctDefect(id, { "switch" : switchNames});
                } catch (ex) {
                    log(ex);
                }
            });
            var cb = $('.checkbox-namemixup');
            cb.prop('checked', false).checkboxradio("refresh");
            cb.bind('change', function(e) {
                var wasChecked = $(this).prop('checked');
                var contentname = ids.NAMEMIXUPCONTENT;
                var content = $('#' + contentname);
                var id = content.data('contactid');
                content.empty();
                updatePreview(content, "NAMEMIXUP", id);
                panel.i18n();
                panel.trigger("updatelayout");
            });
        var canvas = $('#smileyCanvas')[0];

        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            var imageObj = new Image();
            imageObj.onload = function() {
                ctx.drawImage(imageObj, 69, 50);
                log("img on load: " + img );
                canvas.toBlob(function(blob) {
                    img = blob;
                    
                }, "image/png");
            };
            imageObj.src = 'images/SmileyNeutral.svg';
        }

        } catch (e) {
            log(e);
        }
    });

/**
 * Open an URl from the app in the browser, like showing the online help
 * function This is described in
 * https://developer.mozilla.org/en-US/docs/WebAPI/Web_Activities But instead of
 * "share" as described there we used "view"
 * 
 * @param url
 *                the url to open
 * @returns nothing
 */
function openLinkInBrowser(url) {
    var activity = new MozActivity({
        // Ask for the "view" activity
        name: "view",

        // Provide the data required by the filters of the activity
        data: {
            type: "url",
            url: url
        }
    });

    activity.onsuccess = function() {
        log("the url was opened");
    };

    activity.onerror = function() {
        log(this.error);
    };
}

function sendEMailToSupport(content) {
var body = encodeURIComponent(JSON.stringify(content));
var activity = new MozActivity({
  name: "new",
  data: {
    type : "mail",
    url: "mailto:ContactFoxSupport@alexfunk.de?subject=ContactFox%20Debug%20Log&body=" + body,
 }
});
  activity.onsuccess = function() {
     log("the mail was created");
    };

    activity.onerror = function() {
        log(this.error);
    };
}
