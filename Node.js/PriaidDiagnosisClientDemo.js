var config = require("./config.json");
var PriaidDiagnosisClient = require("./PriaidDiagnosisClient");
var format = require('string-format');

function PriaidDiagnosisClientDemo(){
    var username = config.username;
    var password = config.password;
    var authUrl = config.priaid_authservice_url;
    var healthUrl = config.priaid_healthservice_url;
    var language = config.language;
    this._printRawOutput = config.pritnRawOutput;
    this._diagnosisClient = new PriaidDiagnosisClient(username, password, authUrl, language, healthUrl)
}

PriaidDiagnosisClientDemo.prototype.simulate = function(){
    var selectedLocationID = this._loadBodyLocations();
    var selectedSublocationID = sethislf._loadBodySublocations(selectedLocationID);
    var selectedSymptoms = this._loadSublocationSymptoms(selectedSublocationID);
    var diagnosis = this._loadDiagnosis(selectedSymptoms);

    this._loadSpecialisations(selectedSymptoms);

    diagnosis.forEach(function (issueId){
        this._loadIssueInfo(issueId);
    })

    this._loadProposedSymptoms(selectedSymptoms);
}

PriaidDiagnosisClientDemo.prototype._writeHeaderMessage = function(message){
    console.log("---------------------------------------------");
    console.log(message);
    console.log("---------------------------------------------");
}

PriaidDiagnosisClientDemo.prototype._writeRawOutput = function(methodName, data){
    console.log("");
    if (this._printRawOutput){
        console.log("+++++++++++++++++++++++++++++++++++++++++++++");
        console.log("Response from method " + methodName);
        console.log(JSON.stringify(data));
        console.log("+++++++++++++++++++++++++++++++++++++++++++++");
    }
}
    
PriaidDiagnosisClientDemo.prototype._loadBodyLocations = function(){
    var bodyLocations = this._diagnosisClient.loadBodyLocations();
    this._writeRawOutput("loadBodyLocations", bodyLocations);
        
    if (!bodyLocations){
        throw Error("Empty body locations results");
    }
        
    this._writeHeaderMessage("Body locations:");
    bodyLocations.forEach(function (bodyLocation){
        console.log("{0} ({1})".format(bodyLocation["Name"], bodyLocation["ID"]));
    })

    var randomLocation = Math.random().choice(bodyLocations);
    this._writeHeaderMessage("Sublocations for randomly selected location {0}".format(randomLocation["Name"]));
    return randomLocation["ID"];
}

PriaidDiagnosisClientDemo.prototype._loadBodySublocations = function(locId){
    var bodySublocations = this._diagnosisClient.loadBodySubLocations(locId);
    this._writeRawOutput("loadBodySubLocations", bodySublocations);

    if (!bodySublocations){
        throw Error("Empty body sublocations results");
    }
    
    bodySublocations.forEach(function (bodySublocation){
        console.log("{0} ({1})".format(bodySublocation["Name"], bodySublocation["ID"]));
    })

    var randomSublocation = Math.random().choice(bodySublocations);
    this._writeHeaderMessage("Sublocations for randomly selected location {0}".format(randomSublocation["Name"]));
    return randomSublocation["ID"];
}

PriaidDiagnosisClientDemo.prototype._loadSublocationSymptoms = function(subLocId){
    symptoms = this._diagnosisClient.loadSublocationSymptoms(subLocId, PriaidDiagnosisClient.SelectorStatus.Man)
    this._writeRawOutput("loadSublocationSymptoms", symptoms)

    if (!symptoms){
        throw Error("Empty body sublocations symptoms results");
    }

    this._writeHeaderMessage("Body sublocations symptoms:");

    symptoms.forEach(function (symptom) {
        console.log(symptom["Name"]);
    })

    var randomSymptom = Math.random().choice(symptoms);

    this._writeHeaderMessage("Randomly selected symptom: {0}".format(randomSymptom["Name"]));

    this._loadRedFlag(randomSymptom);

    var selectedSymptoms = [randomSymptom];
    return selectedSymptoms;
}

