import qs from 'qs';
import request from 'superagent';

const AUTH_URL = 'https://auth.getmondo.co.uk/';
const API_URL = 'https://api.monzo.com/';

const REQUEST_TO_METHOD = {
    GET: 'get',
    POST: 'post',
    PATCH: 'patch',
    DELETE: 'del'
};

/** Class that contains the api */
class MonzoApi {
    /**
     * Set the clientId value.
     * @param {string} value - The clientId value.
     */
    set clientId(value) {
        this._clientId = value;
    }

    /**
     * Get the clientId value.
     * @return {string} The clientId value.
     */
    get clientId() {
        return this._clientId;
    }

    /**
     * Set the clientSecret value.
     * @param {string} value - The clientSecret value.
     */
    set clientSecret(value) {
        this._clientSecret = value;
    }

    /**
     * Get the clientSecret value.
     * @return {string} The clientSecret value.
     */
    get clientSecret() {
        return this._clientSecret;
    }

    /**
     * Set the redirectUrl value.
     * @param {string} value - The redirectUrl value.
     */
    set redirectUrl(value) {
        this._redirectUrl = value;
    }

    /**
     * Get the redirectUrl value.
     * @return {string} The redirectUrl value.
     */
    get redirectUrl() {
        return this._redirectUrl;
    }

    /**
     * Set the refreshToken value.
     * @param {string} value - The refreshToken value.
     */
    set refreshToken(value) {
        this._refreshToken = value;
    }

    /**
     * Get the refreshToken value.
     * @return {string} The refreshToken value.
     */
    get refreshToken() {
        this._refreshToken;
    }

    /**
     * Set the accessToken value.
     * @param {string} value - The accessToken value.
     */
    set accessToken(value) {
        this._accessToken = value;
    }

    /**
     * Get the accessToken value.
     * @return {string} The accessToken value.
     */
    get accessToken() {
        return this._accessToken;
    }

    /**
     * Get the code value. It will be set when authenticate method gets called
     * @return {string} The code value.
     */
    get code() {
        return this._code;
    }

    /**
     * Get the stateToken value.
     * Value that will be matched against the one provided when a user authenticates.
     * The values must match otherwise the authentication won't proceed
     * @return {string} The stateToken value.
     */
    get stateToken() {
        this._stateToken = Math.random().toString(36).replace(/[^a-z]+/g, '');
        return this._stateToken;
    }

    /**
     * Get the authorizationUrl value.
     * The user needs to be redirected to this url in order to authenticate
     * @return {string} The authorizationUrl value.
     */
    get authorizationUrl() {
        const data = {
            client_id: this.clientId,
            redirect_uri: this.redirectUrl,
            response_type: 'code',
            state: this.stateToken
        };
        return `${AUTH_URL}?${qs.stringify(data)}`;
    }

