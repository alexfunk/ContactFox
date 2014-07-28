cContactBackup = function() {
};

// TODO: is this a bug. is everything still logged to the debug window
function log(e) {
    console.log(e);
}

cContactBackup.prototype = {
    /**
     * Constant identifier for the local storage to store all backed up contacts
     */
    _lsBackup : "ContactFox.Backup",
    _loadFromLocalStorage : function() {
        var backup = window.localStorage.getItem(this._lsBackup);
        if (backup === null) {
            backup = {};
        } else {
            backup = JSON.parse(backup);
        }
        return backup;
    },
    /**
     * length
     * 
     * @returns the number of all backed up contacts
     */
    length : function() {
        return Object.keys(this._loadFromLocalStorage()).length;
    },
    /**
     * save one contact to the backup list in local sstorage
     * 
     * @param contact
     *                an object of class cContact
     */
    backup : function(contact) {
        log("Backup: " + contact.displayName());
        var backup = this._loadFromLocalStorage();
        backup[contact.key()] = contact.c;
        window.localStorage.setItem(this._lsBackup, JSON.stringify(backup));
    },
    /**
     * append a user representation of the backup to a given list element
     * 
     * @param ul
     *                the list element
     */
    appendBackupListToUL : function(ul) {
        var backup = window.localStorage.getItem(this._lsBackup);
        if (backup === null) {
            backup = {};
        } else {
            backup = JSON.parse(backup);
        }
        $.each(backup, function(k, v) {
            var contact = new cContact(v);
            var html = '<li id="Backup' + contact.key() + '">'
                    + contact.displayName() + '</li>';
            ul.append(html);
            ul.children().last().data("contact", contact);
        });
        // End move this to cContactUtis
    },
    /**
     * get one contact from the backup list in local storage
     * 
     * @param id
     *                the id of the 
     */
    getBackupContactById : function(id) {
        try {
               var backup = this._loadFromLocalStorage();
               log("Get from Backup: " + id);
               if (backup !== null) {
                  return new cContact(backup[id]);
               } 
            } catch (ex) {
               log(ex);
            }   
    },
    /**
     * restore one contact from the backup list in local storage and  
     * delete it from the local storage
     * 
     * @param id
     *                the id oft the contact to restore
     */
    restoreContact : function(id) {
        try {
            log("Restore Contact: " + id);
            var backup = this._loadFromLocalStorage();
            var contact2restore = backup[id]; // contact record
            var cContact2restore = new cContact(contact2restore); // class envelope
            try {
                cContact2restore.save();
            } catch (ex) {
                log(ex);
            }  
            // really restored?
            var newContactList = contactUtils.getNewContactList();
//            log("Contact restored succesfully?");
            if ((newContactList.getById(id) !== null) && (newContactList.getById(id) !== false)) {
                // delete the contact from backup
                delete backup[id];
                log("Delete Contact from local storage: " + id);
                window.localStorage.setItem(this._lsBackup, JSON.stringify(backup));
            } else {
                log("Contact " + id + " could not be restored");
            };
        } catch (ex) {
            log(ex);
        }  
    }
};
// exports.cContact = cContact;
