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
     * if the given contact contains a defect add it to the list
     * 
     * @param contact
     */
    checkContactForDefect : function(contact) {
        if (this._hasDefect(contact)) {
            this._defects.push(contact);
        }
    },
    correctAll : function(params) {
        console.log("correctAll");
        var t = this;
        $.each(t._defects, function(i, e) {
            t.correctDefect(e.key(), params);
        });
        return _defects;
    },
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
    contactUtils.appendListToUL(this._defects, ul, 'prefix');
};
cMissingPrefix.prototype._hasDefect = function(contact) {
    return contact.hasMissingPrefix();
};
cMissingPrefix.prototype.correctDefect = function(key, prefix) {
    var contact = this.getById(key);
    contact.insertPrefix(prefix);
    this._change(contact);
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
};

// -------------------------------------------------------

cFunnyCharacters = function() {
    this.init();
};
cFunnyCharacters.inheritsFrom(cDefectList);

cFunnyCharacters.prototype.addToUI = function(ul) {
    contactUtils.appendListToUL(this._defects, ul, 'funnyChars');
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
                return false; // break the each loop
            }
        });
        return hasFunnyCharacter;
    };
    return contact.checkAllStrings(checkStringForFunnyCharacters);
};
cFunnyCharacters.prototype.correctDefect = function(key) {
    var correctFunnyCharactersFilterFunction = function(s) {
        $.each(cFunnyCharacters.patternToCorrect, function(key, value) {
            s = s.replace(cFunnyCharacters.patternToCorrect[key],
                    cFunnyCharacters.patternCorrected[key]);
        });
        return s;
    };
    contact = this.getById(key);
    contact.filterAllStrings(correctFunnyCharactersFilterFunction);
    this._change(contact);
    contact.save(function() {
        log("funny character successfully corrected for id :" + key,
                ids.TEXTAREA_MISSINGPREFIX);
    }, function() {
        log("error while saving funny character correction for id " + key,
                ids.TEXTAREA_MISSINGPREFIX);
    });
    // remove from _defectlist
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

cDuplicates.prototype.addToUI = function(ul) {
    contactUtils.appendUnifyListToUL(this._defects, ul);
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
                for ( var j = 1; j < e.length; j++) {
                    var secondary = e[j];
                    entry.unify(secondary);
                }
                t._change(entry);
                entry.save(function() {
                    log("merge successfull for id :" + key,
                            ids.TEXTAREA_DUPLICATES);
                }, function() {
                    log("error while merging id " + key,
                            ids.TEXTAREA_DUPLICATES);
                });
                for ( var k = 1; k < e.length; k++) {
                    var removeEntry = e[k];
                    // Notify other list about removed entry
                    t._remove(removeEntry);
                    e[k].remove();
                }
                t._defects.splice(i, 1);
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
    correctDuplicates : function(key) {
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