    /**
     * Create a monzo api instance.
     * @param {string} clientId - The client id value.
     * @param {string} clientSecret - The client secret value.
     */
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    /**
     * Authenticate the user given the code and the stateToken
     * found in the query string of the redirectUrl
     * @param {string} code - The code value.
     * @param {string} stateToken - The state token value.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
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

    /**
     * Refreshes the user access token using the refresh one
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
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

    /**
     * Pings the API to check whether everything is correct
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    ping() {
        return this.makeRequest('GET', 'ping/whoami');
    }

    /**
     * Returns the accounts for the authenticated user
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    accounts() {
        return this.makeRequest('GET', 'accounts');
    }

    /**
     * Reads the balance
     * @param {string} accountId - The account id to check the balance in.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    balance(accountId) {
        return this.makeRequest('GET', 'balance', { account_id: accountId });
    }

    /**
     * Returns an individual transaction, fetched by its id.
     * @param {string} transactionId - The transaction id to check details in
     * @param {boolean} [expanded=true] - Whether the details for merchant are expanded or not
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    transaction(transactionId, expanded = true) {
        const query = {};
        if (expanded) {
            query['expand[]'] = 'merchant';
        }
        return this.makeRequest('GET', `transactions/${transactionId}?${qs.stringify(query)}`);
    }

    /**
     * List transactions
     * @param {string} accountId - The account id to check transactions in
     * @param {boolean} [expanded=false] - Whether the details for merchant are expanded or not
     * @param {object} [query={}] - Can be used to add pagination. https://monzo.com/docs/#pagination
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    transactions(accountId, expanded = false, query = {}) {
        if (expanded) {
            query['expand[]'] = 'merchant';
        }
        return this.makeRequest('GET', `transactions?${qs.stringify(query)}`);
    }

    /**
     * Annotate transaction.
     * You may store your own key-value annotations against a transaction in its metadata.
     * @param {string} transactionId - The transaction id to add the annotation
     * @param {object} metadata - The key values pairs to store in the metadata.
     *                            Include each key you would like to modify. To delete a key, set its value to an empty string
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    annotate(transactionId, metadata = {}) {
        const formData = {};
        Object.keys(metadata).forEach((k) => {
            formData[`metadata[${k}]`] = metadata[k];
        });
        return this.makeRequest('PATCH', `transactions/${transactionId}`, formData);
    }

    /**
     * Creates a new feed item on the user’s feed.
     * Check https://monzo.com/docs/#feed-items for the params details
     * @param {string} accountId - The account id to add the feed item
     * @param {string} [url] - A URL to open when the feed item is tapped. If no URL is provided,
     *                         the app will display a fallback view based on the title & body.
     * @param {string} [type=basic] - Type of feed item.
     * @param {object} [params={}] - A map of parameters which vary based on type.
     * <br/>basic type e.g. <br/>
     *                               {                                               <br/>
     *     &nbsp;                      title: 'My custom item',                      <br/>
     *     &nbsp;                      image_url: 'www.example.com/image.png',       <br/>
     *     &nbsp;                      background_color: '#FCF1EE',                  <br/>
     *     &nbsp;                      body_color: '#FCF1EE',                        <br/>
     *     &nbsp;                      title_color: '#333',                          <br/>
     *     &nbsp;                      body: 'Some body text to display'             <br/>
     *                               }
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    feedItem(accountId, url, type = 'basic', params = {}) {
        const formData = {
            account_id: accountId,
            type
        };
        Object.keys(params).forEach((k) => {
            formData[`params[${k}]`] = params[k];
        });
        if (url) {
            formData.url = url;
        }
        return this.makeRequest('POST', 'feed', formData);
    }

    /**
     * Webhooks allow your application to receive real-time, push notification of events in an account.
     * Each time a matching event occurs, monzo will make a POST call to the URL you provide.
     * If the call fails, monzo will retry up to a maximum of 5 attempts, with exponential backoff.
     * @param {string} accountId - The account id to add the webhook to
     * @param {string} url - The url to send notifications to
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    registerWebhook(accountId, url) {
        const formData = {
            account_id: accountId,
            url
        };
        return this.makeRequest('POST', 'webhooks', formData);
    }

    /**
     * List the webhooks your application has registered on an account.
     * @param {string} accountId - The account to list registered webhooks for
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    webhooks(accountId) {
        const formData = {
            account_id: accountId
        };
        return this.makeRequest('GET', `webhooks?${qs.stringify(formData)}`);
    }

    /**
     * Delete a webhook
     * @param {string} webhookId - The webhook to delete
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    deleteWebhook(webhookId) {
        return this.makeRequest('DELETE', `webhooks/${webhookId}`);
    }

    /**
     * Register attachment
     * @param {string} externalId - The id of the transaction to associate the attachment with.
     * @param {string} fileUrl - The URL of the uploaded attachment.
     * @param {string} fileType - The content type of the attachment. e.g. "image/png"
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    registerAttachment(externalId, fileUrl, fileType) {
        const formData = {
            external_id: externalId,
            file_url: fileUrl,
            file_type: fileType
        };
        return this.makeRequest('POST', 'attachment/register', formData);
    }


    /**
     * Deregister attachment
     * @param {string} attachmentId - The id of the attachment to deregister.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    deregisterAttachment(attachmentId) {
        return this.makeRequest('POST', 'attachment/deregister', { id: attachmentId });
    }

    /**
     * Makes any request to the Monzo API
     * @param {string} requestType - Can be 'GET', 'POST', 'PATCH' or 'DELETE'
     * @param {string} requestEndpoint - The path of the API url. e.g. 'ping/whoami'
     * @param {object} requestData - Any data that needs to be sent to the server
     * @param {boolean} [useBearer=true] - Whether to insert the accessToken into the request header or not
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    makeRequest(requestType, requestEndpoint, requestData, useBearer = true) {
        return new Promise((resolve, reject) => {
            const url = `${API_URL}${requestEndpoint}`;
            const req = request[REQUEST_TO_METHOD[requestType]](url);
            if (requestType === 'GET') {
                req.set('Content-type', 'application/json');
            }
            if (['POST', 'PATCH'].indexOf(requestType) > -1) {
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
