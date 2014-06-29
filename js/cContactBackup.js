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
    }

};
// exports.cContact = cContact;
