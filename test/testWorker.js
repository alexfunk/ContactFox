require('./testutilities.js');
var worker = new Worker('js/backgroundWorker.js');

function sleep(millis, callback) {
    setTimeout(function() {
        callback();
    }, millis);
}

exports.backgroundWorker = {
    'worker1' : function(test) {
        test.expect(1);
        worker.postMessage({
            command : "test"
        });
        var result = "";
        worker.onmessage = function(e) {
            result = e.data;
        };
        function sleep_done() {
            console.log("sleep done.");
            test.equal(result.result, '"test"');
            test.done();
        }
        sleep(1000, sleep_done);
    },
//    'worker2' : function(test) {
//        test.expect(1);
//        var missingPrefix = new cMissingPrefix();
//        var contact = new cContact({
//            givenName : [ 'Bart' ],
//            familyName : [ 'Simpson' ],
//            name : [ 'The Bartman' ],
//            tel : [ {
//                type : 'mobile',
//                value : '0421 555666'
//            } ]
//        });
//        missingPrefix.checkContactForDefect(contact);
//        missingPrefix.correctAllWithWorker("+49");
//        function sleep_done() {
//            console.log("sleep done.");
//            test.equal(missingPrefix.numDefects(), 0);
//            test.done();
//        }
//        sleep(1000, sleep_done);
//    }
};
