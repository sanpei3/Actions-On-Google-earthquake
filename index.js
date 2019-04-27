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

function earthquake(conv,  jishin)  {
    var prefs = null;
    var oid_old = "";
    if(jishin != null) {
        prefs = Number(jishin);
    }
    if (conv.data.oid != undefined) {
	oid_old = conv.data.oid;
    }
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
	    result = result + "道州地方、都道府県、市区町村で質問ください。"
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
		    oid: oid,
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
	    });
	});
    }).then(result => {
	conv.ask(result.simple);
	if (result.oid != undefined) {
	    conv.data.oid = result.oid;
	}
	if (result.basiccard != undefined) {
	    conv.ask(result.basiccard);
	}
    }).catch(err => {
	conv.close(error);
    });
};
    
app.intent('earthquake', (conv, { jishin }) => {
    return earthquake(conv,  jishin);
});

app.intent('over_earthquake', (conv, { jishin }) => {
    return earthquake(conv,  jishin);
});

app.intent('Implicit Invocation', (conv, { jishin }) => {
    return earthquake(conv,  jishin);
});


exports.handler = app;
