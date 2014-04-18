cContactBackup = function() {};

//TODO: is this a bug. is everything still loged to the debug window
function log(e) {
    console.log(e);
}

cContactBackup.prototype = {
    _lsBackup: "ContactFox.Backup",
    backup: function(contact) {
        log("Backup: " + contact.displayName());
        var backup = window.localStorage.getItem(this._lsBackup);
        if (backup === null) {
            backup = {};
        } else {
            backup = JSON.parse(backup);
        }
        backup[contact.key()] = contact.c;
        window.localStorage.setItem(this._lsBackup, JSON.stringify(backup));
    },
    addBackupList: function(ul) {
        var backup = window.localStorage.getItem(this._lsBackup);
        if (backup === null) {
            backup = {};
        } else {
            backup = JSON.parse(backup);
        }
        $.each(backup, function(k, v) {
            var contact = new cContact(v);
            var html = '<li id="Backup' + contact.key() + '">' + contact.displayName() + '</li>';
            ul.append(html);
            ul.children().last().data("contact", contact);
        });
    }

};
//exports.cContact = cContact;
