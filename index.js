'use strict';

var AWS = require('aws-sdk'),
documentClient = new AWS.DynamoDB.DocumentClient();

const build_callback_data = (message) => {
    const json = {
        speech: message,
        displayText: message
    };

    return JSON.stringify(json);
};

const build_callback_data_withoid = (message, oid) => {
    const json = {
        speech: message,
        displayText: message,
        contextOut: [
            {
                name: "remember_this",
                lifespan: 5,
                parameters: {
                    oid: oid,
                }
            }
        ]
    };

    return JSON.stringify(json);
};

exports.handler = (event, context, callback) => {
    var body = "";
    var prefs = null;
    var oid_old = "";
    if(event.body != null) {
        body = JSON.parse(event.body);
        prefs = Number(body.result.parameters.jishin);
    }

    if (body.result != undefined && body.result.contexts != undefined) {
        for (var p in body.result.contexts) {
            var c = body.result.contexts[p];
            if (c.parameters != undefined && c.parameters.oid != undefined) {
                oid_old = c.parameters.oid;
            }
        }
    }
    if (prefs == null || prefs == 0 ||event.body == null) {
        const message = "すみません、見つかりませんでした。";
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
        var oid = data.Item.info.oid;
        if (oid != "ffffffffffff" && oid == oid_old) {
            var vs = result.match(/マグニチュード[^、]+、(\S+)、 最大震度は[^。]+。(\S+)/);
            if (vs != undefined) {
                result = "同じ地震が、" + vs[1] + "でした。" + vs[2];
            }
        }
        callback(null, {
            "statusCode": 200, 
            "body": build_callback_data_withoid(result, oid)
        })
    });
};