import qs from 'qs';
import fs from 'fs';
import zlib from 'zlib';
import request from 'superagent';

const AUTH_URL = 'https://auth.getmondo.co.uk/';
const API_URL = 'https://api.monzo.com/';

const REQUEST_TO_METHOD = {
    GET: 'get',
    POST: 'post',
    PATCH: 'patch',
    DELETE: 'del'
};

const gzipBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        zlib.gzip(buffer, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const tryToGZipAndResolve = (data, resolve) => {
    if (data.buffer) {
        gzipBuffer(data.buffer)
            .then((gzipData) => {
                data.buffer = gzipData;
                data.encoding = 'gzip';
                resolve(data);
            })
            .catch((err) => {
                console.error("Couldn't gzip the buffer", err);
                resolve(data);
            });
    }
};

const getFileBuffer = (file) => {
    return new Promise((resolve, reject) => {
        const data = {};
        if (file instanceof Buffer) {
            data.buffer = file;
        } else if (typeof file === 'string') {
            if (file.indexOf('data:image') > -1 && file.indexOf('base64') > -1) {
                data.buffer = new Buffer(file.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            } else {
                fs.readFile(file, (err, buffer) => {
                    if (err) {
                        reject(err);
                    } else {
                        data.buffer = buffer;
                        tryToGZipAndResolve(data, resolve);
                    }
                });
            }
        }
        tryToGZipAndResolve(data, resolve);
    });
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
     * @param {string} [verifyStateToken] - Use this token instead of the one registered in the API.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    authenticate(code, stateToken, verifyStateToken = false) {
        return new Promise((resolve, reject) => {
            verifyStateToken = verifyStateToken || this._stateToken;
            if (stateToken !== verifyStateToken) {
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
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    ping(accessToken) {
        return this.makeRequest('GET', 'ping/whoami', false, true, accessToken);
    }

    /**
     * Returns the accounts for the authenticated user
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    accounts(accessToken) {
        return this.makeRequest('GET', 'accounts', false, true, accessToken);
    }

    /**
     * Reads the balance
     * @param {string} accountId - The account id to check the balance in.
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    balance(accountId, accessToken) {
        return this.makeRequest('GET', 'balance', { account_id: accountId }, true, accessToken);
    }

    /**
     * Returns an individual transaction, fetched by its id.
     * @param {string} transactionId - The transaction id to check details in
     * @param {boolean} [expanded=true] - Whether the details for merchant are expanded or not
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    transaction(transactionId, expanded = true, accessToken) {
        const query = {};
        if (expanded) {
            query['expand[]'] = 'merchant';
        }
        return this.makeRequest('GET', `transactions/${transactionId}?${qs.stringify(query)}`, false, true, accessToken);
    }

    /**
     * List transactions
     * @param {string} accountId - The account id to check transactions in
     * @param {boolean} [expanded=false] - Whether the details for merchant are expanded or not
     * @param {object} [query={}] - Can be used to add pagination. https://monzo.com/docs/#pagination
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    transactions(accountId, expanded = false, query = {}, accessToken) {
        if (expanded) {
            query['expand[]'] = 'merchant';
        }
        return this.makeRequest('GET', `transactions?${qs.stringify(query)}`, false, true, accessToken);
    }

    /**
     * Annotate transaction.
     * You may store your own key-value annotations against a transaction in its metadata.
     * @param {string} transactionId - The transaction id to add the annotation
     * @param {object} metadata - The key values pairs to store in the metadata.
     *                            Include each key you would like to modify. To delete a key, set its value to an empty string
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    annotate(transactionId, metadata = {}, accessToken) {
        const formData = {};
        Object.keys(metadata).forEach((k) => {
            formData[`metadata[${k}]`] = metadata[k];
        });
        return this.makeRequest('PATCH', `transactions/${transactionId}`, formData, true, accessToken);
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
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    feedItem(accountId, url, type = 'basic', params = {}, accessToken) {
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
        return this.makeRequest('POST', 'feed', formData, true, accessToken);
    }

    /**
     * Webhooks allow your application to receive real-time, push notification of events in an account.
     * Each time a matching event occurs, monzo will make a POST call to the URL you provide.
     * If the call fails, monzo will retry up to a maximum of 5 attempts, with exponential backoff.
     * @param {string} accountId - The account id to add the webhook to
     * @param {string} url - The url to send notifications to
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    registerWebhook(accountId, url, accessToken) {
        const formData = {
            account_id: accountId,
            url
        };
        return this.makeRequest('POST', 'webhooks', formData, true, accessToken);
    }

    /**
     * List the webhooks your application has registered on an account.
     * @param {string} accountId - The account to list registered webhooks for
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    webhooks(accountId, accessToken) {
        const formData = {
            account_id: accountId
        };
        return this.makeRequest('GET', `webhooks?${qs.stringify(formData)}`, false, true, accessToken);
    }

    /**
     * Delete a webhook
     * @param {string} webhookId - The webhook to delete
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    deleteWebhook(webhookId, accessToken) {
        return this.makeRequest('DELETE', `webhooks/${webhookId}`, false, true, accessToken);
    }

    /**
     * Hosts an image in Monzo S3 Bucket.
     * Will try to gzip the contents before uploading it
     * @param {string|Buffer} file - Can be the file absolute location, a base64 representation or the Buffer content of an image
     * @param {string} fileName - A meaningful name for the image
     * @param {string} fileType - The mime type of the image e.g. image/png
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    uploadImage(file, fileName, fileType) {
        return new Promise((resolve, reject) => {
            const formData = {
                file_name: fileName,
                file_type: fileType
            };
            let fileUrl;
            let uploadUrl;
            this.makeRequest('POST', 'attachment/upload', formData)
                .then((res) => {
                    fileUrl = res.file_url;
                    uploadUrl = res.upload_url;
                    return getFileBuffer(file);
                })
                .then((obj) => {
                    const req = request.put(uploadUrl)
                                       .set('Content-Type', fileType);
                    if (obj.encoding) {
                        req.set('Content-Encoding', obj.encoding);
                    }
                    req.send(obj.buffer)
                        .end((err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({
                                    file_url: fileUrl
                                });
                            }
                        });

                })
                .catch(reject);
        });
    }

    /**
     * Register attachment
     * @param {string} externalId - The id of the transaction to associate the attachment with.
     * @param {string} fileUrl - The URL of the uploaded attachment.
     * @param {string} fileType - The content type of the attachment. e.g. "image/png"
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    registerAttachment(externalId, fileUrl, fileType, accessToken) {
        const formData = {
            external_id: externalId,
            file_url: fileUrl,
            file_type: fileType
        };
        return this.makeRequest('POST', 'attachment/register', formData, true, accessToken);
    }


    /**
     * Deregister attachment
     * @param {string} attachmentId - The id of the attachment to deregister.
     * @param {string} [acessToken] - The accessToken for the request.
     * @return {Promise.<object, Error>} A promise that returns an object if resolved,
     *                                   or an Error if rejected.
     */
    deregisterAttachment(attachmentId, accessToken) {
        return this.makeRequest('POST', 'attachment/deregister', { id: attachmentId }, true, accessToken);
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
    makeRequest(requestType, requestEndpoint, requestData, useBearer = true, accessToken = false) {
        accessToken = accessToken || this.accessToken;
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
                req.set('Authorization', `Bearer ${accessToken}`);
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
