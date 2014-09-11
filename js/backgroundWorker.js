try {

    this.onmessage = function(oEvent) {
        console.log("in Worker");
        var command = oEvent.data.command;
        var result = JSON.stringify(command);
        console.log(result);
        if (command === "test") {
            console.log("test");
        } else {
            try {
                console.log("calling " + command);
                var object = oEvent.data.object;
                console.log("on " + JSON.stringify(object));
                var params = oEvent.data.params;
                console.log("with " + params);
                console.log("fn " + object[command]);

                result = object[command](params);
            } catch (ex) {
                console.log("Error" + ex);
            }
        }
        postMessage({
            "result" : result,
        });
    };
} catch (ex) {
    console.log(ex);
}