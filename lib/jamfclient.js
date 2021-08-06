var axios = require('axios');
var _ = require('lodash');
var promises = require('bluebird');

var validFormats = ['json', 'xml'];

function JamfApiClient(config) {
    if (!config) {
        throw new TypeError('Missing config');
    }
    if (!config.user) {
        throw new TypeError('Missing username in client configuration');
    }
    if (!config.password) {
        throw new TypeError('Missing password in client configuration');
    }
    if (!config.jamfUrl) {
        throw new TypeError('Missing Jamf API URL in client configuration');
    }
    if (!config.format) {
        throw new TypeError('Missing format parameter, please specify xml or json');
    }
    if (!_.includes(validFormats, config.format)) {
        throw new TypeError('Bad format parameter, please specify xml or json');
    }

    this.config = {
        user: config.user,
        password: config.password,
        jamfUrl: config.jamfUrl,
        format: config.format
    }
}

var successCodes = [200, 201];

JamfApiClient.prototype = {
    get: function(path) {
        var promise = new Promise((resolve, reject) => {
          var promises = [];

          var dataFormat = this.config.format;

          var requestOptions = {
              method: 'GET',
              url: this.config.jamfUrl + '/JSSResource' + path,
              auth: {
                  username: this.config.user,
                  password: this.config.password,
                  sendImmediately: false
              }
          };

          if (dataFormat === 'json') {
              requestOptions.headers = {
                  'Accept': 'application/json'
              };
          }

          if (dataFormat === 'xml') {
              requestOptions.headers = {
                  'Accept': 'text/xml'
              };
          }

          promises.push(axios(requestOptions));

          Promise.all(promises).then((results) => {
              var response = results[0];

              if (response && !_.includes(successCodes, response.status)) {
                  reject({ error: { code: response.status, message: response.status + ' ' + response.statusText } });
              }

              var body = response.data;

              // axios parses the body as JSON if headers indicate it is so
              resolve(body);
          });
        });

        return promise;
    },
    post: function(path, xml) {
        var promise = new Promise((resolve, reject) => {
          var promises = [];

          var requestOptions = {
              method: 'POST',
              url: this.config.jamfUrl + '/JSSResource' + path,
              auth: {
                  username: this.config.user,
                  password: this.config.password,
                  sendImmediately: false
              }
          }

          if (xml !== '') {
              requestOptions.data = xml; // Needed so axios calculates Content-Lentgh
              requestOptions.body = xml;
          }

          promises.push(axios(requestOptions));

          Promise.all(promises).then((results) => {
              var response = results[0];

              if (response && !_.includes(successCodes, response.status)) {
                  reject({ error: { code: response.status, message: response.status + ' ' + response.statusText } });
              }

              var body = response.data;

              // axios parses the body as JSON if headers indicate it is so
              resolve(body);
          });
        });

        return promise;
    },
    put: function(path, xml) {
        var promise = new Promise((resolve, reject) => {
          var promises = [];

          var requestOptions = {
              method: 'PUT',
              url: this.config.jamfUrl + '/JSSResource' + path,
              auth: {
                  username: this.config.user,
                  password: this.config.password,
                  sendImmediately: false
              },
              headers: {
                'Accept': '*/*',
                'Content-Type': 'application/xml'
              },
              data: xml, // Needed so axios calculates Content-Lentgh
              body: xml
          };

          promises.push(axios(requestOptions));

          Promise.all(promises).then((results) => {
              var response = results[0];

              if (response && !_.includes(successCodes, response.status)) {
                  reject({ error: { code: response.status, message: response.status + ' ' + response.statusText } });
              }

              var body = response.data;

              // axios parses the body as JSON if headers indicate it is so
              resolve(body);
          });
        });

        return promise;
    }
}

module.exports = JamfApiClient;