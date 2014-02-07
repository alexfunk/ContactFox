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
    CONSOLE: "CONSOLE",
    CONTACTLIST: "CONTACTLIST",
    CONTACTCHANGE: "CONTACTCHANGE",
    TEXTAREA: "TEXTAREA",
    CONTACTSREAD: "CONTACTSREAD"
};

var classes = {

};

function log(e) {
    console.log(e);
    $('#' + ids.TEXTAREA).append(e + "\n");
}



var contactList = new cContactList();

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
    buttons[pages.START].click(function(e) {
        loadContacts();
    });
    $('#' + pages.START).data("buttons", buttons);

    //Init i18n
    i18n.init(function(t) {
        // translate nav
        $(".nav").i18n();
        // translate app
        $(".i18n").i18n();
    });
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
                        $('#' + ids.CONTACTLIST).append("<ul></ul>");
                        contactList.appendUnifyListToUL($('#' + ids.CONTACTLIST + " ul"));
                        $('#' + ids.CONTACTLIST + " ul li").click(function(event) {
                            changeContactSelected(event);
                        });
                        $('#' + ids.CONTACTLIST + " ul").listview()
                            .listview('refresh');
                    }
                } catch (e) {
                    log(e);
                }
            };

            allContacts.onerror = function() {
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
            n.append('<a data-role="button" data-i18n="contact.merge"></a>');
            n.append('<div class="contacaction" data-i18n="contact.keep"></div>');
            n.append('<div><span data-i18n="contact.name"></span><span>: </span><span class="contactcontent" >' + cname + '</span></div>');
            if ($.isArray(contact.c.tel)) {
                $.each(contact.c.tel, function(i, e) {
                    var number = e.value;
                    n.append('<div><span data-i18n="contact.phone"></span><span> ' + (i + 1) + ': </span><span class="contactcontent" >' + number + '</span></div>');
                });
            }
            n.append('<div><span  class="contacaction" data-i18n="contact.delete"></span><span>: </span><span class="contactcontent" >' + (data.length - 1) + ' </span> <span data-i18n="contact.copies"></span></div>');
            $('.contactcontent').css('font-weight', 'bold');
            $('.contacaction').css('color', 'blue');
            $('.contacaction').css('font-style', 'italic');
            $('[data-i18n = "contact.merge"]').data("contact", contact);
            $('[data-i18n = "contact.merge"]').data("data", data);
            $('[data-i18n = "contact.merge"]').click(function(e) {
                try {
                    var contact = $(this).data("contact");
                    $('#' + contact.key()).css("display", "none");
                    contactList.merge(contact.key());
                    $(':mobile-pagecontainer').pagecontainer("change", '#' + pages.DUPLICATES, {
                        transition: 'slide'
                    });
                } catch (ex) {
                    log(ex);
                }
            });
            // translate all
            $('#' + ids.CONTACTCHANGE).i18n();

            // apply styles to the newly created subelements of the page
            $('#' + pages.CHANGECONTACT).trigger("create");
            $(':mobile-pagecontainer').pagecontainer("change", '#' + pages.CHANGECONTACT, {
                transition: 'slide'
            });
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
                log("InitApp");
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
            } catch (e) {
                log(e);
            }
        });
