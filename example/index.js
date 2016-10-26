var MonzoApi = require('../dist/index');
var monzoApi;
var clientId;
var clientSecret;
var code;

process.argv.forEach((val, index) => {
  if (val === '-i' || val === '--clientId') {
      clientId = process.argv[index + 1];
  }
  if (val === '-s' || val === '--clientSecret') {
      clientSecret = process.argv[index + 1];
  }
  if (val === '-c' || val === '--code') {
      code = process.argv[index + 1];
  }
});

if (!clientId || !clientSecret) {
    console.error('You need to specify a clientId and a clientSecret. eg node test --clientId idHere --clientSecret secretHere');
    process.exit(1);
}

monzoApi = new MonzoApi(clientId, clientSecret);
monzoApi.redirectUrl = 'http://127.0.0.1/monzo-validation';

if (!code) {
    console.log('Go to', monzoApi.authorizationUrl, 'to authenticate and run the test again with --code');
    process.exit(0);
}

monzoApi._stateToken = 'exampleStateToken';
monzoApi.authenticate(code, 'exampleStateToken')
        .then(function() {
            return monzoApi.ping();
        })
        .then(function() {
            return monzoApi.accounts();
        })
        .then(function(res) {
            var acc = res.accounts[0].id;
            return monzoApi.feedItem(acc, 'http://google.com', 'basic', {
                title: 'My custom item',
                image_url: 'http://image.flaticon.com/teams/1-freepik.jpg',
                background_color: '#FCF1EE',
                body_color: '#FCF1EE',
                title_color: '#333',
                body: 'Some body text to display'
            });
        })
        .then(function(res) {
            console.log(res);
        })
        .catch(function(err) {
            console.error(err);
        });
