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
    secret: 'secret'
};

var launchUrl = '';
var activity;

getTinCanXML();

// http://stackoverflow.com/a/7951947
var parseXml;
if (typeof window.DOMParser != "undefined") {
    parseXml = function(xmlStr) {
        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
    };
} else if (typeof window.ActiveXObject != "undefined" &&
       new window.ActiveXObject("Microsoft.XMLDOM")) {
    parseXml = function(xmlStr) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    };
} else {
    throw new Error("No XML parser found");
}

function launchActivity()
{

    var launchLink = launchUrl;
    launchLink += '?endpoint=' + encodeURIComponent(config.endpoint);
    launchLink += '&auth=' + encodeURIComponent('Basic ' + TinCan.Utils.getBase64String(config.key + ':' + config.secret));

    launchLink += '&actor=' + encodeURIComponent(JSON.stringify(getActor().asVersion('1.0.0')));
    launchLink += '&registration=' + encodeURIComponent(TinCan.Utils.getUUID());

    sendStatement();
    window.open(launchLink);

    return false;
}

function sendStatement (){
    var lrs;

    try {
        lrs = new TinCan.LRS(
            {
                endpoint: config.endpoint,
                username: config.key,
                password: config.secret,
                allowFail: false
            }
        );
    }
    catch (ex) {
        console.log('Failed to setup LRS object: ' + ex);
    }

    var statement = new TinCan.Statement(
        {
            id: TinCan.Utils.getUUID(),
            actor: getActor(),
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/launched',
                display: {
                    en: 'launched'
                }
            },
            object: activity
        }
    );

    console.log(statement);
    lrs.saveStatement(
        statement,
        {
            callback: function (err, xhr) {
                if (err !== null) {
                    if (xhr !== null) {
                        console.log('Failed to save statement: ' + xhr.responseText + ' (' + xhr.status + ')');
                    }
                    console.log('Failed to save statement: ' + err);
                    alert('There was a problem communicating with the Learning Record Store. Your results may not be saved. Please check your internet connection and try again.');
                    return;
                }
                console.log("Statement saved");
            }
        }
    );
}

function readXML(filename, callback){
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/xml');
    xobj.open('GET', filename, true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == '200') {
            callback(xobj.responseText);
        }
    }
    xobj.send(null);
}

function getTinCanXML(){
    return readXML('tincan.xml', function(data){
        var xmlActivity = parseXml(data).getElementsByTagName('activity')[0];
        var activityCfg = {
            id: xmlActivity.id,
            definition: {
                name: {},
                description: {}
            }
        }
        for (var i = xmlActivity.getElementsByTagName('name').length - 1; i >= 0; i--) {
            var name = xmlActivity.getElementsByTagName('name')[i];
            var nameLang = name.attributes.hasOwnProperty('lang') ? name.attributes.lang.nodeValue : 'en';
            if (name.childNodes.length > 0){
                activityCfg.definition.name[nameLang] = name.childNodes[0].nodeValue;
            }
        }
        for (var i = xmlActivity.getElementsByTagName('description').length - 1; i >= 0; i--) {
            var description = xmlActivity.getElementsByTagName('description')[i];
            var descLang = description.attributes.hasOwnProperty('lang') ? description.attributes.lang.nodeValue : 'en';
            if (description.childNodes.length > 0){
                activityCfg.definition.description[descLang] = description.childNodes[0].nodeValue;
            }
        }

        activity = new TinCan.Activity(activityCfg);
        launchUrl = xmlActivity.getElementsByTagName('launch')[0].childNodes[0].nodeValue;
    });
}

function getActor(){
    return new TinCan.Agent ({'name': document.getElementById('name').value,'mbox': 'mailto:'+document.getElementById('email').value});
}

