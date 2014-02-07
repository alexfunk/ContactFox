cContact = function(c) {
    this.c = c;
};

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
    unify: function(contact) {
        var t = this;
        if (!t.c.tel) {
            t.c.tel = [];
        }
        if ($.isArray(contact.c.tel)) {
            $.each(contact.c.tel, function(i, e) {
                if (!t.containsNumber(e.value)) {
                    t.c.tel[contact.c.tel.length] = e;
                }
            });
        }
    },
    save: function() {
        var saveResult = navigator.mozContacts.save(this.c);
        saveResult.onerror = function() {
            $('#' + ids.TEXTAREA).append("saveError");
        };
        saveResult.onsuccess = function() {
            $('#' + ids.TEXTAREA).append("saveSuccess");
        };

    },
    remove: function() {
        var removeResult = navigator.mozContacts.remove(this.c);
        removeResult.onerror = function() {
            $('#' + ids.TEXTAREA).append("removeError");
        };
        removeResult.onsuccess = function() {
            $('#' + ids.TEXTAREA).append("removeSuccess");
        };
    },
    /**
     * list is an array or arrays of contacts. Each sublist contains unifiable contacts
     */
    addToList: function(list) {
        var added = false;
        var current = this;
        $.each(list, function(i, e) {
            var entry = e[0];
            if (current.isUnifiyable(entry)) {
                e[e.length] = current;
                added = true;
            }
        });
        if (!added) {
            list[list.length] = [this];
        }
        return list;
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
        anniversary: 'arrayString', // A Date object representing the anniversary date of the contact.
        sex: 'String', // A string representing the sex of the contact.
        genderIdentity: 'String', // A string representing the gender identity of the contact.
        key: 'arrayString' // A array of string representing the public encryption key associated with the contact.

    }


};
//exports.cContact = cContact;