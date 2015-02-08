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
 * returns the largest common chunk that this string and the given string start
 * with example: "abc".largeChunk("abde") === "ab" "abc".largeChunk("de") === ""
 */
if (typeof String.prototype.largeChunk != 'function') {
    String.prototype.largeChunk = function(str) {
        while (str.length !== 0) {
            if (this.startsWith(str))
                break;
            str = str.slice(0, str.length - 1);
        }
        return str;
    };
}

/**
 * Returns an array of changes tah describes the changes between the current
 * string and the to string eg "abcdefgh".stringDiff("abcedfgh") =
 * [["unchanged", "abc"], ["removed", "de"], ["added", "ed"], ["unchanged",
 * "fgh"] TODO this should not extend string but better be in an utility class
 * 
 */
if (typeof String.prototype.stringDiff != 'function') {
    String.prototype.stringDiff = function(to) {
        var from = this;
        var result = [];
        // append a change element to the result arry, if the content is not
        // the empty string
        var appendResult = function(op, string) {
            if (string.length !== 0)
                result.push([ op, string ]);
        };
        while (from.length > 0 && to.length > 0) {
            // if both strings have the same start add this largest
            // common part as unchanged and cut it from the input
            var largeChunk = from.largeChunk(to);
            if (largeChunk.length > 0) {
                appendResult("unchanged", largeChunk);
                from = from.slice(largeChunk.length, from.length);
                to = to.slice(largeChunk.length, to.length);
            }
            // everything from the start of the to string is now
            // added as 'removed' until a piece at least 3 characters are also
            // found somewhere in the
            // 'to' string.
            var removed = '';
            while (from.length > 0 && to.length > 0
                    && (from.length < 3 || to.indexOf(from.slice(0, 3)) == -1)) {
                removed = removed + from.slice(0, 1);
                from = from.slice(1, from.length);
            }
            appendResult("removed", removed);
            // the beginning of the 'to' string to the common part in the from
            // string is
            // added as 'added' to the result
            var commonStart = to.indexOf(from.slice(0, 3));
            if (commonStart != -1 && from.length > 0) {
                appendResult("added", to.slice(0, commonStart));
                to = to.slice(commonStart, to.length);
            } else {
                appendResult("added", to);
                to = "";
            }
            // at the end both strings either start with the same or
            // are used up completly
        }
        return result;
    };
}

/**
 * constructor of a contact object
 */
cContact = function(c) {
    this.c = c;
};

// TODO: is this a bug? is everything still logged to the debug window?
// function log(message) {
// console.log(message);
// }

/**
 * a private static variable that manages a backup of all contacts that are
 * modified by this module
 */
cContact._backup = new cContactBackup();

/**
 * start of the class
 */
