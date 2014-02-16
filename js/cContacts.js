cContact = function(c) {
    this.c = c;
};

function log(e) {
    console.log(e);
}


cContact.prototype = {
    key: function() {
        var givenName = "";
        if (($.isArray(this.c.givenName)) && (this.c.givenName.length > 0)) {
            givenName = this.c.givenName[0];
        }
        var familyName = "";
        if (($.isArray(this.c.familyName)) && (this.c.familyName.length > 0)) {
            familyName = this.c.familyName[0];
        }
        // TODO escape
        return familyName + "_" + givenName;
    },
    displayName: function() {
        var givenName = "";
        if (($.isArray(this.c.givenName)) && (this.c.givenName.length > 0)) {
            givenName = this.c.givenName[0];
        }
        var familyName = "";
        if (($.isArray(this.c.familyName)) && (this.c.familyName.length > 0)) {
            familyName = this.c.familyName[0];
        }
        // TODO escape
        return givenName + " " + familyName;

    },
    isUnifiyable: function(contact) {
        return this.displayName() == contact.displayName();
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
    addressEqual: function(adr1, adr2) {
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
     * it is already there
     */
    unify: function(contact) {
        // some member of a contact can be unified easily, since it is just
        // an array of string. For other mebers there should be a special function
        // in the unifymember map.
        var unifymember = {
            "tel": function(t, contact) {
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
        log(JSON.stringify(this.c));
        var removeResult = navigator.mozContacts.remove(this.c);
        removeResult.onerror = function() {
            log("removeError");
        };
        removeResult.onsuccess = function() {
            log("removeSuccess");
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


};
//exports.cContact = cContact;
