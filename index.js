'use strict';

var AWS = require('aws-sdk'),
documentClient = new AWS.DynamoDB.DocumentClient();

// Import the appropriate service and chosen wrappers
const {
    dialogflow,
    BasicCard,
    Image,
    Button,
} = require('actions-on-google')

// Create an app instance
const app = dialogflow();

app.intent('earthquake', (conv, { jishin }) => {
    var prefs = null;
    var oid_old = "";
    if(jishin != null) {
        prefs = Number(jishin);
    }
    
// not yet impliment
//    if (body.result != undefined && body.result.contexts != undefined) {
//        for (var p in body.result.contexts) {
//            var c = body.result.contexts[p];
//            if (c.parameters != undefined && c.parameters.oid != undefined) {
//                oid_old = c.parameters.oid;
//            }
//        }
//    }
    if (prefs == null || prefs == 0) {
        const message = "すみません、見つかりませんでした。";
	return conv.ask(message);
    }
    const params = {
        TableName: "earthquake",
        Key:{
            "prefecture": prefs
        }
    };
    return new Promise((resolve, reject) => {
	documentClient.get(params, function(err, data) {
            if (err) {
		console.error('Unable to get item. Error JSON:', JSON.stringify(err, null, 2));
		reject(err);
            }
            var result = data.Item.info.s;
            var oid = data.Item.info.oid;
            if (oid != "ffffffffffff" && oid == oid_old) {
		var vs = result.match(/マグニチュード[^、]+、(\S+)、 最大震度は[^。]+。(\S+)/);
		if (vs != undefined) {
                    result = "同じ地震が、" + vs[1] + "でした。" + vs[2];
		}
            }
            if (oid != "ffffffffffff") {
		// not yet impliment to memory latest oid
		resolve({
		    simple: result,
		    basiccard: new BasicCard({
			title: "P2P地震情報より",
			subtitle: "P2P地震情報より",
			image: new Image({
		            url: "https://www.p2pquake.net/img/api/gen/" + oid + ".png",
		            alt: "Image alternate text"
			}),
			buttons: new Button({
			    title: "P2P地震情報へ",
			    url: "https://www.p2pquake.net/app/web/",
			}),
			display: 'CROPPED'
		    })
		});
            }
	    resolve({
		simple: result,
		basiccard: null,
	    });
	});
    }).then(result => {
	conv.ask(result.simple);
	if (result.basiccard != null) {
	    conv.ask(result.basiccard);
	}
    }).catch(err => {
	conv.close(error);
    });
});

exports.handler = app;
