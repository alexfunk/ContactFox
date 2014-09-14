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
     * save one contact to the backup list in local storage
     * 
     * @param contact
     *                an object of class cContact
     */
    backup : function(contact) {
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
        // Start move this to cContactUtils into new function
        // appendUlToHTML see cContactUtils
        $.each(backup, function(k, v) {
            var contact = new cContact(v);
            var html = '<li id="RestoreBackup' + contact.key() + '"><a>'
                    + contact.displayName() + '</a></li>';
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
     * restore one contact from the backup list in local storage and delete it
     * from the local storage
     * 
     * @param id
     *                the id oft the contact to restore
     */
    /*
     * @param id
     *//*
         * deleteContactFromLocalStorage : function(backup, id) { log("Contact
         * successfully restored"); // delete the contact from backup delete
         * backup[id]; },
         */
    /*
     * @param id
     */
    restoreContact : function(id) {
        try {
            log("Restore Contact: " + id);
            var backup = this._loadFromLocalStorage();
            var contact2restore = backup[id]; // contact record
            var cContact2restore = new cContact(contact2restore); // class
            // envelope
            var onSuccess = function() {
                try {
                    delete backup[id];
                    $('#RestoreBackup' + id).hide();
                    window.localStorage.setItem(this._lsBackup, JSON
                            .stringify(backup));
                    log("backup successfully restored: " + id,
                            ids.TEXTAREA_RESTOREBACKUP);
                } catch (ex) {
                    log(ex);
                }
            };
            cContact2restore.save(onSuccess, function() {
                log("save error while restoring backup for id: " + id,
                        ids.TEXTAREA_RESTOREBACKUP);
            });
        } catch (ex) {
            log(ex);
        }
    }
};
// exports.cContact = cContact;
