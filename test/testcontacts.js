  require('../js/cContacts.js');
  require('../js/cContactUtils.js');
  jqFactory = require('../node_modules/jquery/dist/jquery.js');
  var jsdom = require("jsdom").jsdom,
      document = jsdom("<html><head></head><body>hello world</body></html>"),
      window = document.createWindow();
  navigator = {
      mozContacts: {
          save: function(c) {
              return {};
          },
          remove: function(c) {
              return {};
          }
      }
  };
  $ = jqFactory(window);

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
  }, {
      givenName: ['NoLastName'],
      name: ['NoLastName'],
      tel: [{
          type: 'mobile',
          value: '0421 555666'
      }]
  }];
  var c0 = new cContact(fixture[0]),
      c1 = new cContact(fixture[1]),
      c2 = new cContact(fixture[2]),
      c3 = new cContact(fixture[3]);
  var list = [];
  list = c0.addToList(list);
  list = c1.addToList(list);
  list = c2.addToList(list);
  list = c3.addToList(list);

  exports.cContacts = {
      'key': function(test) {
          test.expect(1);

          test.equal(c0.key(), "Doe_John");
          test.done();
      },
      'displayName': function(test) {
          test.expect(1);
          test.equal(c0.displayName(), "John Doe");
          test.done();
      },
      'containsNumber': function(test) {
          test.expect(3);
          test.equal(c0.containsNumber('0421 5554321'), true);
          test.equal(c1.containsNumber('0421 5551234'), true);
          test.equal(c1.containsNumber('0421 5554321'), false);
          test.done();
      },
      'unify': function(test) {
          test.expect(7);
          test.equal(c0.isUnifiyable(c1), true);
          test.equal(c0.isUnifiyable(c2), false);
          test.equal(c2.isUnifiyable(c2), true);
          test.equal(c0.unify(c1), null);
          test.equal(c0.c.tel.length, 2);
          test.equal(c0.containsNumber('0421 5554321'), true);
          test.equal(c0.containsNumber('0421 5551234'), true);
          test.done();
      },
      'addToList': function(test) {
          test.expect(4);
          test.equal(list.length, 3);
          test.equal(list[0].length + list[1].length, 3);
          c2.addToList(list);
          test.equal(list[0].length, 2);
          test.equal(list[1].length, 2);
          test.done();
      },
      'appendListToUL': function(test) {
          test.expect(11);
          test.equal($(document.body).length, 1);
          $(document.body).append("<ul></ul>");
          var ul = $('ul');
          test.equal(ul.length, 1);
          contactUtils.appendUnifyListToUL(list, ul);
          test.equal($('ul li').length, 2);
          $('ul li').each(function(index) {
              var id = $(this).attr("id");
              var data = $(this).data("list");
              test.equal(typeof id === 'undefined', false);
              test.equal(typeof data === 'undefined', false);
              test.equal(data === null, false, "data may not be null");
              test.equal(data === '', false, "data may not be empty string");
          });
          test.done();
      }
  };
