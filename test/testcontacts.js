 require('./testutilities.js');

 var fixture = [{
     //0
     givenName: ['John'],
     familyName: ['Doe'],
     name: ['John Doe'],
     tel: [{
         type: 'mobile',
         value: '0421 5554321'
     }]
 }, {
     //1
     givenName: ['John'],
     familyName: ['Doe'],
     name: ['John Doe'],
     tel: [{
         type: 'mobile',
         value: '0421 5551234'
     }]
 }, {
     //2
     givenName: ['Bart'],
     familyName: ['Simpson'],
     name: ['The Bartman'],
     tel: [{
         type: 'mobile',
         value: '0421 555666'
     }]
 }, {
     //3
     givenName: ['NoLastName'],
     name: ['NoLastName'],
     tel: [{
         type: 'mobile',
         value: '0421 555666'
     }]
 }, {
     //4
     givenName: ['John'],
     familyName: ['Doe'],
     name: ['John Doe'],
     tel: [{
         type: 'mobile',
         value: '0421 5551234-1'
     }, {
         type: 'mobile',
         value: '0421 5551234-2'
     }]
 }, {
     //5
     givenName: ['John'],
     familyName: ['Doe'],
     name: ['John Doe'],
     tel: [{
         type: 'mobile',
         value: '0421 5551234-1'
     }, {
         type: 'mobile',
         value: '0421 5551234-2'
     }],
     email: [{
         type: "home",
         value: "John@JohnDoe.de"
     }]
 }, {
     //6
     givenName: ['John'],
     familyName: ['Doe'],
     name: ['John Doe'],
     adr: [{
         type: 'home',
         streetAddress: 'Backerstreet 221a',
         locality: 'London',
         postalCode: 'AB1 CD2',
         countryName: 'UK'
     }]
 }, {
     //7
     givenName: ['John'],
     familyName: ['Doe'],
     name: ['John Doe'],
     adr: [{
         type: 'work',
         streetAddress: 'Backerstreet 221a',
         locality: 'London',
         postalCode: 'AB1 CD2',
         countryName: 'UK'
     }, {
         type: 'home',
         streetAddress: 'Musterweg 1',
         locality: 'Bielefeld',
         postalCode: '33666',
         countryName: 'Germany'
     }]
 }];
 var c = [];
 $.each(fixture, function(i, e) {
     c.push(new cContact(e));
 });

 exports.cContacts = {
     'key': function(test) {
         test.expect(1);

         test.equal(c[0].key(), "Doe_John");
         test.done();
     },
     'displayName': function(test) {
         test.expect(1);
         test.equal(c[0].displayName(), "John Doe");
         test.done();
     },
     'containsNumber': function(test) {
         test.expect(3);
         test.equal(c[0].containsNumber('0421 5554321'), true);
         test.equal(c[1].containsNumber('0421 5551234'), true);
         test.equal(c[1].containsNumber('0421 5554321'), false);
         test.done();
     },
     'unify': function(test) {
         test.expect(19);
         test.equal(c[0].c.givenName.length, 1);
         test.equal(c[0].isUnifiyable(c[1]), true);
         test.equal(c[0].isUnifiyable(c[2]), false);
         test.equal(c[2].isUnifiyable(c[2]), true);
         test.equal(c[0].unify(c[1]), null);
         test.equal(c[0].c.tel.length, 2);
         test.equal(c[0].containsNumber('0421 5554321'), true);
         test.equal(c[0].containsNumber('0421 5551234'), true);
         test.equal(c[0].c.givenName.length, 1);
         test.equal(c[1].c.familyName.length, 1);
         c[1].unify(c[4]);
         test.equal(c[1].c.tel.length, 3);
         test.equal(c[1].containsNumber('0421 5551234-1'), true);
         test.equal(c[1].containsNumber('0421 5551234-2'), true);
         c[1].unify(c[5]);
         test.equal(c[1].c.tel.length, 3);
         test.equal(c[1].containsNumber('0421 5551234-1'), true);
         test.equal(c[1].containsNumber('0421 5551234-2'), true);
         test.equal(c[1].containsEMail('John@JohnDoe.de'), true);
         c[1].unify(c[6]);
         test.equal(c[1].c.adr.length, 1);
         test.equal(c[1].containsAddress({
             type: 'home',
             streetAddress: 'Backerstreet 221a',
             locality: 'London',
             postalCode: 'AB1 CD2',
             countryName: 'UK'
         }), true);
         test.equal(c[1].c.familyName.length, 1);


         test.done();
     },
     'addToUnifyList': function(test) {
         test.expect(4);
         var list = [];
         for (var i = 0; i < 4; i++) {
             list = c[i].addToUnifyList(list);
         }
         test.equal(list.length, 3);
         test.equal(list[0].length + list[1].length, 3);
         c[2].addToUnifyList(list);
         test.equal(list[0].length, 2);
         test.equal(list[1].length, 2);
         test.done();
     },
     'appendUnifyListToUL': function(test) {
         test.expect(11);
         var list = [];
         for (var i = 0; i < 4; i++) {
             list = c[i].addToUnifyList(list);
         }
         list = c[2].addToUnifyList(list);

         test.equal($(document.body).length, 1);
         $(document.body).append("<ul></ul>");
         var ul = $('ul');
         test.equal(ul.length, 1);
         contactUtils.appendUnifyListToUL(list, ul);
         // how many list items (li) how many contacts to merge
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


 //type
 //    A string representing the type for that address (e.g., "home", "work").
 //pref
 //    A boolean indicating if it is the preferred address (true) or not (false).
 //streetAddress
 //    A string representing the street name, number, etc. of the address.
 //locality
 //    A string representing the city of the address.
 //region
 //    A string representing the geographical region of the address.
 //postalCode
 //    A string representing the postal code for the address.
 //countryName
 //    A string representing the name of the country for the address.
