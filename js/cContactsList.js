/*
 * Some Utility to have inheritance in javascript classes
 * Extends the Function prototype by an inheritsFrom function
 * @param parentClassOrObject
 * @returns {Function}
 */
Function.prototype.inheritsFrom = function(parentClassOrObject) {
    if (parentClassOrObject.constructor == Function) {
        // Normal Inheritance
        this.prototype = new parentClassOrObject();
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    } else {
        // Pure Virtual Inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
};

// ------------------------------------------------------
// Base class for all defects, like duplicate contacts,
// missing prefix and funny characters
cDefectList = function() {
    this.init();
};

cDefectList.prototype = {
    /**
     * This must be called from every constructor. otherwise the value of
     * _defects is shared between instances.
     */
    init : function() {
        this._defects = [];
    },
    /**
     * returns true if the list contains at least on defect
     *
     * @returns {Boolean}
     */
    hasDefects : function() {
        return this._defects.length !== 0;
    },
    /**
     * shows the number of defects
     *
     * @returns
     */
    numDefects : function() {
        return this._defects.length;
    },
    /**
     * Does the given contact have a defect? This shall be overwritten by the
     * inheriting class.
     *
     * @param contact
     * @returns {Boolean}
     */
    _hasDefect : function(contact) {
        return false;
    },
    /**
     * appends an html list representation of this list to the given jquery
     * element
     *
     * @param ul
     *                the point to insert the html
     * @param id
     *                the prefix of the ids in the html list
     */
    appendToUL : function(ul, id) {
        try {
            $.each(this._defects, function(i, e) {
                try {
                    var html = '<li id="' + id + e.key() + '"><a>' + e.displayName() + '</a></li>';
                    ul.append(html);

                } catch (ex) {
                    log(ex);
                }
            });
        } catch (ex) {
            log(ex);
        }
    },

    /**
     * append a preview of a contact that would be corrected to a given
     * container.
     *
     * @param containter
     *                the jquery element to append to
     * @param id
     *                the id to find the contact
     */
    appendPreviewToContainer : function(container, id) {
        var contact = this.getById(id);
        contact.appendAsString(container);
    },

    /**
     * if the given contact contains a defect add it to the list
     *
     * @param contact
     */
    checkContactForDefect : function(contact) {
        if (this._hasDefect(contact)) {
            this._defects.push(contact);
        }
    },
    /**
     * this corrects all mistaces in the defect list. This can be used from the
     * "correct all"-Buttons on the defect pages. If a lot of contacts are to be
     * corrected this would block the ui for some times
     *
     * @param params
     * @returns the corrected defect list
     */
    correctAll : function(params) {
        console.log("correctAll");
        var t = this;
        $.each(t._defects, function(i, e) {
            t.correctDefect(e.key(), params);
        });
        return _defects;
    },
    /**
     * trigger the "correct all defects" function with a worker TODO: This does
     * not work yet
     *
     * @param params
     */
    correctAllWithWorker : function(params) {
        var worker = new Worker('js/backgroundWorker.js');
        worker.postMessage({
            command : "correctAll",
            object : this,
            params : params
        });
        worker.onMessage = function(e) {
            _defects = e.data;
        };
    },
    /**
     * returns a contact in the defectlist, by its id, if it is there
     *
     * @param key
     *                the key of the contact
     * @returns the contact or null if not there
     */
    getById : function(key) {
        var result = null;
        $.each(this._defects, function(i, e) {
            if (e.key() == key) {
                result = e;
                return false;
            }
        });
        return result;
    },
    /**
     * set the contact list as the parent of the defect list, so that we can
     * notify the parent about changes
     *
     * @param parent
     */
    setParent : function(parent) {
        this._parent = parent;
    },
    /**
     * notify the parent that one contact has to be removed from the list
     *
     * @param contact
     */
    _remove : function(contact) {
        this._parent.removeEntry(contact, this);
    },
    /**
     * notify the parent that one contact has changed
     */
    _change : function(contact) {
        this._parent.changeEntry(contact, this);
    },
    /**
     * being notified that someone else removed a contact, so that this class is
     * updated
     */
    notifyRemove : function(contact) {
        var listIndex = this._defects.indexOf(contact);
        if (listIndex != -1) {
            this._defects.splice(listIndex, 1);
        }
    },
    /**
     * Someone else has changed one contact. The changed contact is passed as
     * parameter. The change might cause one contact to be affected by this
     * defect, so it must be entered in this list, or it may now be unaffected
     * so it can be removed from this list,
     */
    notifyChange : function(contact) {
        var hasDefect = this._hasDefect(contact);
        var listIndex = this._defects.indexOf(contact);
        if (hasDefect && listIndex === -1) {
            // it has the defect but is not in the list
            this._defects.push(contact);
        }
        if (!hasDefect && listIndex !== -1) {
            // is doesn't have the defect but is in the list
            this._defects.splice(listIndex, 1);
        }

    }
};
// -------------------------------------------------------

cMissingPrefix = function() {
    this.init();
};

cMissingPrefix.inheritsFrom(cDefectList);

cMissingPrefix.prototype.addToUI = function(ul) {
    this.appendToUL(ul, 'missingPrefix');
};
cMissingPrefix.prototype._hasDefect = function(contact) {
    var result = false;
    if ($.isArray(contact.c.tel)) {
        $.each(contact.c.tel, function(i, e) {
            if ( typeof e.value === 'string' && !e.value.startsWith("+") && !e.value.startsWith("00")) {
                result = true;
                return false;
            }
        });
    }
    return result;
};

cMissingPrefix.prototype._insertMissingPrefix = function(contact, prefix) {
    if ($.isArray(contact.c.tel)) {
        $.each(contact.c.tel, function(i, e) {
            if ( typeof e.value === 'string' && !e.value.startsWith("+") && !e.value.startsWith("00")) {
                if (e.value.startsWith("0")) {
                    var oldValue = e.value;
                    e.value = prefix + e.value.substring(1);
                }
            }
        });
        // OK, the prefix is added now, but maybe there is a second number
        // in the contact
        // that has already the given prefix. So we check for duplicate
        // phone-number
        // entries and remove them in this contact here
        contact.clearDuplicateNumbers();
    }

};
cMissingPrefix.prototype.correctDefect = function(key, prefix) {
    var contact = this.getById(key);
    this._insertMissingPrefix(contact, prefix);

    // contact.insertPrefix(prefix);
    var mpListIndex = this._defects.indexOf(contact);
    if (mpListIndex != -1) {
        this._defects.splice(mpListIndex, 1);
    }
    this._change(contact);
    contact.save(function() {
        log("prefix successfully saved for id :" + key, ids.TEXTAREA_MISSINGPREFIX);
    }, function() {
        log("error while saving prefix for id " + key, ids.TEXTAREA_MISSINGPREFIX);
    });
};
/**
 * append a preview of a contact that would be corrected to a given container.
 *
 * @param containter
 *                the jquery element to append to
 * @param id
 *                the id to find the contact
 * @param params
 *                params for the intended change
 */
cMissingPrefix.prototype.appendPreviewToContainer = function(container, id, params) {
    var contact = this.getById(id);
    var contactCorrected = contact.clone();
    this._insertMissingPrefix(contactCorrected, params);
    contactCorrected.appendDiffAsString(container, contact);
};

// -------------------------------------------------------

cFunnyCharacters = function() {
    this.init();
};
cFunnyCharacters.inheritsFrom(cDefectList);

cFunnyCharacters.prototype.addToUI = function(ul) {
    this.appendToUL(ul, 'funnyChars');
};
// convert öäüÖÄÜß
// \u00C3\u00B6\u00C3\u20AC\u00C3\u0152\u00C3\u0096\u00C3\u0084\u00C3\u009C\u00C3\u009F
// TODO: Extend by other non-german accented characters
cFunnyCharacters.patternToCorrect = {
    ouml : "\u00C3\u00B6",
    auml : "\u00C3\u20AC",
    uuml : "\u00C3\u0152",
    Ouml : "\u00C3\u0096",
    Auml : "\u00C3\u0084",
    Uuml : "\u00C3\u009C",
    sz : "\u00C3\u009F",
    quote : "\\\"",
    comma : "\\,"
};
// \u00F6\u00E4\u00FC\u00D6\u00C4\u00DC\u00DF
cFunnyCharacters.patternCorrected = {
    ouml : "\u00F6",
    auml : "\u00E4",
    uuml : "\u00FC",
    Ouml : "\u00D6",
    Auml : "\u00C4",
    Uuml : "\u00DC",
    sz : "\u00DF",
    quote : "",
    comma : ","
};
cFunnyCharacters.prototype._hasDefect = function(contact) {
    var checkStringForFunnyCharacters = function(stringToCheck) {
        var hasFunnyCharacter = false;
        $.each(cFunnyCharacters.patternToCorrect, function(key, value) {
            if (stringToCheck.indexOf(value) != -1) {
                hasFunnyCharacter = true;
                return false;
                // break the each loop
            }
        });
        return hasFunnyCharacter;
    };
    return contact.checkAllStrings(checkStringForFunnyCharacters);
};
cFunnyCharacters.prototype.correctFunnyCharactersFilterFunction = function(s) {
    $.each(cFunnyCharacters.patternToCorrect, function(key, value) {
        s = s.replace(cFunnyCharacters.patternToCorrect[key], cFunnyCharacters.patternCorrected[key]);
    });
    return s;
};
cFunnyCharacters.prototype.correctDefect = function(key) {
    contact = this.getById(key);
    contact.filterAllStrings(this.correctFunnyCharactersFilterFunction);
    // remove from _defectlist
    var fcListIndex = this._defects.indexOf(contact);
    if (fcListIndex != -1) {
        this._defects.splice(fcListIndex, 1);
    }
    this._change(contact);
    contact.save(function() {
        log("funny character successfully corrected for id :" + key, ids.TEXTAREA_FUNNYCHARS);
    }, function() {
        log("error while saving funny character correction for id " + key, ids.TEXTAREA_FUNNYCHARS);
    });
};
/**
 * append a preview of a contact that would be corrected to a given container.
 *
 * @param containter
 *                the jquery element to append to
 * @param id
 *                the id to find the contact
 * @param params
 *                params for the intended change
 */
cFunnyCharacters.prototype.appendPreviewToContainer = function(container, id, params) {
    var contact = this.getById(id);
    var contactCorrected = contact.clone();
    contactCorrected.filterAllStrings(this.correctFunnyCharactersFilterFunction);
    contactCorrected.appendDiffAsString(container, contact);
};

// -------------------------------------------------------
/**
 * The defect lists for duplicates are a bit different. It is an array of arrays
 * each array contains all contacts that can be merged. If there is no matching
 * contact it is just that entry. For example if c3a and c3b are the only
 * contacts that can be unified, the list looks like this: _defects = [[c1],
 * [c2], [c3a, c3b]], [c4]]
 */
cDuplicates = function() {
    this.init();
};
cDuplicates.inheritsFrom(cDefectList);

/**
 * Append the list to the given element in the dom the duplicates list is
 * handled different: There are a number of duplicates in each list entry. The
 * insertion is done in order of the length of contacts to be unified
 *
 * @param ul
 */
cDuplicates.prototype.addToUI = function(ul) {
    try {
        $.each(this._defects, function(i, e) {
            try {
                if (e.length > 1) {
                    var entry = e[0];
                    var html = '<li id="' + entry.key() + '"><a>' + entry.displayName() + '<span class="ui-li-count">' + e.length + '</span>' + '</a></li>';
                    var li = ul.find('li');
                    var inserted = false;
                    $.each(li, function(i1, e1) {
                        var list = $(e1).data("list");
                        if (list.length < e.length) {
                            $(e1).before(html);
                            $('#' + entry.key()).data('list', e);
                            inserted = true;
                            return false;
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
};
/**
 * @Override the duplicates defect is handled different
 * @param contact
 *                the contact that might be duplicate
 */
cDuplicates.prototype.checkContactForDefect = function(contact) {
    contact.addToUnifyList(this._defects);
};
/**
 * @Override the duplicates defect is handled different
 */
cDuplicates.prototype.hasDefects = function() {
    var result = false;
    $.each(this._defects, function(i, e) {
        if ($.isArray(e) && e.length > 1) {
            result = true;
            // break jquery each loop:
            return false;
        }
    });
    return result;
};
/**
 * @Override the duplicates defect is handled different
 */
cDuplicates.prototype.numDefects = function() {
    try {
        var result = 0;
        $.each(this._defects, function(i, e) {
            if ($.isArray(e) && e.length > 1) {
                result += 1;
            }
        });
        return result;
    } catch (ex) {
        log(ex);
    }
};

cDuplicates.prototype.correctDefect = function(key) {
    var t = this;
    $.each(t._defects, function(i, e) {
        if ($.isArray(e) && e.length > 1) {
            // this entry is a defect. Keep the first contact in e
            var entry = e[0];
            if (entry.key() == key) {
                for (var j = 1; j < e.length; j++) {
                    var secondary = e[j];
                    entry.unify(secondary);
                }
                entry.save(function() {
                    log("merge successfull for id :" + key, ids.TEXTAREA_DUPLICATES);
                }, function() {
                    log("error while merging id " + key, ids.TEXTAREA_DUPLICATES);
                });
                for (var k = 1; k < e.length; k++) {
                    var removeEntry = e[k];
                    // Notify other list about removed entry
                    t._remove(removeEntry);
                    removeEntry.remove();
                }
                t._defects.splice(i, 1);
                // TODO when to send the change event
                // compare with other correct defects
                t._change(entry);
                // break jquery each loop:
                return false;
            }
        }
    });
};
/**
 * a contact was removed from someone else, so remove it from the defect list
 *
 * @param contact
 *                the contact to be removed
 */
cDuplicates.prototype.notifyRemove = function(contact) {
    var t = this;
    $.each(t._defects, function(i, e) {
        if ($.isArray(e) && e.length > 1) {
            var listIndex = e.indexOf(contact);
            if (listIndex != -1) {
                e.splice(listIndex, 1);
            }
        }
    });
};

// -------------------------------------------------------

cNameMixup = function() {
    this.init();
};

cNameMixup.inheritsFrom(cDefectList);

cNameMixup.prototype.addToUI = function(ul) {
    this.appendToUL(ul, 'nameMixup');
};
cNameMixup.prototype._hasDefect = function(contact) {
    var result = false;
    var aGivenName = $.isArray(contact.c.givenName) ? contact.c.givenName : [];
    var aFamilyName = $.isArray(contact.c.familyName) ? contact.c.familyName : [];
    console.log("givenName: " + JSON.stringify(aGivenName));
    console.log("familyName: " + JSON.stringify(aFamilyName));
    if (aGivenName.length === 0 && aFamilyName.length === 2) {
        result = true;
    } else if (aGivenName.length === 2 && aFamilyName.length === 0) {
        result = true;
    } else if (aGivenName.length === 0 && aFamilyName.length === 1) {
        // aFamilyName[0] has space
        result = aFamilyName[0].indexOf(" ") !== -1;
    } else if (aGivenName.length === 1 && aFamilyName.length === 0) {
        result = aGivenName[0].indexOf(" ") !== -1;
    } else if (aGivenName.length == aFamilyName.length) {
        // true if all members equal --> the last is the last name
        result = true;
        for ( i = 0; i < aGivenName.length; i++) {
            if (aGivenName[i] !== aFamilyName[i])
                result = false;
        }
    }
    return result;
};
cNameMixup.prototype._fixNameMixup = function(contact, prefix) {
    var aGivenName = $.isArray(contact.c.givenName) ? contact.c.givenName : [];
    var aFamilyName = $.isArray(contact.c.familyName) ? contact.c.familyName : [];
    console.log("givenName: " + JSON.stringify(aGivenName));
    console.log("familyName: " + JSON.stringify(aFamilyName));

    if (aGivenName.length === 0 && aFamilyName.length === 2) {
        aGivenName.push(aFamilyName[0]);
        aFamilyName.slice(0, 1);
    } else if (aGivenName.length === 2 && aFamilyName.length === 0) {
        aFamilyName.push(aGivenName[1]);
        aGivenName.slice(1, 1);
    } else if (aGivenName.length === 0 && aFamilyName.length === 1) {
        // aFamilyName[0] has space
        var splitIndex = aFamilyName[0].indexOf(" ");
        aGivenName.push(aFamilyName[0].splice(0, splitIndex));
        aFamilyName[0] = aFamilyName[0].splice(splitIndex, aFamilyName[0].length);
    } else if (aGivenName.length === 1 && aFamilyName.length === 0) {
        var splitIndex2 = aGivenName[0].indexOf(" ");
        console.log("givenName: " + JSON.stringify(aGivenName) + " splitIndex2: " + splitIndex2);

        aGivenName[0] = aGivenName[0].splice(0, splitIndex2);
        aFamilyName.push(aGivenName[0].splice(splitIndex2, aGivenName[0].length));
    } else if (aGivenName.length == aFamilyName.length) {
        // true if all members equal --> the last is the last name
        aFamilyName.slice(0, aFamilyName.length);
        aFamilyName.push(aGivenName[aGivenName.length - 1]);
        aGivenName.splice(aGivenName.length - 1, 1);
    }
    contact.c.givenName = aGivenName;
    contact.c.familyName = aFamilyName;
};
cNameMixup.prototype.correctDefect = function(key, params) {
    var contact = this.getById(key);

    this._fixNameMixup(contact, params);
    this._change(contact);
    contact.save(function() {
        log("nameMixup successfully saved for id :" + key, ids.TEXTAREA_NAMEMIXUP);
    }, function() {
        log("error while saving nameMixup for id " + key, ids.TEXTAREA_NAMEMIXUP);
    });
};
/**
 * append a preview of a contact that would be corrected to a given container.
 *
 * @param containter
 *                the jquery element to append to
 * @param id
 *                the id to find the contact
 * @param params
 *                params for the intended change
 */
cNameMixup.prototype.appendPreviewToContainer = function(container, id, params) {
    var contact = this.getById(id);
    var contactCorrected = contact.clone();
    this._fixNameMixup(contactCorrected, params);
    contactCorrected.appendDiffAsString(container, contact);
};

// --------------------------------------------------------------

cContactList = function() {
    // set the contact list as parent of all defect lists, so that
    // they can notify the parentlist about changes
    this.init();
    var t = this;
    $.each(this._defects, function(name, value) {
        value.setParent(t);
    });
};

cContactList.prototype = {
    /**
     * This must be called from every constructor. otherwise the value of
     * _defects is shared between instances.
     */
    init : function() {
        this._list = [];
        this._defects = {
            DUPLICATES : new cDuplicates(),
            MISSINGPREFIX : new cMissingPrefix(),
            FUNNYCHARS : new cFunnyCharacters(),
            NAMEMIXUP : new cNameMixup()
        };
    },
    _listeners : [],
    add : function(contact) {
        this._list.push(contact);
        $.each(this._defects, function(name, value) {
            value.checkContactForDefect(contact);
        });
        this._notifyChange(this);
    },
    removeEntry : function(contact, sourceDefectList) {
        var mainListIndex = this._list.indexOf(contact);
        if (mainListIndex != -1) {
            this._list.splice(mainListIndex, 1);
        }
        $.each(this._defects, function(name, value) {
            if (value !== sourceDefectList) {
                value.notifyRemove(contact);
            }
        });
        this._notifyChange(this);
    },
    changeEntry : function(contact, sourceDefectList) {
        $.each(this._defects, function(name, value) {
            if (value !== sourceDefectList) {
                value.notifyChange(contact);
            }
        });
        this._notifyChange(this);
    },
    size : function() {
        return this._list.length;
    },
    getById : function(id) {
        var result = null;
        $.each(this._list, function(i, e) {
            if (e.key() == id) {
                result = e;
                return false;
            }
        });
        return result;
    },
    getDefectList : function(key) {
        return this._defects[key];
    },
    // TODO: The following 12 functions should be replaced by the more generic
    // function getDefectList. For example contactList.hasDupplicates() should
    // be replaced by contactList.getDefectList("DUPLICATES").hasDefects()
    // ------------ duplicates -------------------------
    appendUnifyListToUL : function(ul) {
        this._defects.DUPLICATES.addToUI(ul);
    },
    hasDuplicates : function() {
        return this._defects.DUPLICATES.hasDefects();
    },
    numDuplicates : function() {
        return this._defects.DUPLICATES.numDefects();
    },
    correctDuplicates : function(key) {
        this._defects.DUPLICATES.correctDefect(key);
    },
    // -------- Missing Prefix -----------------------
    appendMissingPrefixListToUL : function(ul) {
        this._defects.MISSINGPREFIX.addToUI(ul);
    },
    hasMissingPrefix : function() {
        return this._defects.MISSINGPREFIX.hasDefects();
    },
    numMissingPrefix : function() {
        return this._defects.MISSINGPREFIX.numDefects();
    },
    correctPrefix : function(key, prefix) {
        this._defects.MISSINGPREFIX.correctDefect(key, prefix);
    },
    // --------- Funny Characters --------------------
    appendFunnyCharacterListToUL : function(ul) {
        this._defects.FUNNYCHARS.addToUI(ul);
    },
    hasFunnyCharacters : function() {
        return this._defects.FUNNYCHARS.hasDefects();
    },
    numFunnyCharacters : function() {
        return this._defects.FUNNYCHARS.numDefects();
    },
    correctFunnyCharacter : function(key) {
        this._defects.FUNNYCHARS.correctDefect(key);
    },
    // -------------------------------------------------
    addChangeListener : function(f) {
        this._listeners.push(f);
    },
    removeChangeListener : function(f) {
        var index = this._listeners.indexOf(f);
        if (index !== -1)
            this._listeners.splice(index, 1);
    },
    _notifyChange : function() {
        $.each(this._listeners, function(i, listener) {
            try {
                listener(this);
            } catch (ex) {
                log("Error in listener " + ex);
            }
        });
    }
};
