import requests
import hmac, hashlib
import base64
import json
import config
import sys
from enum import Enum

Gender = Enum('Gender', 'Male Female')

SelectorStatus = Enum('SelectorStatus', 'Man Woman Boy Girl')

def read_in():
    #lines = sys.stdin.readlines()
    lines = raw_input()
    return json.loads(lines)

def _loadToken(username, password, url):
    rawHashString = hmac.new(bytes(password), url.encode('utf-8')).digest()
    computedHashString = base64.b64encode(rawHashString).decode()

    bearer_credentials = username + ':' + computedHashString
    postHeaders = {
            'Authorization': 'Bearer {}'.format(bearer_credentials)
    }
    responsePost = requests.post(url, headers=postHeaders)

    data = json.loads(responsePost.text)
    return data

def _loadFromWebService(action, _token, language, healthUrl):
    extraArgs = "token=" + _token["Token"] + "&format=json&language=" + language
    if "?" not in action:
        action += "?" + extraArgs
    else:
        action += "&" + extraArgs

    url = healthUrl + "/" + action
    response = requests.get(url)

    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        print ("----------------------------------")
        print ("HTTPError: " + e.response.text )
        print ("----------------------------------")
        raise

    try:
        dataJson = response.json()
    except ValueError:
        raise requests.exceptions.RequestException(response=response)

    data = json.loads(response.text)
    return data

def loadDiagnosis(selectedSymptoms, gender, yearOfBirth, _token, language, healthUrl):
    serializedSymptoms = json.dumps(str(selectedSymptoms))
    action = "diagnosis?symptoms=[{0}]&gender={1}&year_of_birth={2}".format(serializedSymptoms, gender.name, yearOfBirth)
    return json.dumps(_loadFromWebService(action, _token, language, healthUrl))

#start process
if __name__ == '__main__':
    username = config.username
    password = config.password
    authUrl = config.priaid_authservice_url
    healthUrl = config.priaid_healthservice_url
    language = config.language
    _printRawOutput = config.pritnRawOutput
    _token = _loadToken(username, password, authUrl)
    lines = read_in()
    diagnosis = loadDiagnosis(lines, Gender.Female, 1988, _token, language, healthUrl)
    print diagnosis