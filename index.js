var AWS = require('aws-sdk'),
documentClient = new AWS.DynamoDB.DocumentClient();

const build_callback_data = (message) => {
    const json = {
        speech: message,
        displayText: message
    };

    return JSON.stringify(json);
};

exports.handler = (event, context, callback) => {
    var body = "";
    var prefs = null;
    if(event.body != null) {
        body = JSON.parse(event.body);
        prefs = Number(body.result.parameters.jishin);
    }

    if (prefs == null || prefs == 0 ||event.body == null) {
        const message = "すいません、見つかりませんでした。";
        callback(null, {
            "statusCode": 200, 
            "body": build_callback_data(message)
        });
        return;
    }
    const params = {
        TableName: "earthquake",
        Key:{
            "prefecture": prefs
        }
    };

    documentClient.get(params, function(err, data) {
        if (err) {
            console.error('Unable to get item. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
            return;
        }
        var result = data.Item.info.s;
        callback(null, {
            "statusCode": 200, 
            "body": build_callback_data(result)
        })
    });
};
