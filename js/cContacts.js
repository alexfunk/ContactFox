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


/**
 * constructor of a contact object
 */
cContact = function(c) {
    this.c = c;
    this._backup = new cContactBackup();
};

//TODO: is this a bug. is everything still loged to the debug window
function log(e) {
    console.log(e);
}


cContact.prototype = {
    key: function() {
        var result;
        if (this.c.id) result = this.c.id;
        else {
            var givenName = "";
            if (($.isArray(this.c.givenName)) && (this.c.givenName.length > 0)) {
                givenName = this.c.givenName[0];
            }
            var familyName = "";
            if (($.isArray(this.c.familyName)) && (this.c.familyName.length > 0)) {
                familyName = this.c.familyName[0];
            }
            result = familyName + "_" + givenName;
        }
        return encodeURIComponent(result);
    },

    escapeHTML: function(string) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };
        return String(string).replace('/[&<>"\'\/]/g', function(s) {
            return entityMap[s];
        });
    },

    displayName: function() {
        var lResult;
        var lName = "";
        if (($.isArray(this.c.name)) && (this.c.name.length > 0)) {
            lName = this.c.name[0];
        }
        lResult = lName;
        if (lResult.length === 0) {
            var lGivenName = "";
            if (($.isArray(this.c.givenName)) && (this.c.givenName.length > 0)) {
                lGivenName = this.c.givenName[0];
            }
            var lFamilyName = "";
            if (($.isArray(this.c.familyName)) && (this.c.familyName.length > 0)) {
                lFamilyName = this.c.familyName[0];
            }
            if ((lFamilyName.length !== 0) && (lGivenName.length !== 0))
                lResult = lGivenName + " " + lFamilyName;
        }
        if (lResult.length === 0) {
            var lOrg = "";
            if (($.isArray(this.c.org)) && (this.c.org.length > 0)) {
                lOrg = this.c.org[0];
            }
            lResult = lOrg;
        }
        return this.escapeHTML(lResult);

    },
    isUnifiyable: function(contact) {
        //TODO compare first and last name
        // what about first + last = last + first
        return this.displayName() == contact.displayName();
    },
    hasMissingPrefix: function() {
        var result = false;
        if ($.isArray(this.c.tel)) {
            $.each(this.c.tel, function(i, e) {
                if (typeof e.value === 'string' && !e.value.startsWith("+") && !e.value.startsWith("00")) {
                    result = true;
                    return false;
                }
            });
        }
        return result;
    },
    clearDupplicateNumbers: function() {
        if ($.isArray(this.c.tel)) {
            var tel = this.c.tel;
            // put all indexes of telephone numbers the toDelete array 
            var toDelete = [];
            for (var i = 0; i < tel.length; i++) {
                var currentNumber = tel[i].value;
                // check if 'currentNumber' exist in the following numbers
                var numberExists = false;
                for (var j = i + 1; j < tel.length; j++) {
                    if (currentNumber == tel[j].value) {
                        numberExists = true;
                        break;
                    }
                }

                if (numberExists) {
                    toDelete.push(i);
                }
            }
            // iterate backwards, so the indices in the toDelete Array will not be invalidated
            for (i = toDelete.length; i > 0; i--) {
                this.c.tel.splice(toDelete[i], 1);
            }
        }
    },
    /** insert the given prefix to all phone numbers that dont start with 00 or +
     */
    insertPrefix: function(prefix) {
        if ($.isArray(this.c.tel)) {
            $.each(this.c.tel, function(i, e) {
                if (typeof e.value === 'string' && !e.value.startsWith("+") && !e.value.startsWith("00")) {
                    if (e.value.startsWith("0")) {
                        var oldValue = e.value;
                        e.value = prefix + e.value.substring(1);
                    }
                }
            });
            // ok, the prefix is added now, but maybe the fixed number was already in the contact
            // so we check for dupplicate phonnumber entries here
            this.clearDupplicateNumbers();
        }
    },
    containsNumber: function(number) {
        var result = false;
        if ($.isArray(this.c.tel)) {
            $.each(this.c.tel, function(i, e) {
                if (e.value == number) {
                    result = true;
                    return false;
                }
            });
        }
        return result;
    },
    containsEMail: function(mailaddress) {
        var result = false;
        if ($.isArray(this.c.email)) {
            $.each(this.c.email, function(i, e) {
                if (e.value == mailaddress) {
                    result = true;
                    return false;
                }
            });
        }
        return result;
    },
    //TODO: this should be a static function. Not related to the contact object
    addressEqual: function(adr1, adr2) {
        if (adr1 == adr2) return true;
        if ((adr1 === null) || (adr2 === null)) return false;
        var keys = ['streetAddress', 'locality', 'region', 'postalCode', 'countryName'];
        var result = true;
        $.each(keys, function(i, e) {
            if (adr1[e] != adr2[e]) {
                result = false;
                return false;
            }
        });
        return result;
    },
    //TODO: this should be a static function. Not related to the contact object
    addressToString: function(adr1) {
        var keys = ['streetAddress', 'postalCode', 'locality', 'region', 'countryName'];
        var result = "";
        $.each(keys, function(i, e) {
            if (typeof adr1[e] !== "undefined") {
                if (result.length !== 0) result += ',';
                result += adr1[e];
            }
        });
        return result;
    },
    contactMemberToString: function(member) {
        var f = {
            'adr': this.addressToString,
            'email': function(e) {
                return e.value;
            },
            'tel': function(e) {
                return e.value;
            },
            'photo': function(e) {
                return "photo";
            },
            'id': function(e) {
                return null;
            },
            'published': function(e) {
                return null;
            },
            'updated': function(e) {
                return null;
            },
            'name': function(e) {
                return null;
            }
        };
        var handleArray = function(a, f) {
            var result = [];
            $.each(a, function(i, e) {
                var val = f(e);
                if (val !== null) result.push(val);
            });
            return result;
        };
        if ($.isArray(this.c[member])) {
            return handleArray(this.c[member], f[member] || JSON.stringify);
        } else {
            if (typeof this.c[member] !== "undefined" && this.c[member] !== null) {
                var result = (f[member] || JSON.stringify)(this.c.member);
                if (result !== null) return [result];
                else
                    return [];
            } else {
                return [];
            }
        }
    },
    appendAsString: function(div) {
        var t = this;
        $.each(this.members, function(i, e) {
            var stringArray = t.contactMemberToString(i);
            if (stringArray.length == 1) {
                div.append('<div><span data-i18n="contact.' + i + '"></span><span> : </span><span class="contactcontent" >' + stringArray[0] + '</span></div>');
            } else if (stringArray.length > 1) {
                $.each(stringArray, function(j, string) {
                    div.append('<div><span data-i18n="contact.' + i + '"></span><span> ' + (j + 1) + ': </span><span class="contactcontent" >' + string + '</span></div>');
                });
            }
        });
    },
    containsAddress: function(adress) {
        var t = this;
        var result = false;
        if ($.isArray(this.c.adr)) {
            $.each(this.c.adr, function(i, e) {
                if (t.addressEqual(e, adress)) {
                    result = true;
                    return false;
                }
            });
        }
        return result;
    },
    /**
     * copies all informations from the given contact to this contact unless
     * the information is already there
     */
    unify: function(contact) {
        this._backup.backup(this);
        // some member of a contact can be unified easily, since it is just
        // an array of string. For other mebers there should be a special function
        // in the unifymember map.
        var unifymember = {
            "tel": function(t, contact) {
                // an entry is an object with type and value
                // we look only at the value at the merge
                // so if there are two numbers with the same value but different
                // type, one type is lost.
                if (!t.c.tel) {
                    t.c.tel = [];
                }
                if ($.isArray(contact.c.tel)) {
                    $.each(contact.c.tel, function(i, e) {
                        if (!t.containsNumber(e.value)) {
                            t.c.tel.push(e);
                        }
                    });
                }
            },
            "adr": function(t, contact) {
                // checking that two adresses are equal is not trivial
                if (!t.c.adr) {
                    t.c.adr = [];
                }
                if ($.isArray(contact.c.adr)) {
                    $.each(contact.c.adr, function(i, e) {
                        if (!t.containsAddress(e)) {
                            t.c.adr.push(e);
                        }
                    });
                }
            },
            "email": function(t, contact) {
                // like phone numbers emails have a type,
                // if there are two same email.adresses with different type
                // they are considered equal and one is lost during unification
                if (!t.c.email) {
                    t.c.email = [];
                }
                if ($.isArray(contact.c.email)) {
                    $.each(contact.c.email, function(i, e) {
                        if (!t.containsEMail(e.value)) {
                            t.c.email.push(e);
                        }
                    });
                }
            }
        };
        var t = this;
        // we know all valid memebers in a contact record and its expected type
        // so we unify each member one by one
        $.each(this.members, function(key, value) {
            if (typeof unifymember[key] !== "undefined") {
                unifymember[key](t, contact);
            } else {
                if (value == "arrayString") {
                    if (!t.c[key]) {
                        t.c[key] = [];
                    }
                    if ($.isArray(contact.c[key])) {
                        $.each(contact.c[key], function(i, e) {
                            if (t.c[key].indexOf(e) == -1) {
                                t.c[key].push(e);
                            }
                        });
                    }
                }
                // if it is not an arrayString or an member handled special
                // we still check if the master has no value but the contact to merge has 
                else if (!t.c[key]) {
                    t.c[key] = contact.c[key];
                }

            }
        });
    },
    save: function() {
        log(JSON.stringify(this.c));
        var saveResult = navigator.mozContacts.save(this.c);
        saveResult.onerror = function() {
            log("saveError");
        };
        saveResult.onsuccess = function() {
            log("saveSuccess");
        };

    },
    remove: function() {
        var name = this.displayName();
        // before a contact is removed, it is backed up in local storage, 
        // so it could be restored later on
        this._backup.backup(this);
        var removeResult = navigator.mozContacts.remove(this.c);
        removeResult.onerror = function() {
            log("Error: Could not remove " + name);
        };
        removeResult.onsuccess = function() {
            log(name + " successfully removed");
        };
    },
    /**
     * unifyList is an array or arrays of contacts. Each sublist contains unifiable contacts
     */
    addToUnifyList: function(unifyList) {
        var added = false;
        var current = this;
        $.each(unifyList, function(i, e) {
            var entry = e[0];
            if (current.isUnifiyable(entry)) {
                e.push(current);
                added = true;
            }
        });
        if (!added) {
            unifyList.push([this]);
        }
        return unifyList;
    },
    members: {
        id: 'string', // Read only The unique id of the contact in the device's contact database.
        published: 'date', // Read only A Date object giving the first time the contact was stored.
        updated: 'date', // Read only A Date object giving the last time the contact was updated.
        name: 'arrayString', // An array of string representing the different general names of the contact.
        honorificPrefix: 'arrayString', // An array of string representing the different honorific prefixes of the contact.
        givenName: 'arrayString', // An array of string representing the different given names of the contact.
        additionalName: 'arrayString', // An array of string representing any additional names of the contact.
        familyName: 'arrayString', // An array of string representing the different family names of the contact.
        honorificSuffix: 'arrayString', // An array of string representing the different honorific suffixes of the contact.
        nickname: 'arrayString', // An array of string representing the different nicknames of the contact.
        email: 'arrayObject', // An array of object, each representing an e-mail with a few extra metadata.
        photo: 'arrayBlob', // An array of Blob, which are photos for the contact.
        url: 'arrayObject', //  An array of object, each representing a URL with a few extra metadata.
        category: 'arrayString', // An array of string representing the different categories the contact is associated with.
        adr: 'arrayObject', // An array of object, each representing an address.
        tel: 'arrayObject', // An array of object, each representing a phone number with a few extra metadata.
        org: 'arrayString', // An array of string representing the different organizations the contact is associated with.
        jobTitle: 'arrayString', // An array of string representing the different job titles of the contact.
        bday: 'date', // A Date object representing the birthday date of the contact.
        note: 'arrayString', // An array of string representing notes about the contact.
        impp: 'arrayString', // An array of object, each representing an Instant Messaging address with a few extra metadata.
        anniversary: 'date', // A Date object representing the anniversary date of the contact.
        sex: 'String', // A string representing the sex of the contact.
        genderIdentity: 'String', // A string representing the gender identity of the contact.
        key: 'arrayString' // A array of string representing the public encryption key associated with the contact.

    }
    //members of an address

    //type
    //    A string representing the type for that address (e.g., "home", "work").
    //pref
    //    A boolean indicating if it is the preferred address (true) or not (false).
    //streetAddress
    //    A string representing the street name, number, etc. of the address.
    //locality
    //    A string representing the city of the address.
    //region
    //    A string representing the geographical region of the address.
    //postalCode
    //    A string representing the postal code for the address.
    //countryName
    //    A string representing the name of the country for the address.

};
//exports.cContact = cContact;
