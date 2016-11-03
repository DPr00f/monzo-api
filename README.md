<a name="MonzoApi"></a>
# monzo-api

Node Monzo API easy integration

## Instalation

```npm i monzo-api -S```

## Usage

```
import MonzoApi from 'monzo-api';

const clientId = 'your-app-client-id';
const clientSecret = 'your-app-client-secret';
const verificationCode = 'code-that-server-gets-after-the-redirection';
const verificationStateToken = 'state-token-received-in-query-string-after-redirection';
const monzoApi = new MonzoApi(clientId, clientSecret);

monzoApi.redirectUrl = 'http://127.0.0.1/monzo-validation';

console.log('Redirect the user to', monzoApi.authorizationUrl);

monzoApi.authenticate(code, 'exampleStateToken')
        .then((res) => {
            console.log("Congrats, you're logged in", res);
        })
        .catch((err) => {
            console.error('Uh Oh! Something wrong happened. :(');
            console.error(err);
        });
```

## Documentation

* [MonzoApi](#MonzoApi)
    * [new MonzoApi(clientId, clientSecret)](#new_MonzoApi_new)
    * [.clientId](#MonzoApi+clientId)
    * [.clientId](#MonzoApi+clientId) ⇒ <code>string</code>
    * [.clientSecret](#MonzoApi+clientSecret)
    * [.clientSecret](#MonzoApi+clientSecret) ⇒ <code>string</code>
    * [.redirectUrl](#MonzoApi+redirectUrl)
    * [.redirectUrl](#MonzoApi+redirectUrl) ⇒ <code>string</code>
    * [.refreshToken](#MonzoApi+refreshToken)
    * [.refreshToken](#MonzoApi+refreshToken) ⇒ <code>string</code>
    * [.accessToken](#MonzoApi+accessToken)
    * [.accessToken](#MonzoApi+accessToken) ⇒ <code>string</code>
    * [.code](#MonzoApi+code) ⇒ <code>string</code>
    * [.stateToken](#MonzoApi+stateToken) ⇒ <code>string</code>
    * [.stateToken](#MonzoApi+stateToken) ⇒ <code>string</code>
    * [.authorizationUrl](#MonzoApi+authorizationUrl) ⇒ <code>string</code>
    * [.generateStateToken()](#MonzoApi+generateStateToken) ⇒ <code>String</code>
    * [.authenticate(code, stateToken, [verifyStateToken])](#MonzoApi+authenticate) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.refreshAccess()](#MonzoApi+refreshAccess) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.ping([acessToken])](#MonzoApi+ping) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.accounts([acessToken])](#MonzoApi+accounts) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.balance(accountId, [acessToken])](#MonzoApi+balance) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.transaction(transactionId, [expanded], [acessToken])](#MonzoApi+transaction) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.transactions(accountId, [expanded], [query], [acessToken])](#MonzoApi+transactions) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.annotate(transactionId, metadata, [acessToken])](#MonzoApi+annotate) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.feedItem(accountId, [url], [type], [params], [acessToken])](#MonzoApi+feedItem) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.registerWebhook(accountId, url, [acessToken])](#MonzoApi+registerWebhook) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.webhooks(accountId, [acessToken])](#MonzoApi+webhooks) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.deleteWebhook(webhookId, [acessToken])](#MonzoApi+deleteWebhook) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.uploadImage(file, fileName, fileType)](#MonzoApi+uploadImage) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.registerAttachment(externalId, fileUrl, fileType, [acessToken])](#MonzoApi+registerAttachment) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.deregisterAttachment(attachmentId, [acessToken])](#MonzoApi+deregisterAttachment) ⇒ <code>Promise.&lt;object, Error&gt;</code>
    * [.makeRequest(requestType, requestEndpoint, requestData, [useBearer])](#MonzoApi+makeRequest) ⇒ <code>Promise.&lt;object, Error&gt;</code>

<a name="new_MonzoApi_new"></a>

### new MonzoApi(clientId, clientSecret)
Create a monzo api instance.


| Param | Type | Description |
| --- | --- | --- |
| clientId | <code>string</code> | The client id value. |
| clientSecret | <code>string</code> | The client secret value. |

<a name="MonzoApi+clientId"></a>

### monzoApi.clientId
Set the clientId value.

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The clientId value. |

<a name="MonzoApi+clientId"></a>

### monzoApi.clientId ⇒ <code>string</code>
Get the clientId value.

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>string</code> - The clientId value.
<a name="MonzoApi+clientSecret"></a>

### monzoApi.clientSecret
Set the clientSecret value.

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The clientSecret value. |

<a name="MonzoApi+clientSecret"></a>

### monzoApi.clientSecret ⇒ <code>string</code>
Get the clientSecret value.

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>string</code> - The clientSecret value.
<a name="MonzoApi+redirectUrl"></a>

### monzoApi.redirectUrl
Set the redirectUrl value.

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The redirectUrl value. |

<a name="MonzoApi+redirectUrl"></a>

### monzoApi.redirectUrl ⇒ <code>string</code>
Get the redirectUrl value.

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>string</code> - The redirectUrl value.
<a name="MonzoApi+refreshToken"></a>

### monzoApi.refreshToken
Set the refreshToken value.

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The refreshToken value. |

<a name="MonzoApi+refreshToken"></a>

### monzoApi.refreshToken ⇒ <code>string</code>
Get the refreshToken value.

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>string</code> - The refreshToken value.
<a name="MonzoApi+accessToken"></a>

### monzoApi.accessToken
Set the accessToken value.

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The accessToken value. |

<a name="MonzoApi+accessToken"></a>

### monzoApi.accessToken ⇒ <code>string</code>
Get the accessToken value.

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>string</code> - The accessToken value.
<a name="MonzoApi+code"></a>

### monzoApi.code ⇒ <code>string</code>
Get the code value. It will be set when authenticate method gets called

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>string</code> - The code value.
<a name="MonzoApi+stateToken"></a>

### monzoApi.stateToken ⇒ <code>string</code>
Get the stateToken value.
Value that will be matched against the one provided when a user authenticates.
The values must match otherwise the authentication won't proceed

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>string</code> - The stateToken value.
<a name="MonzoApi+stateToken"></a>

### monzoApi.stateToken ⇒ <code>string</code>
Set the stateToken

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>string</code> - The stateToken value.
<a name="MonzoApi+authorizationUrl"></a>

### monzoApi.authorizationUrl ⇒ <code>string</code>
Get the authorizationUrl value.
The user needs to be redirected to this url in order to authenticate

**Kind**: instance property of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>string</code> - The authorizationUrl value.
<a name="MonzoApi+generateStateToken"></a>

### monzoApi.generateStateToken() ⇒ <code>String</code>
Create a state token that gets send on the authorizationUrl

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>String</code> - The token value that was stored and needs to be compared on authorization
<a name="MonzoApi+authenticate"></a>

### monzoApi.authenticate(code, stateToken, [verifyStateToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Authenticate the user given the code and the stateToken
found in the query string of the redirectUrl

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| code | <code>string</code> |  | The code value. |
| stateToken | <code>string</code> |  | The state token value. |
| [verifyStateToken] | <code>string</code> | <code>false</code> | Use this token instead of the one registered in the API. |

<a name="MonzoApi+refreshAccess"></a>

### monzoApi.refreshAccess() ⇒ <code>Promise.&lt;object, Error&gt;</code>
Refreshes the user access token using the refresh one

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.
<a name="MonzoApi+ping"></a>

### monzoApi.ping([acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Pings the API to check whether everything is correct

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Description |
| --- | --- | --- |
| [acessToken] | <code>string</code> | The accessToken for the request. |

<a name="MonzoApi+accounts"></a>

### monzoApi.accounts([acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Returns the accounts for the authenticated user

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Description |
| --- | --- | --- |
| [acessToken] | <code>string</code> | The accessToken for the request. |

<a name="MonzoApi+balance"></a>

### monzoApi.balance(accountId, [acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Reads the balance

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Description |
| --- | --- | --- |
| accountId | <code>string</code> | The account id to check the balance in. |
| [acessToken] | <code>string</code> | The accessToken for the request. |

<a name="MonzoApi+transaction"></a>

### monzoApi.transaction(transactionId, [expanded], [acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Returns an individual transaction, fetched by its id.

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| transactionId | <code>string</code> |  | The transaction id to check details in |
| [expanded] | <code>boolean</code> | <code>true</code> | Whether the details for merchant are expanded or not |
| [acessToken] | <code>string</code> |  | The accessToken for the request. |

<a name="MonzoApi+transactions"></a>

### monzoApi.transactions(accountId, [expanded], [query], [acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
List transactions

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| accountId | <code>string</code> |  | The account id to check transactions in |
| [expanded] | <code>boolean</code> | <code>false</code> | Whether the details for merchant are expanded or not |
| [query] | <code>object</code> | <code>{}</code> | Can be used to add pagination. https://monzo.com/docs/#pagination |
| [acessToken] | <code>string</code> |  | The accessToken for the request. |

<a name="MonzoApi+annotate"></a>

### monzoApi.annotate(transactionId, metadata, [acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Annotate transaction.
You may store your own key-value annotations against a transaction in its metadata.

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Description |
| --- | --- | --- |
| transactionId | <code>string</code> | The transaction id to add the annotation |
| metadata | <code>object</code> | The key values pairs to store in the metadata.                            Include each key you would like to modify. To delete a key, set its value to an empty string |
| [acessToken] | <code>string</code> | The accessToken for the request. |

<a name="MonzoApi+feedItem"></a>

### monzoApi.feedItem(accountId, [url], [type], [params], [acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Creates a new feed item on the user’s feed.
Check https://monzo.com/docs/#feed-items for the params details

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| accountId | <code>string</code> |  | The account id to add the feed item |
| [url] | <code>string</code> |  | A URL to open when the feed item is tapped. If no URL is provided,                         the app will display a fallback view based on the title & body. |
| [type] | <code>string</code> | <code>&quot;basic&quot;</code> | Type of feed item. |
| [params] | <code>object</code> | <code>{}</code> | A map of parameters which vary based on type. <br/>basic type e.g. <br/>                               {                                               <br/>     &nbsp;                      title: 'My custom item',                      <br/>     &nbsp;                      image_url: 'www.example.com/image.png',       <br/>     &nbsp;                      background_color: '#FCF1EE',                  <br/>     &nbsp;                      body_color: '#FCF1EE',                        <br/>     &nbsp;                      title_color: '#333',                          <br/>     &nbsp;                      body: 'Some body text to display'             <br/>                               } |
| [acessToken] | <code>string</code> |  | The accessToken for the request. |

<a name="MonzoApi+registerWebhook"></a>

### monzoApi.registerWebhook(accountId, url, [acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Webhooks allow your application to receive real-time, push notification of events in an account.
Each time a matching event occurs, monzo will make a POST call to the URL you provide.
If the call fails, monzo will retry up to a maximum of 5 attempts, with exponential backoff.

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Description |
| --- | --- | --- |
| accountId | <code>string</code> | The account id to add the webhook to |
| url | <code>string</code> | The url to send notifications to |
| [acessToken] | <code>string</code> | The accessToken for the request. |

<a name="MonzoApi+webhooks"></a>

### monzoApi.webhooks(accountId, [acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
List the webhooks your application has registered on an account.

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Description |
| --- | --- | --- |
| accountId | <code>string</code> | The account to list registered webhooks for |
| [acessToken] | <code>string</code> | The accessToken for the request. |

<a name="MonzoApi+deleteWebhook"></a>

### monzoApi.deleteWebhook(webhookId, [acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Delete a webhook

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Description |
| --- | --- | --- |
| webhookId | <code>string</code> | The webhook to delete |
| [acessToken] | <code>string</code> | The accessToken for the request. |

<a name="MonzoApi+uploadImage"></a>

### monzoApi.uploadImage(file, fileName, fileType) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Hosts an image in Monzo S3 Bucket.
Will try to gzip the contents before uploading it

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Description |
| --- | --- | --- |
| file | <code>string</code> &#124; <code>Buffer</code> | Can be the file absolute location, a base64 representation or the Buffer content of an image |
| fileName | <code>string</code> | A meaningful name for the image |
| fileType | <code>string</code> | The mime type of the image e.g. image/png |

<a name="MonzoApi+registerAttachment"></a>

### monzoApi.registerAttachment(externalId, fileUrl, fileType, [acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Register attachment

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Description |
| --- | --- | --- |
| externalId | <code>string</code> | The id of the transaction to associate the attachment with. |
| fileUrl | <code>string</code> | The URL of the uploaded attachment. |
| fileType | <code>string</code> | The content type of the attachment. e.g. "image/png" |
| [acessToken] | <code>string</code> | The accessToken for the request. |

<a name="MonzoApi+deregisterAttachment"></a>

### monzoApi.deregisterAttachment(attachmentId, [acessToken]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Deregister attachment

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Description |
| --- | --- | --- |
| attachmentId | <code>string</code> | The id of the attachment to deregister. |
| [acessToken] | <code>string</code> | The accessToken for the request. |

<a name="MonzoApi+makeRequest"></a>

### monzoApi.makeRequest(requestType, requestEndpoint, requestData, [useBearer]) ⇒ <code>Promise.&lt;object, Error&gt;</code>
Makes any request to the Monzo API

**Kind**: instance method of <code>[MonzoApi](#MonzoApi)</code>
**Returns**: <code>Promise.&lt;object, Error&gt;</code> - A promise that returns an object if resolved,
                                  or an Error if rejected.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| requestType | <code>string</code> |  | Can be 'GET', 'POST', 'PATCH' or 'DELETE' |
| requestEndpoint | <code>string</code> |  | The path of the API url. e.g. 'ping/whoami' |
| requestData | <code>object</code> |  | Any data that needs to be sent to the server |
| [useBearer] | <code>boolean</code> | <code>true</code> | Whether to insert the accessToken into the request header or not |
