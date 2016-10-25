import qs from 'qs';
import request from 'superagent';

const AUTH_URL = 'https://auth.getmondo.co.uk/';
const API_URL = 'https://api.monzo.com/';

class MonzoApi {
    set clientId(value) {
        this._clientId = value;
    }

    get clientId() {
        return this._clientId;
    }

    set clientSecret(value) {
        this._clientSecret = value;
    }

    get clientSecret() {
        return this._clientSecret;
    }

    set redirectUrl(value) {
        this._redirectUrl = value;
    }

    get redirectUrl() {
        return this._redirectUrl;
    }

    get code() {
        return this._code;
    }

    get stateToken() {
        this._stateToken = Math.random().toString(36).replace(/[^a-z]+/g, '');
        return this._stateToken;
    }

    set accessToken(value) {
        this._accessToken = value;
    }

    get accessToken() {
        return this._accessToken;
    }

    set refreshToken(value) {
        this._refreshToken = value;
    }

    get refreshToken() {
        this._refreshToken;
    }

    get authorizationUrl() {
        const data = {
            client_id: this.clientId,
            redirect_uri: this.redirectUrl,
            response_type: 'code',
            state: this.stateToken
        };
        return `${AUTH_URL}?${qs.stringify(data)}`;
    }

    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    authenticate(code, stateToken) {
        return new Promise((resolve, reject) => {
            if (stateToken !== this._stateToken) {
                throw new Error('The provided stateToken differs from the original one.');
            }
            const data = {
                grant_type: 'authorization_code',
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUrl,
                code
            };
            this._code = code;

            this.makeRequest('POST', 'oauth2/token', data, false)
                .then((res) => {
                    if (res.access_token) {
                        this.accessToken = res.access_token;
                    }
                    if (res.refresh_token) {
                        this.refreshToken = res.refresh_token;
                    }
                    resolve(res);
                })
                .catch(reject);
        });
    }

    refreshAccess() {
        return new Promise((resolve, reject) => {
            const data = {
                grant_type: 'refresh_token',
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: this.refreshToken
            };

            this.makeRequest('POST', 'oauth2/token', data, false)
                .then((res) => {
                    if (res.access_token) {
                        this.accessToken = res.access_token;
                    }
                    if (res.refresh_token) {
                        this.refreshToken = res.refresh_token;
                    }
                    resolve(res);
                })
                .catch(reject);
        });
    }

    ping() {
        return this.makeRequest('GET', 'ping/whoami');
    }

    makeRequest(requestType, requestEndpoint, requestData, useBearer = true) {
        return new Promise((resolve, reject) => {
            let req;
            const url = `${API_URL}${requestEndpoint}`;
            if (requestType === 'GET') {
                req = request.get(url);
                req.set('Content-type', 'application/json');
            }
            if (requestType === 'POST') {
                req = request.post(url);
                req.set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
            }
            if (useBearer) {
                req.set('Authorization', `Bearer ${this.accessToken}`);
            }
            if (requestData) {
                req.send(requestData);
            }
            req.end((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.body);
                }
            });
        });
    }
}

export default MonzoApi;
