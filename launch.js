/*
=============COPYRIGHT============
Launch Example
Copyright (C) 2016  Watershed Systems Inc.

License: Apache 2 https://www.apache.org/licenses/LICENSE-2.0

Based on a prototype for Tin Can API
Copyright (C) 2012  Andrew Downes
*/

var config = {
    endpoint: 'https://sandbox.watershedlrs.com/api/organizations/xxxx/lrs/',
    key: 'key',
    secret: 'secret',
    activity: {
        id: 'http://example.co',
        definition: {
            name: {
                en: 'Name'
            },
            description: {
                en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis nisl ante. Donec sit amet mauris imperdiet, condimentum nunc in, porttitor purus. Etiam ullamcorper justo eget magna interdum egestas. Proin quis sagittis mi. Sed lacinia sapien vel ex rutrum convallis. Nam non ullamcorper lorem.'
            },
            type: 'http://example.com'
        }
    },
    launchLink: {
        relative: true,
        url: 'index.html'
    }
};

function launchActivity()
{

    var launchLink = config.launchLink.url;
    launchLink += '?endpoint=' + config.endpoint;
    launchLink += '&auth=Basic ' + TinCan.Utils.getBase64String(config.key + ':' + config.secret);

    var actor = new TinCan.Agent ({'name': document.getElementById('name').value,'mbox': 'mailto:'+document.getElementById('email').value});
console.log(actor);
    launchLink += '&actor=' + JSON.stringify(actor.asVersion('1.0.0'));
    launchLink += '&registration=' + TinCan.Utils.getUUID();

    sendStatement (launchLink);

    return false;
}

function sendStatement (launchLink){
    if (config.launchLink.relative == true){
        absoluteLaunchLink = 'http://example.com/' + launchLink;
    }
    else {
        absoluteLaunchLink = launchLink;
    }
    var tincan = new TinCan({url: absoluteLaunchLink});

    var lrs = tincan.recordStores[0];

    var statement = new TinCan.Statement(
        {
            id: TinCan.Utils.getUUID(),
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/launched',
                display: {
                    en: 'launched'
                }
            },
            object: config.activity
        }
    );

    statement.actor = tincan.actor;

    console.log(statement);
    lrs.saveStatement(
        statement,
        {
            callback: function (err, xhr) {
                if (err !== null) {
                    if (xhr !== null) {
                        console.log("Failed to save statement: " + xhr.responseText + " (" + xhr.status + ")");
                    }
                    console.log("Failed to save statement: " + err);
                    alert('There was a problem communicating with the Learning Record Store. Your results may not be saved. Please check your internet connection and re-launch the game.');
                    return;
                }
                console.log("Statement saved");
                window.open(launchLink);
            }
        }
    );
}
