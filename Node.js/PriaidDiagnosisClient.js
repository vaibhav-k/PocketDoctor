var http = require('http');
var https = require('https');
var Enum = require('enum');
var crypto = require('crypto');
var CryptoJS = require('crypto-js');

var Gender = new Enum(['Male', 'Female']);
var SelectorStatus = new Enum(['Man','Woman','Boy','Girl']);

function HttpsRequest(postheaders, callback){

    var optionspost = {
		host : 'https://sandbox-authservice.priaid.ch/login',
		method : 'POST',
		headers : postheaders
	};

    var req = https.request(optionspost, function(resp){
        resp.on('data', callback);
    });

    req.on('error',function(e){
        console.log("Request failed: " + e.message)
    });

    req.write('data\n');
    req.end();
}

function DiagnosisClient(username, password, authServiceUrl, language, healthServiceUrl) {
	this._handleRequiredArguments(username, password, authServiceUrl, healthServiceUrl, language)
	this._language = language;
	this._healthServiceUrl = healthServiceUrl;
	this._token = this._loadToken(username, password, authServiceUrl);
}

DiagnosisClient.prototype._loadToken = function(username, password, url){
	var uri = "https://sandbox-authservice.priaid.ch/login";
	var secret_key = password;
	var computedHash = CryptoJS.HmacMD5(uri, secret_key);
	var computedHashString = computedHash.toString(CryptoJS.enc.Base64); 

	var bearer_credentials = 'Bearer ' + username + ':' + computedHashString;
	var postheaders = {
		'Content-Type' : 'application/json',
		'Authorization' : bearer_credentials
	};
	
	var optionspost = {
		host : 'https://sandbox-authservice.priaid.ch/login',
		method : 'POST',
		headers : postheaders
	};
	 
	console.info('Options prepared:');
	console.info(optionspost);
	console.info('Do the POST call');

	HttpsRequest(postheaders, function(data) {
	    console.log(data);
	    var d = JSON.stringify(data);
	    return d;
	});

	/*https.request(optionspost, function(res) {
		console.log("statusCode: ", res.statusCode);
		res.on('data', function(d) {
			console.info('POST result:\n');
			process.stdout.write(d);
			console.info('\n\nPOST completed');
			return d;
		});
	});
	var request = require('request');
	request({
		url : "https://sandbox-authservice.priaid.ch/login",
		headers : { 
			"Authorization" : bearer_credentials 
		}  
	}, function (error, response, body) {
		console.log(error);
		console.log(body); 
	});
	var https = require('https');

	var options = {
	  host: 'www.google.com',
	  port: 443,
	  path: '/upload',
	  method: 'POST'
	};

	var req = https.request(optionspost, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  res.on('data', function (chunk) {
		console.log('BODY: ' + chunk);
	  });
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	// write data to request body
	req.write('data\n');
	req.write('data\n');
	req.end();*/
}

DiagnosisClient.prototype._handleRequiredArguments = function(username, password, authUrl, healthUrl, language){
		if (!username){
			throw Error("Argument missing: username");
		}

		if (!password){
			throw Error("Argument missing: username");
		}

		if (!authUrl){
			throw Error("Argument missing: authServiceUrl");
		}

		if (!healthUrl){
			throw Error("Argument missing: healthServiceUrl");
		}

		if (!language){
			throw Error("Argument missing: language");
		}
}

DiagnosisClient.prototype._loadFromWebService = function(action){
	var extraArgs = "token=" + this._token["Token"] + "&format=json&language=" + this._language;
	//var extraArgs = "token=" + this._token + "&format=json&language=" + this._language;
	if (action.indexOf('?')>-1){
		action += "&" + extraArgs;
	}
	else{
		action += "?" + extraArgs;
	}
	var url = this._healthServiceUrl + "/" + action;

	var optionsget = {
		host : 'sandbox-healthservice.priaid.ch',
		port : 443,
		path : '/' + action, // the rest of the url with parameters if needed
		method : 'GET' 
	};
	 
	console.info('Options prepared:');
	console.info(optionsget);
	console.info('Do the GET call');
	 
	var reqGet = https.request(optionsget, function(res) {
		console.log("statusCode: ", res.statusCode);
	//  console.log("headers: ", res.headers);
		res.on('data', function(d) {
			console.info('GET result:\n');
			process.stdout.write(d);
			console.info('\n\nCall completed');
		});
 
	});
	 
	reqGet.end();
	reqGet.on('error', function(e) {
		console.error(e);
	});
}

DiagnosisClient.prototype.loadSymptoms = function(){
	return this._loadFromWebService("symptoms");
}

DiagnosisClient.prototype.loadIssues = function(){
	return this._loadFromWebService("issues");
}

DiagnosisClient.prototype.loadIssueInfo = function(issueId){
	if (issueId.isInteger()){
		var issueId2 = issueId.toString();
	}
	var action = "issues/{0}/info".format(issueId2);
	return this._loadFromWebService(action);
}

DiagnosisClient.prototype.loadDiagnosis = function(selectedSymptoms, gender, yearOfBirth){
	if (!selectedSymptoms){
		throw Error("selectedSymptoms can not be empty");
	}
		
	var serializedSymptoms = JSON.stringify(selectedSymptoms);
	var action = "diagnosis?symptoms={0}&gender={1}&year_of_birth={2}".format(serializedSymptoms, gender.name, yearOfBirth);
	return this._loadFromWebService(action);
}

DiagnosisClient.prototype.loadSpecialisations = function(selectedSymptoms, gender, yearOfBirth){
	if (!selectedSymptoms){
		throw Error("selectedSymptoms can not be empty");
	}
		
	var serializedSymptoms = JSON.stringify(selectedSymptoms);
	var action = "diagnosis/specialisations?symptoms={0}&gender={1}&year_of_birth={2}".format(serializedSymptoms, gender.name, yearOfBirth);
	return this._loadFromWebService(action);
}
	
DiagnosisClient.prototype.loadBodyLocations = function(){
	return this._loadFromWebService("body/locations");
}

DiagnosisClient.prototype.loadBodySubLocations = function(bodyLocationId){
	var action = "body/locations/{0}".format(bodyLocationId);
	return this._loadFromWebService(action);
}

DiagnosisClient.prototype.loadSublocationSymptoms = function(locationId, selectedSelectorStatus){
	var action = "symptoms/{0}/{1}".format(locationId, selectedSelectorStatus.name);
	return this._loadFromWebService(action);
}

DiagnosisClient.prototype.loadProposedSymptoms = function(selectedSymptoms, gender, yearOfBirth){
	if (!selectedSymptoms){
		throw Error("selectedSymptoms can not be empty");
	}
		
	var serializedSymptoms = JSON.stringify(selectedSymptoms);
	var action = "symptoms/proposed?symptoms={0}&gender={1}&year_of_birth={2}".format(serializedSymptoms, gender.name, yearOfBirth);
	return this._loadFromWebService(action);
}

DiagnosisClient.prototype.loadRedFlag = function(symptomId){
	var action = "redflag?symptomId={0}".format(symptomId);
	return this._loadFromWebService(action);
}

module.exports = DiagnosisClient;