PriaidDiagnosisClientDemo.prototype._loadDiagnosis = function(selectedSymptoms){
    this._writeHeaderMessage("Diagnosis");
    var selectedSymptomsIds = [];

    selectedSymptoms.forEach(function (symptom) {
        selectedSymptomsIds.append(symptom["ID"]);
    })
            
    diagnosis = this._diagnosisClient.loadDiagnosis(selectedSymptomsIds, PriaidDiagnosisClient.Gender.Male, 1988)
    this._writeRawOutput("loadDiagnosis", diagnosis)
        
    if (!diagnosis){
        this._writeHeaderMessage("No diagnosis results for symptom {0}".format(selectedSymptoms[0]["Name"]))
    }

    diagnosis.forEach(function(d) {
        var specialisations = [];
        d["Specialisation"].forEach(function(specialisation) {
            specialisations.append(specialisation["Name"]);
        })
    })
        console.log("{0} - {1}% \nICD: {2}{3}\nSpecialisations : {4}\n".format(d["Issue"]["Name"], d["Issue"]["Accuracy"], d["Issue"]["Icd"], d["Issue"]["IcdName"], ",",specialisations));//.join(x for x in specialisations)))

    var diagnosisIds = [];
    diagnosis.forEach(function(diagnose) {
        diagnosisIds.append(diagnose["Issue"]["ID"]);
    })

    return diagnosisIds;
}

PriaidDiagnosisClientDemo.prototype._loadSpecialisations = function(selectedSymptoms){
    this._writeHeaderMessage("Specialisations");
    var selectedSymptomsIds = [];
    selectedSymptoms.forEach(function (symptom) {
        selectedSymptomsIds.append(symptom["ID"]);
    })
            
    var specialisations = this._diagnosisClient.loadSpecialisations(selectedSymptomsIds, PriaidDiagnosisClient.Gender.Male, 1988);
    this._writeRawOutput("loadSpecialisations", specialisations);
        
    if (!specialisations){
        this._writeHeaderMessage("No specialisations for symptom {0}".format(selectedSymptoms[0]["Name"]));
    }
                                                                                                     
    specialisations.forEach(function (specialisation) {
        console.log("{0} - {1}%".format(specialisation["Name"], specialisation["Accuracy"]));
    })
}

PriaidDiagnosisClientDemo.prototype._loadRedFlag = function(selectedSymptom){
    var redFlag = "Symptom {0} has no red flag".format(selectedSymptom["Name"]);
            
    if (selectedSymptom["HasRedFlag"]){
        redFlag = this._diagnosisClient.loadRedFlag(selectedSymptom["ID"])
        this._writeRawOutput("loadRedFlag", redFlag)
    }

    this._writeHeaderMessage(redFlag);
}

PriaidDiagnosisClientDemo.prototype._loadIssueInfo = function(issueId){
    var issueInfo = thsi._diagnosisClient.loadIssueInfo(issueId);
    this._writeRawOutput("issueInfo", issueInfo);
        
    this._writeHeaderMessage("Issue info");
    console.log("Name: {0}".format(issueInfo["Name"]).encode("utf-8"));
    console.log("Professional Name: {0}".format(issueInfo["ProfName"]).encode("utf-8"));
    console.log("Synonyms: {0}".format(issueInfo["Synonyms"]).encode("utf-8"));
    console.log("Short Description: {0}".format(issueInfo["DescriptionShort"]).encode("utf-8"));
    console.log("Description: {0}".format(issueInfo["Description"]).encode("utf-8"));
    console.log("Medical Condition: {0}".format(issueInfo["MedicalCondition"]).encode("utf-8"));
    console.log("Treatment Description: {0}".format(issueInfo["TreatmentDescription"]).encode("utf-8"));
    console.log("Possible symptoms: {0} \n\n".format(issueInfo["PossibleSymptoms"]).encode("utf-8"));
}

PriaidDiagnosisClientDemo.prototype._loadProposedSymptoms = function(selectedSymptoms){
    var selectedSymptomsIds = [];
    selectedSymptoms.forEach(function (symptom) {
        selectedSymptomsIds.append(symptom["ID"]);
    })
        
    proposedSymptoms = this._diagnosisClient.loadProposedSymptoms(selectedSymptomsIds, PriaidDiagnosisClient.Gender.Male, 1988);
    this._writeRawOutput("proposedSymptoms", proposedSymptoms);

    if (!proposedSymptoms){
        self._writeHeaderMessage("No proposed symptoms for selected symptom {0}".format(selectedSymptoms[0]["Name"]));
        return;
    }

    var proposedSymptomsIds = [];
    proposedSymptoms.forEach(function (proposeSymptom) {
        proposedSymptomsIds.append(proposeSymptom["ID"]);
    })
            
    this._writeHeaderMessage("Proposed symptoms: {0}".format("," + proposedSymptomsIds));
}

var diagnosisClientDemo = new PriaidDiagnosisClientDemo();
diagnosisClientDemo.simulate();
