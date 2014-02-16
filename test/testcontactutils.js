  require('./testutilities.js');

  var fixture = [{
      givenName: ['John'],
      familyName: ['Doe'],
      name: ['John Doe'],
      tel: [{
          type: 'mobile',
          value: '0421 5554321'
      }]
  }, {
      givenName: ['John'],
      familyName: ['Doe'],
      name: ['John Doe'],
      tel: [{
          type: 'mobile',
          value: '0421 5551234'
      }]
  }, {
      givenName: ['Bart'],
      familyName: ['Simpson'],
      name: ['The Bartman'],
      tel: [{
          type: 'mobile',
          value: '0421 555666'
      }]
  }];
  var c0 = new cContact(fixture[0]),
      c1 = new cContact(fixture[1]),
      c2 = new cContact(fixture[2]);
  var contactList = new cContactList();
  exports.cContacts = {
      'unifyContactList': function(test) {
          test.expect(3);
          var contact = contactUtils.unifyContactList([c0, c1]);

          test.equal(typeof contact === undefined, false);
          test.equal(contact.containsNumber('0421 5554321'), true);
          test.equal(contact.containsNumber('0421 5551234'), true);
          test.done();
      }
  };
