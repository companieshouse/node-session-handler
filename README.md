# node-session-handler

Module provides a way of handling Companies House sessions.

Module offers the following artifacts:

- `Session` that reflects structure of the session including elements of Single Sign-On 
- `SessionStore` that is responsible for reading and writing session data from / to database taking care of data encoding / decoding
- `SessionMiddleware` that provides easy to use express.js middleware reading session based on the request cookie 

## How to use it

Since build artifacts are stored in the repository (no NPM registry in used just yet) to bring this module as dependency please add the following fragment to `package.json`: 

```$json
"ch-node-session-handler": "git+ssh://git@github.com/companieshouse/node-session-handler.git#master"
```

### Session

Session class represents bag of session data with the following accessor methods:

- `Session.getValue(key: SessionKey)` allowing to reach for certain top level elements of the session
- `Session.getExtraData()` allowing to retrieve session data populated by the applications
- `Session.saveExtraData(key: string, value: T)` allowing to amend session data used by the applications

Enumerated type `SessionKey` mentioned above lists all keys for common top level properties such as `SessionKey.Id`, `SessionKey.SignInInfo`, `SessionKey.ExtraData` and more, helping to avoid typo errors.

A `SessionKey.ExtraData` key plays special role here as it allows applications to put their data into session making session itself extensible. 

### SessionStore

Session store offers a way to load `SessionStore.load`, store `SessionStore.store` and delete `SessionStore.delete` session from database without worrying about data encoding or decoding. 

All above methods take instance of `Cookie` class which holds combination of session ID and signature. Use of that argument type helps to ensure that database operations are only performed for verified session identifiers.   

### SessionMiddleware

Session middleware provides convenient integration point for express.js applications. Middleware does:

1. read cookie value from request HTTP headers
2. verify cookie signature if cookie is present
3. load session from store using verified cookie if present
4. stores verified session in request scope

Express.js applications wishing to introduce session handling should register middleware in the following way:

```$javascript

const sessionStore = new SessionStore(new Redis(`redis://${process.env.CACHE_SERVER}`))
const middleware = SessionMiddleware({ cookieName: '__SID', cookieSecret: process.env.COOKIE_SECRET }, sessionStore)

app.use(middleware)
```

Such application will then have access to session instance via `request.session` as long as `__SID` cookie is set to correct value.

## Development

Module requires dependencies that can be installed via `npm install` command.

### Linting and testing

Code is linted using `ts-lint` which can be run via `npm run lint` command.

Tests in turn can be run via `npm test` command.

### Compiling and packaging

At this point no NPM registry is in use and built packages are stored directly in the repository.

For that reason every source code change should be compiled using `npm run build` command and build artifacts in `lib` directory should be committed alongside initial code change.  