cContact.prototype = {
    /**
     * allow access to the backup list
     * 
     * @returns the backup list
     */
    getBackup : function() {
        return cContact._backup;
    },
    /**
     * create a deep copy of an contact object that can be modified without
     * changing the original
     * 
     * @returns {cContact}
     */
    clone : function() {
        return new cContact(JSON.parse(JSON.stringify(this.c)));
    },
    /**
     * find a unique key of this contact object that can be used as an id in the
     * gui
     * 
     * @returns a string with the id
     */
    key : function() {
        var result;
        // in general the firefox os provides an id for the contact
        if (this.c.id)
            result = this.c.id;
        else {
            // if not we generate one from the content of the contact
            var givenName = "";
            if (($.isArray(this.c.givenName)) && (this.c.givenName.length > 0)) {
                givenName = this.c.givenName[0];
            }
            var familyName = "";
            if (($.isArray(this.c.familyName))
                    && (this.c.familyName.length > 0)) {
                familyName = this.c.familyName[0];
            }
            result = familyName + "_" + givenName;
        }
        return encodeURIComponent(result);
    },

    /**
     * Converts a user supplied String into one that can be displayed in HTML
     * without problems. For example the String '<&' is converted to
     * '&lt;&amp;'
     */
    escapeHTML : function(string) {
        var entityMap = {
            "&" : "&amp;",
            "<" : "&lt;",
            ">" : "&gt;",
            '"' : '&quot;',
            "'" : '&#39;',
            "/" : '&#x2F;'
        };
        return String(string).replace('/[&<>"\'\/]/g', function(s) {
            return entityMap[s];
        });
    },
    /**
     * to show a contact in a list a short string is needed. This is in most
     * cases the name of the contact, but if the name is not set it is composed
     * from Given Name and Family Name or the organisation of the contact.
     */
    displayName : function() {
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
            if (($.isArray(this.c.familyName))
                    && (this.c.familyName.length > 0)) {
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
    /**
     * Checks if this contact can be unified with the contact given as
     * parameter.
     */
    isUnifiyable : function(contact) {
        // TODO this compares first and last name, but
        // what is about first + last = last + first
        return this.displayName() == contact.displayName();
    },
    /**
     * after applying a change to a contact, numbers may be duplicated in the
     * same contact if this is the case, the duplicates are removed here.
     */
    clearDuplicateNumbers : function() {
        if ($.isArray(this.c.tel)) {
            var tel = this.c.tel;
            // put all indexes of telephone numbers the toDelete array
            var toDelete = [];
            for ( var i = 0; i < tel.length; i++) {
                var currentNumber = tel[i].value;
                // check if 'currentNumber' exist in the following numbers
                var numberExists = false;
                for ( var j = i + 1; j < tel.length; j++) {
                    if (currentNumber == tel[j].value) {
                        numberExists = true;
                        break;
                    }
                }

                if (numberExists) {
                    toDelete.push(i);
                }
            }
            // iterate backwards, so the indices in the toDelete Array will not
            // be invalidated
            for (i = toDelete.length; i > 0; i--) {
                this.c.tel.splice(toDelete[i], 1);
            }
        }
    },
    checkAllStrings : function(checkStringFunction) {
        var result = false;
        var t = this;
        $.each(this.members, function(i, e) {
            // i is the key of the entry like addr or phone
            var stringArray = t.contactMemberToString(i);
            $.each(stringArray, function(j, item) {
                if (checkStringFunction(item)) {
                    result = true;
                    return false; // <- Break the loop
                }
            });
            if (result)
                return false; // <- Break the loop

        });
        return result;
    },
    filterMember : function(member, filterStringFunction) {
        var memberValue = this.c[member];
        if ($.isArray(memberValue)) {
            var result = [];
            $.each(memberValue, function(i, e) {
                if (typeof e === 'string')
                    result.push(filterStringFunction(e));
                else
                    result.push(e);
            });
            this.c[member] = result;
        }
    },
    filterAllStrings : function(filterStringFunction) {
        var t = this;
        $.each(this.members, function(key, e) {
            // key is the key of the entry like addr or phone
            t.filterMember(key, filterStringFunction);
        });
    },
    /**
     * checks if a contact contains a given number
     */
    containsNumber : function(number) {
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
    /**
     * checks if a contact contains a given email address
     */
    containsEMail : function(mailaddress) {
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
    /**
     * checks if two street addresses are equal
     */
    // TODO: this should be a static function. Not related to the contact object
    addressEqual : function(adr1, adr2) {
        if (adr1 == adr2)
            return true;
        if ((adr1 === null) || (adr2 === null))
            return false;
        var keys = [ 'streetAddress', 'locality', 'region', 'postalCode',
                'countryName' ];
        var result = true;
        $.each(keys, function(i, e) {
            if (adr1[e] != adr2[e]) {
                result = false;
                return false;
            }
        });
        return result;
    },
    /**
     * converts one given member like 'adr' or 'tel' of the contact to an array
     * of human readable string. Some members are arrays others objects of
     * different types. This tries to deal with all situations. If the member is
     * not set or can't be converted to string, an empty array is returned.
     */
    contactMemberToString : function(member) {
        // define a map of functions to convert one entry of a contact-member to
        // a string.
        // if some member should not be displayed, null is returned.
        var memberfunction = {
            'adr' : this.addressToString,
            'email' : function(e) {
                return e.value;
            },
            'tel' : function(e) {
                return e.value;
            },
            'photo' : function(e) {
                return "photo";
            }
        };
        var fToString = function(a) {
            if (typeof a === "string")
                return a;
            return JSON.stringify(a);
        };
        // helper function to convert a member that contains a string
        // each entry in the array is mapped with the function above.
        var handleArray = function(a, f) {
            var result = [];
            $.each(a, function(i, e) {
                // if f(e) returns null, we try JSON to convert to string
                var val = f(e) || fToString(e);
                if (val !== null)
                    result.push(val);
            });
            return result;
        };
        // define a function that converts this member to a string. If there is
        // no
        // explicit function defined we use JSON.stringify.
        var convertFunction = memberfunction[member] || fToString;
        if ($.isArray(this.c[member])) {
            return handleArray(this.c[member], convertFunction);
        } else {
            if (typeof this.c[member] !== "undefined"
                    && this.c[member] !== null) {
                var value = this.c[member];
                var result = convertFunction(value);
                if (result !== null)
                    return [ result ];
                else
                    return [];
            } else {
                return [];
            }
        }
    },
    /**
     * converts a street address from a contact to a string that can be
     * displayed to the user
     */
    // TODO: this should be a static function. Not related to the contact object
    addressToString : function(adr1) {
        var keys = [ 'streetAddress', 'postalCode', 'locality', 'region',
                'countryName' ];
        var result = "";
        $.each(keys, function(i, e) {
            if (typeof adr1[e] !== "undefined") {
                if (result.length !== 0)
                    result += ',';
                result += adr1[e];
            }
        });
        return result;
    },
    /**
     * adds a HTML string representation of this contact to a given div-element
     * in the dom each non-empty member is added with a label. if one member has
     * more than one entries it is added with numbers at the label. Labels for
     * each entry can be found in each locale catalogue under the keyword
     * 'contact'. TODO: Maybe should be moved to another place, so that model
     * and ui is not intermixed
     * 
     * @param div
     *                the html element to add the string representation to
     * @param filter
     *                (optional) function that takes a member name and returns
     *                true if it should be displayed
     */
    appendAsString : function(div, filter) {
        var t = this;
        // if the caller sets no filter, a default is used
        if (filter === undefined) {
            filter = function(member) {
                return [ 'name', 'updated', 'published', 'id' ].indexOf(member) == -1;
            };
        }
        var appendItem = function(div, member, item, index) {
            var html = '<div><span data-i18n="contact.' + member + '"></span>';
            if (index === undefined) {
                html = html + '<span> : </span>';
            } else {
                html = html + '<span> ' + (index + 1) + ': </span>';
            }
            html = html + '<span class="contactcontent" >' + item
                    + '</span></div>';
            div.append(html);
        };
        $.each(this.members, function(i, e) {
            if (filter(i)) {
                // i is the key of the entry like addr or phone
                var stringArray = t.contactMemberToString(i);
                if (stringArray.length == 1) {
                    appendItem(div, i, stringArray[0]);
                } else if (stringArray.length > 1) {
                    $.each(stringArray, function(j, string) {
                        appendItem(div, i, string, j);
                    });
                }
            }
        });
    },
    /**
     * adds a HTML string representation of the diff of this contact and a given
     * contact to a given div-element in the dom each non-empty member is added
     * with a label. If one member has more than one entries it is added with
     * numbers at the label. Labels for each entry can be found in each locale
     * catalogue under the keyword 'contact'. TODO: Maybe should be moved to
     * another place, so that model and ui is not intermixed
     * 
     * @param div
     *                the html element to add the string representation to
     * @param filter
     *                (optional) function that takes a member name and returns
     *                true if it should be displayed
     */
    appendDiffAsString : function(div, other, filter) {
        var t = this;
        // if the caller sets no filter, a default is used
        if (filter === undefined) {
            filter = function(member) {
                // show every entry but the ones listed here
                return [ 'name', 'updated', 'published', 'id' ].indexOf(member) == -1;
            };
        }
        var appendItem = function(div, member, item, otheritem, index, noIndex) {
            var displayText;
            var style;
            if (item == otheritem) {
                displayText = item;
                style = "contactcontent";
            } else if (item === undefined) {
                displayText = otheritem;
                style = "contactcontentremoved";
            } else if (otheritem === undefined) {
                displayText = item;
                style = "contactcontentadded";
            } else {
                // two different strings in the same position,
                // this means the member of the contact is changed.
                // generate an array of changes and include it in the html
                stringDiff = otheritem.stringDiff(item);
                displayText = '';
                for (i = 0; i < stringDiff.length; i++) {
                    var change = stringDiff[i];
                    if (change[0] === 'added') {
                        displayText += '<span class="contactcontentadded">'
                                + change[1] + '</span> ';
                    }
                    if (change[0] === 'removed') {
                        displayText += '<span class="contactcontentremoved">'
                                + change[1] + '</span> ';
                    }
                    if (change[0] === 'unchanged') {
                        displayText += '<span>' + change[1] + '</span> ';
                    }
                }
                style = "contactcontent";
            }
            var html = '<div><span data-i18n="contact.' + member + '"></span>';
            if (noIndex) {
                html = html + '<span> : </span>';
            } else {
                html = html + '<span> ' + (index + 1) + ': </span>';
            }
            html = html + '<span class="' + style + '" >' + displayText
                    + '</span></div>';
            div.append(html);
        };
        $.each(this.members, function(i, e) {
            if (filter(i)) {
                // i is the key of the entry like addr or phone
                var stringArray = t.contactMemberToString(i);
                var otherStringArray = other.contactMemberToString(i);
		var noIndex = stringArray.length == 1 && otherStringArray.length == 1;
                $.each(stringArray, function(j, string) {
                     appendItem(div, i, string, otherStringArray[j], j, noIndex);
                });
                for (var j = stringArray.length; j < otherStringArray.length; j++) {
                    appendItem(div, i, undefined, otherStringArray[j], j, noIndex);
                }
            }
        });
    },
    /**
     * checks if this contact contains an address
     */
    containsAddress : function(adress) {
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
     * copies all informations from the given contact to this contact unless the
     * information is already there
     */
    unify : function(contact) {
        cContact._backup.backup(this);
        // some member of a contact can be unified easily, since it is just
        // an array of string. For other members there should be a special
        // function in the unify-member map.
        var unifymember = {
            "tel" : function(t, contact) {
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
            "adr" : function(t, contact) {
                // checking that two addresses are equal is not trivial
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
            "email" : function(t, contact) {
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
        // we know all valid members in a contact record and its expected type
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
                // we still check if the master has no value but the contact
                // to merge has
                else if (!t.c[key]) {
                    t.c[key] = contact.c[key];
                }

            }
        });
    },
    /**
     * this transfers the contact object from the application memory to the
     * address book of the phone.
     */
    save : function(onSuccess, onError) {
        var contact;
        var getClassOf = Function.prototype.call
                .bind(Object.prototype.toString);

        // if this.c is already a mozContact, transfer it to the
        // save function because the id is alread set
        // transfering the id member to a new record does not work
        if (getClassOf(this.c) === "[object mozContact]") {
            log("existing contact");
            contact = this.c;
        } else {
            // if it is not a mozContact we convert it to one
            // in b2g 1.3 a contact must implement the mozContact interface
            // in b2g 1.2 it must be init by the int function
            // this should work for b2g 1.2 and b2g 1.3
            contact = new mozContact(this.c);
            if ("init" in contact)
                contact.init(this.c);
        }

        var saveResult;
        try {
            saveResult = navigator.mozContacts.save(contact);
        } catch (ex) {
            log("save contact exception: " + ex);
        }
        if (contactUtils.paramExists(onSuccess)) {
            saveResult.onsuccess = onSuccess;
        }
        if (contactUtils.paramExists(onError)) {
            saveResult.onerror = onError;
        }
    },
    /**
     * removes this contact from the phones address book
     */
    remove : function() {
        var name = this.displayName() + "(" + this.key() + ")";
        // before a contact is removed, it is backed up in local storage,
        // so it could be restored later on
        cContact._backup.backup(this);
        var removeResult = navigator.mozContacts.remove(this.c);
        removeResult.onerror = function() {
            log("Error: Could not remove " + name);
        };
        removeResult.onsuccess = function() {
            log(name + " successfully removed");
        };
    },
    /**
     * Adds this contact to the unify list. The unify list is the starting point
     * of the unify operation. The UnifyList is an array or arrays of contacts.
     * Each sublist contains unify-able contacts
     */
    addToUnifyList : function(unifyList) {
        // console.log("unify List : " + JSON.stringify(unifyList));
        var added = false;
        var current = this;
        $.each(unifyList, function(i, e) {
            var entry = e[0];
            // console.log("unify entry[" + i + "] = " + JSON.stringify(entry)
            // + " with " + JSON.stringify(current));
            if (current.isUnifiyable(entry)) {
                e.push(current);
                added = true;
            }
        });
        // if this contact is not unifiable with any of the contacts in the
        // list,
        // this contact is added as its own array
        if (!added) {
            unifyList.push([ this ]);
        }
        return unifyList;
    },
    // this is form the firefox os specification, describing the exact structure
    // of a contact record.
    members : {
        id : 'string', // Read only The unique id of the contact in the
        // device's contact database.
        published : 'date', // Read only A Date object giving the first time the
        // contact was stored.
        updated : 'date', // Read only A Date object giving the last time the
        // contact was updated.
        name : 'arrayString', // An array of string representing the different
        // general names of the contact.
        honorificPrefix : 'arrayString', // An array of string representing
        // the different honorific prefixes
        // of the contact.
        givenName : 'arrayString', // An array of string representing the
        // different given names of the contact.
        additionalName : 'arrayString', // An array of string representing any
        // additional names of the contact.
        familyName : 'arrayString', // An array of string representing the
        // different family names of the contact.
        honorificSuffix : 'arrayString', // An array of string representing
        // the different honorific suffixes
        // of the contact.
        nickname : 'arrayString', // An array of string representing the
        // different nicknames of the contact.
        email : 'arrayObject', // An array of object, each representing an
        // e-mail with a few extra metadata.
        photo : 'arrayBlob', // An array of Blob, which are photos for the
        // contact.
        url : 'arrayObject', // An array of object, each representing a URL
        // with a few extra metadata.
        category : 'arrayString', // An array of string representing the
        // different categories the contact is
        // associated with.
        adr : 'arrayObject', // An array of object, each representing an
        // address.
        tel : 'arrayObject', // An array of object, each representing a phone
        // number with a few extra metadata.
        org : 'arrayString', // An array of string representing the different
        // organizations the contact is associated with.
        jobTitle : 'arrayString', // An array of string representing the
        // different job titles of the contact.
        bday : 'date', // A Date object representing the birthday date of the
        // contact.
        note : 'arrayString', // An array of string representing notes about
        // the contact.
        impp : 'arrayString', // An array of object, each representing an
        // Instant Messaging address with a few extra
        // metadata.
        anniversary : 'date', // A Date object representing the anniversary
        // date of the contact.
        sex : 'String', // A string representing the sex of the contact.
        genderIdentity : 'String', // A string representing the gender identity
        // of the contact.
        key : 'arrayString' // A array of string representing the public
    // encryption key associated with the contact.

    }
// members of an address

// type
// A string representing the type for that address (e.g., "home", "work").
// pref
// A boolean indicating if it is the preferred address (true) or not (false).
// streetAddress
// A string representing the street name, number, etc. of the address.
// locality
// A string representing the city of the address.
// region
// A string representing the geographical region of the address.
// postalCode
// A string representing the postal code for the address.
// countryName
// A string representing the name of the country for the address.

};
// exports.cContact = cContact;
