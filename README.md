# node-session-handler

Module provides a way of handling Companies House sessions that have certain structure and use certain encoding.   

Module offers the following artifacts:

- `Session` that reflects structure of the session including elements of Single Sign-On 
- `SessionStore` that is responsible for reading and writing session data from / to database taking care of data encoding / decoding
- `SessionMiddleware` that provides easy to use express.js middleware reading session based on the request cookie 

## How to use it

Since build artifacts are stored in the repository (no NPM registry in used just yet) to bring this module as dependency please add the following fragment to `package.json`: 

```$json
"ch-node-session-handler": "git+ssh://git@github.com/companieshouse/poc-node-session-handler.git#master"
```

### Session



### SessionStore

### SessionMiddleware

## Development

Module requires dependencies that can be installed via `npm install` command.

### Linting and testing

Code is linted using `ts-lint` which can be run via `npm run lint` command.

Tests in turn can be run via `npm test` command.

### Compiling and packaging

At this point no NPM repository is in use and built packages are stored directly in the repository.

For that reason every source code change should be compiled using `npm run build` command and build artifacts in `lib` directory should be committed alongside initial code change.  
