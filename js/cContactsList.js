cContactList = function() {};

cContactList.prototype = {
    _list: [],
    _unifyList: [],
    add: function(c) {
        this._list[this._list.length] = c;
        c.addToList(this._unifyList);
    },
    size: function() {
        return this._list.length;
    },
    appendUnifyListToUL: function(ul) {
        return contactUtils.appendUnifyListToUL(this._unifyList, ul);
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
    hasFunnyCharacters: function() {
        return false;
    },
    hasMissingPlus: function() {
        return false;
    },
    merge: function(key) {
        var uList = this._unifyList;
        $.each(uList, function(i, e) {
            if ($.isArray(e) && e.length > 1) {
                var entry = e[0];
                if (entry.key() == key) {
                    entry.save();
                    for (var j = 1; j < e.length; j++) {
                        e[j].remove();
                    }
                    uList.splice(i, 1);
                    // break jquery each loop:
                    return false;
                }
            }
        });
    }
};