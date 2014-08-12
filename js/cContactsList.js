/*
 * Some Utility to have inheritance in javascript classes
 * Extends the Function prototype by an inhereitsFrom function 
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
// missing prefix and funncy characters
cDefectList = function() {
    this._defects = [];
};

cDefectList.prototype = {
    /**
     * returns true if the list contains at least on defect
     * 
     * @returns {Boolean}
     */
    hasDefects : function() {
        return this._defects.length !== 0;
    },
    /**
     * shows the nuber of defects
     * 
     * @returns
     */
    numDefects : function() {
        return this._defects.length;
    },
    /**
     * has the given contact an defect. This shall be overwritten by the
     * inheriting class.
     * 
     * @param contact
     * @returns {Boolean}
     */
    _hasDefect : function(contact) {
        return false;
    },
    /**
     * if the given contact contains an defect add it to the list
     * 
     * @param contact
     */
    checkContactForDefect : function(contact) {
        if (this._hasDefect(contact)) {
            this._defects.push(contact);
        }
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
        $.each(this._list, function(i, e) {
            if (e.key() == id) {
                result = e;
                return false;
            }
        });
        return result;
    },
    /**
     * set the contact list as the parrent of the defect list, so that we can
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
     * @param key
     */
    _remove : function(contact) {
        this._parent.removeEntry(contact, this);
    },
    /**
     * being notified that somonelse removed a contact, so that this class is
     * updated
     */
    notifyRemove : function(contact) {
        var listIndex = this._defects.indexOf(contact);
        if (listIndex != -1) {
            this._defects.splice(listIndex, 1);
        }
    }
};
// -------------------------------------------------------

cMissingPrefix = function() {
};

cMissingPrefix.inheritsFrom(cDefectList);

cMissingPrefix.prototype.addToUI = function(ul) {
    contactUtils.appendMissingPrefixListToUL(this._defects, ul);
};
cMissingPrefix.prototype._hasDefect = function(contact) {
    return contact.hasMissingPrefix();
};
cMissingPrefix.prototype.correctDefect = function(key, prefix) {
    var contact = this.getById(key);
    contact.insertPrefix(prefix);
    contact.save(function() {
        log("prefix successfully saved for id :" + key,
                ids.TEXTAREA_MISSINGPREFIX);
    }, function() {
        log("error while saving prefix for id " + key,
                ids.TEXTAREA_MISSINGPREFIX);
    });
    var mpListIndex = this._defects.indexOf(contact);
    if (mpListIndex != -1) {
        this._defects.splice(mpListIndex, 1);
    }
    // this._notifyChange(this);
};

// -------------------------------------------------------

cFunnyCharacters = function() {
};
cFunnyCharacters.inheritsFrom(cDefectList);

cFunnyCharacters.prototype.addToUI = function(ul) {
    // TODO: simmilar to addMissingPrefixToUL. Try to unify both functions
};
// convert öäüÖÄÜß
// \u00C3\u00B6\u00C3\u20AC\u00C3\u0152\u00C3\u0096\u00C3\u0084\u00C3\u009C\u00C3\u009F
// TODO: Extend by other non-german accented characters
cFunnyCharacters.patterntocorrect = {
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
cFunnyCharacters.patterncorrected = {
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
        $.each(cFunnyCharacters.patterntocorrect, function(key, value) {
            if (stringToCheck.indexOf(value) != -1) {
                hasFunnyCharacter = true;
                return false; // break the each loop
            }
        });
        return hasFunnyCharacter;
    };
    return contact.checkAllStrings(checkStringForFunnyCharacters);
};
cFunnyCharacters.prototype.correctDefect = function(contact) {
    var correctFunnyCharactersFilterFunction = function(s) {
        $.each(cFunnyCharacters.patterntocorrect, function(key, value) {
            s = s.replace(cFunnyCharacters.patterntocorrect[key],
                    cFunnyCharacters.patterncorrected[key]);
        });
        return s;
    };
    contact.filterAllStrings(correctFunnyCharactersFilterFunction);
    contact.save(function() {
        log("funny character successfully corrected for id :" + key,
                ids.TEXTAREA_MISSINGPREFIX);
    }, function() {
        log("error while saving funny character correction for id " + key,
                ids.TEXTAREA_MISSINGPREFIX);
    });
};
// -------------------------------------------------------

cDuplicates = function() {
};
cDuplicates.inheritsFrom(cDefectList);

cDuplicates.prototype.addToUI = function(ul) {
    contactUtils.appendUnifyListToUL(this._defects, ul);
};
/**
 * @Override the duplicates defect is handled different
 * @param contact
 */
cDuplicates.prototype.checkContactForDefect = function(contact) {
    contact.addToUnifyList(this._defects);
};
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
            var entry = e[0];
            if (entry.key() == key) {
                entry.save(function() {
                    log("merge successfull for id :" + key,
                            ids.TEXTAREA_DUPLICATES);
                }, function() {
                    log("error while merging id " + key,
                            ids.TEXTAREA_DUPLICATES);
                });
                for ( var j = 1; j < e.length; j++) {
                    var removeEntry = e[j];
                    // Notify other list about removed entry
                    t._remove(removeEntry);
                    e[j].remove();
                }
                t._defects.splice(i, 1);
                // break jquery each loop:
                return false;
            }
        }
    });
};
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

// --------------------------------------------------------------

cContactList = function() {
    // set the contact list as parent of all defect lists, so that
    // they can notify the parentlist about changes
    var t = this;
    $.each(this._defects, function(name, value) {
        value.setParent(t);
    });
};

cContactList.prototype = {
    _list : [],
    _defects : {
        duplicates : new cDuplicates(),
        missingPrefix : new cMissingPrefix(),
        funnyCharacters : new cFunnyCharacters()
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
    // ------------ duplicates -------------------------
    appendUnifyListToUL : function(ul) {
        this._defects.duplicates.addToUI(ul);
    },
    hasDuplicates : function() {
        return this._defects.duplicates.hasDefects();
    },
    numDuplicates : function() {
        return this._defects.duplicates.numDefects();
    },
    merge : function(key) {
        this._defects.duplicates.correctDefect(key);
    },
    // -------- Missing Prefix -----------------------
    appendMissingPrefixListToUL : function(ul) {
        this._defects.missingPrefix.addToUI(ul);
    },
    hasMissingPrefix : function() {
        return this._defects.missingPrefix.hasDefects();
    },
    numMissingPrefix : function() {
        return this._defects.missingPrefix.numDefects();
    },
    correctPrefix : function(key, prefix) {
        this._defects.missingPrefix.correctDefect(key, prefix);
    },
    // --------- Funny Characters --------------------
    appendFunnyCharacterListToUL : function(ul) {
        this._defects.funnyCharacters.addToUI(ul);
    },
    hasFunnyCharacters : function() {
        return this._defects.funnyCharacters.hasDefects();
    },
    numFunnyCharacters : function() {
        return this._defects.funnyCharacters.numDefects();
    },
    correctFunnyCharacter : function(key) {
        this._defects.funnyCharacters.correctDefect(key);
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
        $.each(this._listeners, function(i, e) {
            try {
                e(this);
            } catch (ex) {
                log("Error in listener " + ex);
            }
        });
    }

};
