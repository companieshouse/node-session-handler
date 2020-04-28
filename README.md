# node-session-handler

Module provides a way of handling Companies House sessions.

Module offers the following artifacts:

- `Session` that reflects structure of the session including elements of Single Sign-On 
- `SessionStore` that is responsible for reading and writing session data from / to database taking care of data encoding / decoding
- `SessionMiddleware` that provides easy to use express.js middleware reading session based on the request cookie 

## Prerequisite

Module requires `request.cookies` map to be populated with an object keyed by the cookie names. It can be achieved by use of [cookie-parser](https://www.npmjs.com/package/cookie-parser) module.

In short run `npm install cookie-parser` command to install dependency and add the following snipped to the application to apply cookie parsing middleware:

```$typescript
import * as cookieParser from 'cookie-parser'
...
app.use(cookieParser())
```

Note: Cookie parsing must happen before request is passed to session middleware. 

## How to use it

Since build artifacts are stored in the repository (no NPM registry in used just yet) to bring this module as dependency please add the following fragment to `package.json`: 

```$json
"ch-node-session-handler": "git+ssh://git@github.com/companieshouse/node-session-handler.git#2.0.0"
```

### Session

The session class is a wrapper around the raw session `data: ISession` (as retrieved from accounts after signing in). 

To keep the `ISession` type consistent, we added an extra field called `extra_data` (`SessionKey.ExtraData`) to store any data that apps might need in the session making session itself extensible.

The class provides these methods:

- `get<T = ISessionValue>(key: SessionKey): T | undefined` - allows retrieving session data for keys defined in the `SessionKey` enum that represents all possible types than can be retrieved from the session
- `getExtraData<T>(key: string): T | undefined` - allows retrieving session data populated by the applications
- `setExtraData<T>(key: string, val: T): void` - allows amending session data used by the applications by replacing existing value (if present)
- `deleteExtraData(key: string): boolean` - deletes a key from the session data populated by an application (if exists)
- `verify = (): void` - ensures that the session is valid i.e. contains the right fields, and it's not expired

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
Test 2
