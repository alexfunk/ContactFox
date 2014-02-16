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
      'list': function(test) {
          test.expect(7);

          test.equal(contactList.size(), 0);
          contactList.add(c0);
          test.equal(contactList.size(), 1);
          test.equal(contactList.hasDuplicates(), false);
          contactList.add(c1);
          test.equal(contactList.size(), 2);
          test.equal(contactList.hasDuplicates(), true);
          contactList.merge(c0.key());
          test.equal(contactList.hasDuplicates(), false);
          test.equal(contactList.size(), 1);
          test.done();
      }
  };
