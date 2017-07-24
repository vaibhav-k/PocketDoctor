import PriaidDiagnosisClient
import random
import config
import sys
import json
import re

class PriaidDiagnosisClientDemo:
    def __init__(self):
        username = config.username
        password = config.password
        authUrl = config.priaid_authservice_url
        healthUrl = config.priaid_healthservice_url
        language = config.language
        self._printRawOutput = config.pritnRawOutput

        self._diagnosisClient = PriaidDiagnosisClient.DiagnosisClient(username, password, authUrl, language, healthUrl)


    def simulate(self):
        # Load issues
        issues = self._loadIssues()

        # Load symptoms
        symptoms = self._loadSymptoms()

        # Load body locations
        selectedLocationID = self._loadBodyLocations()

        # Load body sublocations
        selectedSublocationID = self._loadBodySublocations(selectedLocationID)

        # Load body sublocations symptoms
        selectedSymptoms = self._loadSublocationSymptoms(selectedSublocationID)

        # Load diagnosis
        #self._loadDiagnosis(selectedSymptoms)

        # Load specialisations
        #self._loadSpecialisations(selectedSymptoms)

        # Load issue info
        #for issueId in diagnosis:
        #    self._loadIssueInfo(issueId)

        # Load proposed symptoms
        self._loadProposedSymptoms(selectedSymptoms)

    def _loadIssues(self):
        issues = self._diagnosisClient.loadIssues()
        self._writeRawOutput("loadIssues", issues)

        if not issues:
            raise Exception("Empty issues results")

        self._writeHeaderMessage("Issues:")
        for issue in issues:
            print("{0} ({1})".format(issue["Name"], issue["ID"]))

        return issues  

    def _loadSymptoms(self):
        symptoms = self._diagnosisClient.loadSymptoms()
        self._writeRawOutput("loadSymptoms", symptoms)

        if not symptoms:
            raise Exception("Empty symptoms results")

        self._writeHeaderMessage("Symptoms:")
        for symptom in symptoms:
            print("{0} ({1})".format(symptom["Name"], symptom["ID"]))

        return symptoms 

    def _writeHeaderMessage(self, message):
        print("---------------------------------------------")
        print(message)
        print("---------------------------------------------")


    def _writeRawOutput(self, methodName, data):
        print("")
        if self._printRawOutput: 
            print("+++++++++++++++++++++++++++++++++++++++++++++")
            print("Response from method {0}: ".format(methodName))
            print(json.dumps(data))
            print("+++++++++++++++++++++++++++++++++++++++++++++")

    
    def _loadBodyLocations(self):
        bodyLocations = self._diagnosisClient.loadBodyLocations()
        self._writeRawOutput("loadBodyLocations", bodyLocations)
        
        if not bodyLocations:
            raise Exception("Empty body locations results")
        
        self._writeHeaderMessage("Body locations:")    
        for bodyLocation in bodyLocations:
            print("{0} ({1})".format(bodyLocation["Name"], bodyLocation["ID"]))

        return bodyLocations


    def _loadBodySublocations(self, locId):
        subids = []
        for a in locId:
            bodySublocations = self._diagnosisClient.loadBodySubLocations(a["ID"])
            self._writeRawOutput("loadBodySubLocations", bodySublocations)

            if not bodySublocations:
                print("Empty body sublocations results")
        
            if bodySublocations:
                for bodySublocation in bodySublocations:
                    print("{0} ({1})".format(bodySublocation["Name"], bodySublocation["ID"]))
                    subids.append(bodySublocation["ID"])
        return subids

    def _loadSublocationSymptoms(self, subLocId):
        total = []
        for a in subLocId:
            symptoms = self._diagnosisClient.loadSublocationSymptoms(a, PriaidDiagnosisClient.SelectorStatus.Man)
            self._writeRawOutput("loadSublocationSymptoms", symptoms)

            if not symptoms:
                print("Empty body sublocations symptoms results")

            self._writeHeaderMessage("Body sublocations symptoms:")
            total.append(symptoms)

            for symptom in symptoms:
                print(symptom["Name"])
                self._loadRedFlag(symptom)
        return total


    def _loadDiagnosis(self, selectedSymptoms):
        self._writeHeaderMessage("Diagnosis")
        selectedSymptomsIds = []
        for ss in selectedSymptoms:
            for symptom in ss:
                selectedSymptomsIds.append(str(symptom["ID"]))
                
        diagnosis = self._diagnosisClient.loadDiagnosis(selectedSymptomsIds, PriaidDiagnosisClient.Gender.Male, 1988)
        self._writeRawOutput("loadDiagnosis", diagnosis)


    def _loadSpecialisations(self, selectedSymptoms):
        self._writeHeaderMessage("Specialisations")
        selectedSymptomsIds = []
        for ss in selectedSymptoms:
            for symptom in ss:
                selectedSymptomsIds.append(str(symptom["ID"]))
            
        specialisations = self._diagnosisClient.loadSpecialisations(selectedSymptomsIds, PriaidDiagnosisClient.Gender.Male, 1988)
        self._writeRawOutput("loadSpecialisations", specialisations)


    def _loadRedFlag(self, selectedSymptom):
        redFlag = "Symptom {0} has no red flag".format(selectedSymptom["Name"])
            
        if selectedSymptom["HasRedFlag"]:
            redFlag = self._diagnosisClient.loadRedFlag(selectedSymptom["ID"])
            self._writeRawOutput("loadRedFlag", redFlag)

        self._writeHeaderMessage(redFlag);


    def _loadIssueInfo(self, issueId):
        issueInfo = self._diagnosisClient.loadIssueInfo(issueId)
        self._writeRawOutput("issueInfo", issueInfo)
        
        self._writeHeaderMessage("Issue info")
        print("Name: {0}".format(issueInfo["Name"]).encode("utf-8"))
        print("Professional Name: {0}".format(issueInfo["ProfName"]).encode("utf-8"))
        print("Synonyms: {0}".format(issueInfo["Synonyms"]).encode("utf-8"))
        print("Short Description: {0}".format(issueInfo["DescriptionShort"]).encode("utf-8"))
        print("Description: {0}".format(issueInfo["Description"]).encode("utf-8"))
        print("Medical Condition: {0}".format(issueInfo["MedicalCondition"]).encode("utf-8"))
        print("Treatment Description: {0}".format(issueInfo["TreatmentDescription"]).encode("utf-8"))
        print("Possible symptoms: {0} \n\n".format(issueInfo["PossibleSymptoms"]).encode("utf-8"))


    def _loadProposedSymptoms(self, selectedSymptoms):
        selectedSymptomsIds = []
        for ss in selectedSymptoms:
            for symptom in ss:
                selectedSymptomsIds.append(str(symptom["ID"]))
        
        proposedSymptoms = self._diagnosisClient.loadProposedSymptoms(selectedSymptomsIds, PriaidDiagnosisClient.Gender.Male, 1988)
        self._writeRawOutput("proposedSymptoms", proposedSymptoms)


diagnosisClientDemo = PriaidDiagnosisClientDemo()
diagnosisClientDemo.simulate()
