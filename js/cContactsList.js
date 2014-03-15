cContactList = function() {};

cContactList.prototype = {
    _list: [],
    _unifyList: [],
    _funnyCharacters: [],
    _missingPrefixList: [],
    add: function(c) {
        this._list.push(c);
        c.addToUnifyList(this._unifyList);
        if (c.hasMissingPrefix()) {
            this._missingPrefixList.push(c);
        }
    },
    size: function() {
        return this._list.length;
    },
    getById: function(id) {
        var result = null;
        $.each(this._list, function(i, e) {
            if (e.key() == id) {
                result = e;
                return false;
            }
        });
        return result;
    },
    appendUnifyListToUL: function(ul) {
        return contactUtils.appendUnifyListToUL(this._unifyList, ul);
    },
    appendMissingPrefixListToUL: function(ul) {
        return contactUtils.appendMissingPrefixListToUL(this._missingPrefixList, ul);
    },
    hasDuplicates: function() {
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
    numDuplicates: function() {
        var result = 0;
        $.each(this._unifyList, function(i, e) {
            if ($.isArray(e) && e.length > 1) {
                result += 1;
            }
        });
        return result;
    },
    hasFunnyCharacters: function() {
        return this._funnyCharacters.length !== 0;
    },
    numFunnyCharacters: function() {
        return this._funnyCharacters.length;
    },
    hasMissingPrefix: function() {
        return this._missingPrefixList.length !== 0;
    },
    numMissingPrefix: function() {
        return this._missingPrefixList.length;
    },
    merge: function(key) {
        var t = this;
        $.each(t._unifyList, function(i, e) {
            if ($.isArray(e) && e.length > 1) {
                var entry = e[0];
                if (entry.key() == key) {
                    entry.save();
                    for (var j = 1; j < e.length; j++) {
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
                    // break jquery each loop:
                    return false;
                }
            }
        });
    }
};
