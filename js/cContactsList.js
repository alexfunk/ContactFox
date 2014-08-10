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
// Base class for all defects, like dupplicate contacts,
// missing prefix and
cDefectList = function() {
    this._defects = [];
};

cDefectList.prototype = {
    hasDefects : function() {
        return this._defects.length !== 0;
    },
    numDefects : function() {
        return this._defects.length;
    },
    _hasDefect : function(contact) {
        return false;
    },
    checkContactForDefect : function(contact) {
        if (this._hasDefect(contact)) {
            this._defects.push(contact);
        }
    }

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
cDuplicates.prototype.correctDefect = function() {
};
// -------------------------------------------------------

cMissingPrefix = function() {
};

cMissingPrefix.inheritsFrom(cDefectList);

cMissingPrefix.prototype.addToUI = function(ul) {
    contactUtils.appendMissingPrefixListToUL(this._defects, ul);
};
cMissingPrefix.prototype.correctDefect = function(key, prefix) {
    var c = this.getById(key);
    c.insertPrefix(prefix);
    c.save();
    var mpListIndex = this._missingPrefixList.indexOf(c);
    if (mpListIndex != -1) {
        this._missingPrefixList.splice(mpListIndex, 1);
    }
    this._notifyChange(this);
};

// -------------------------------------------------------

cFunnyCharacters = function() {
};
cFunnyCharacters.inheritsFrom(cDefectList);

cFunnyCharacters.prototype.addToUI = function(ul) {
};
// convert öäüÖÄÜß
// \u00C3\u00B6\u00C3\u20AC\u00C3\u0152\u00C3\u0096\u00C3\u0084\u00C3\u009C\u00C3\u009F
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
cFunnyCharacters.prototype.correctDefect = function(c) {
    var correctFunnyCharactersFilterFunction = function(s) {
        $.each(cFunnyCharacters.patterntocorrect, function(key, value) {
            s = s.replace(cFunnyCharacters.patterntocorrect[key],
                    cFunnyCharacters.patterncorrected[key]);
        });
        return s;
    };
    c.filterAllStrings(correctFunnyCharactersFilterFunction);
};

// --------------------------------------------------------------

cContactList = function() {
};

cContactList.prototype = {
    _list : [],
    _unifyList : [],
    _funnyCharacters : [],
    _missingPrefixList : [],
    _defects : {
        duplicates : new cDuplicates(),
        missingPrefix : new cMissingPrefix(),
        funnyCharacters : new cFunnyCharacters()
    },
    _listeners : [],
    add : function(c) {
        this._list.push(c);
        this._defects.duplicates.checkContactForDefect(c);
        this._defects.missingPrefix.checkContactForDefect(c);
        this._defects.funnyCharacters.checkContactForDefect(c);
        c.addToUnifyList(this._unifyList);
        if (c.hasMissingPrefix()) {
            this._missingPrefixList.push(c);
        }
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
    appendUnifyListToUL : function(ul) {
        contactUtils.appendUnifyListToUL(this._unifyList, ul);
    },
    appendMissingPrefixListToUL : function(ul) {
        contactUtils.appendMissingPrefixListToUL(this._missingPrefixList, ul);
    },
    hasDuplicates : function() {
        var result = false;
        $.each(this._unifyList, function(i, e) {
            if ($.isArray(e) && e.length > 1) {
                result = true;
                // break jquery each loop:
                return false;
            }
        });
        return result;
    },
    numDuplicates : function() {
        var result = 0;
        $.each(this._unifyList, function(i, e) {
            if ($.isArray(e) && e.length > 1) {
                result += 1;
            }
        });
        return result;
    },
    hasFunnyCharacters : function() {
        return this._funnyCharacters.length !== 0;
    },
    numFunnyCharacters : function() {
        return this._funnyCharacters.length;
    },
    hasMissingPrefix : function() {
        return this._missingPrefixList.length !== 0;
    },
    numMissingPrefix : function() {
        return this._missingPrefixList.length;
    },
    merge : function(key) {
        var t = this;
        $.each(t._unifyList, function(i, e) {
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
                        var mainListIndex = t._list.indexOf(e[j]);
                        if (mainListIndex != -1) {
                            t._list.splice(mainListIndex, 1);
                        }
                        var mpListIndex = t._missingPrefixList.indexOf(e[j]);
                        if (mpListIndex != -1) {
                            t._missingPrefixList.splice(mpListIndex, 1);
                        }
                        e[j].remove();
                    }
                    t._unifyList.splice(i, 1);
                    t._notifyChange(t);
                    // break jquery each loop:
                    return false;
                }
            }
        });
    },
    correctPrefix : function(key, prefix) {
        var c = this.getById(key);
        c.insertPrefix(prefix);
        c.save(function() {
            log("prefix successfully saved for id :" + key,
                    ids.TEXTAREA_MISSINGPREFIX);
        }, function() {
            log("error while saving prefix for id " + key,
                    ids.TEXTAREA_MISSINGPREFIX);
        });
        var mpListIndex = this._missingPrefixList.indexOf(c);
        if (mpListIndex != -1) {
            this._missingPrefixList.splice(mpListIndex, 1);
        }
        this._notifyChange(this);
    },
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
