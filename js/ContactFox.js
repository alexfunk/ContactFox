/**
 * extends the String prototype with a startsWith function, so that it returns
 * true if the string object </div> <div data-role="content" starts with the
 * argument string, just as in ordinary Java
 */
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) == str;
    };
}

// some constants used in the applícation:

var pages = {
    INTRO: "pIntro",
    START: "pStart",
    DUPLICATES: "pDuplicates",
    CHANGECONTACT: "pChangeContact",
    FUNNYCHARS: "pFunnyCharacters",
    MISSINGPLUS: "pMissingPlus",
    ABOUT: "pAbout",
    DEBUG: "pDebug"
};

var ids = {
    CONTACTLIST: "CONTACTLIST",
    CONTACTCHANGE: "CONTACTCHANGE",
    TEXTAREA: "TEXTAREA",
    CONTACTSREAD: "CONTACTSREAD",
    CBINTRONOTAGAIN: "CBINTRONOTAGAIN"
};

function log(e) {
    console.log(e);
    $('#' + ids.TEXTAREA).append(e + "\n");
}

var contactList = new cContactList();

function getEventsList($obj) {
    var ev = [],
        events = jQuery._data($obj, "events"),
        i;
    for (i in events) {
        ev.push(i);
    }
    return ev.join(' ');
}

function initApp() {
    // make the title a bit wider, so that more information
    // can be
    // displayed
    $('.ui-title').css({
        'margin-left': '10%',
        'margin-right': '10%'
    });

    // link pages together ?!
    var buttons = {};
    buttons[pages.DUPLICATES] = $('[data-i18n = "nav.pDuplicates"]');
    buttons[pages.DEBUG] = $('[data-i18n = "nav.pDebug"]');
    buttons[pages.START] = $('[data-i18n = "nav.home"]');
    buttons[pages.FUNNYCHARS] = $('[data-i18n = "nav.pFunnyCharacters"]');
    buttons[pages.MISSINGPLUS] = $('[data-i18n = "nav.pMissingPlus"]');
    buttons[pages.ABOUT] = $('[data-i18n = "nav.pAbout"]');
    $.each(buttons, function(key, value) {
        value.click(function(e) {
            $(':mobile-pagecontainer').pagecontainer("change", '#' + key);
        });
    });
    var cb = $('#' + ids.CBINTRONOTAGAIN).find(':checkbox');
    cb.prop('checked', true).checkboxradio("refresh");
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
    buttons[pages.START].click(function(e) {
        loadContacts();
    });

    //    $('#' + ids.CBINTRONOTAGAIN).on("click", function(e) {
    //        try {
    //            e.preventDefault();
    //            var $checkbox = $(this).find(':checkbox');
    //            $checkbox.trigger("checked");
    //        } catch (ex) {
    //            log(ex);
    //        }
    //    });

    //Init i18n
    i18n.init(function(t) {
        // translate nav
        $(".nav").i18n();
        // translate app
        $(".i18n").i18n();
    });
    try {
        // check if the intro was disabled by the user, and proceed to the start page
        // 
        var intronotagain = window.localStorage.getItem("ContactFox." + ids.CBINTRONOTAGAIN);
        log("intronotagain was selected: " + intronotagain);
        if (intronotagain == 'true') {
            loadContacts();
            $(':mobile-pagecontainer').pagecontainer("change", '#' + pages.START);
        }
    } catch (ex) {
        log(ex);
    }

}

function updateButtons() {
    if (contactList.hasDuplicates()) {
        $('[data-i18n = "nav.pDuplicates"]').removeClass('ui-disabled');
    } else {
        $('[data-i18n = "nav.pDuplicates"]').addClass('ui-disabled');
    }
    if (contactList.hasFunnyCharacters()) {
        $('[data-i18n = "nav.pFunnyCharacters"]').removeClass('ui-disabled');
    } else {
        $('[data-i18n = "nav.pFunnyCharacters"]').addClass('ui-disabled');
    }
    if (contactList.hasMissingPlus()) {
        $('[data-i18n = "nav.pMissingPlus"]').removeClass('ui-disabled');
    } else {
        $('[data-i18n = "nav.pMissingPlus"]').addClass('ui-disabled');
    }

}

function loadContacts() {
    try {
        updateButtons();
        if (contactList.size() === 0) {
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
                            updateButtons();
                        } catch (ex) {
                            log(ex);
                        }
                        cursor.
                        continue ();
                    } else {
                        // let jquery mobile make this list filterable
                        $('#' + ids.CONTACTLIST).append('<ul data-filter="true"></ul>');
                        contactList.appendUnifyListToUL($('#' + ids.CONTACTLIST + ' ul'));
                        $('#' + ids.CONTACTLIST + ' ul li').click(function(event) {
                            changeContactSelected(event);
                        });
                        $('#' + ids.CONTACTLIST + " ul").listview()
                            .listview('refresh');
                    }
                } catch (ex) {
                    log(ex);
                }
            };

            allContacts.onerror = function() {
                //TODO: better error handling and i18n
                alert("Can not read your contacts. Did you give permissions?");
                log("Something went terribly wrong! :(");
            };
        }
    } catch (exception) {
        log(exception);
    }
}

function changeContactSelected(event) {
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
                    log("click merge");
                    var contact = $(this).data("contact");
                    $('#' + contact.key()).css("display", "none");
                    contactList.merge(contact.key());
                    log("merged, go back");
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
                    contactUtils.createDuplicateContactForTesting();
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
            } catch (ex) {
                log(ex);
            }
        });
