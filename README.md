# Serverless - AWS Node.js Typescript

This project has been generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).

## Installation/deployment instructions

Depending on your preferred package manager, follow the instructions below to deploy your project.

> **Requirements**: NodeJS `lts/fermium (v.14.15.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx sls deploy` to deploy this stack to AWS

### Using Yarn

- Run `yarn` to install the project dependencies
- Run `yarn sls deploy` to deploy this stack to AWS

## Test your service

This template contains lambda functions triggered by an HTTP request made on the provisioned API Gateway REST API `/products` & `/products/{id}` routes with `GET` method. The body structure is tested by API Gateway against
- `src/functions/getProductsList/schema.ts` JSON-Schema definition: it must contain the `title` & `description` properties 
- `src/functions/getProductsById/schema.ts` JSON-Schema definition: it must contain the `id` property.

<!-- 
- requesting any other path than `/products` with any other method than `POST` will result in API Gateway returning a `403` HTTP error code
- sending a `POST` request to `/hello` with a payload **not** containing a string property named `name` will result in API Gateway returning a `400` HTTP error code
-->

 - sending a `GET` request to `/products` will result in API Gateway returning a `200` HTTP status code with a product list and the detailed event processed by the lambda
 
- sending a `GET` request to `/products/{id}` with a route containing a number property named `id` will result in API Gateway returning a `200` HTTP status code with a specific product and the detailed event processed by the lambda

> :warning: As is, this template, once deployed, opens a **public** endpoint within your AWS account resources. Anybody with the URL can actively execute the API Gateway endpoint and the corresponding lambda. You should protect this endpoint with the authentication method of your choice.

### Locally

In order to test the hello function locally, run the following command:

if you're using NPM
- `npx sls invoke local -f getProductsList --path src/functions/getProductsList/mock.json` 
- `npx sls invoke local -f getProductsById --path src/functions/getProductsById/mock.json` 

if you're using Yarn
- `yarn sls invoke local -f getProductsById --path src/functions/getProductsById/mock.json` 
- `npx sls invoke local -f getProductsList --path src/functions/getProductsList/mock.json`


Check the [sls invoke local command documentation](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/) for more information.

### Remotely

Copy and replace your `url` - found in Serverless `deploy` command output - and `name` parameter in the following `curl` command in your terminal or in Postman to test your newly deployed application.


```
curl --location --request GET 'https://eh7z26ia2l.execute-api.us-east-1.amazonaws.com/dev/products' \
--header 'Content-Type: application/json' \
```

```
curl --location --request GET 'https://eh7z26ia2l.execute-api.us-east-1.amazonaws.com/dev/products/{id}' \
--header 'Content-Type: application/json' \
--data-raw '{
    "id": "number"
}'
```

## Template features

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas

```
.
├── src
│   ├── functions               # Lambda configuration and source code folder
│   │   ├── getProductsList
│   │   │   ├── handler.ts      # `getProductsList` lambda source code
│   │   │   ├── index.ts        # `getProductsList` lambda Serverless configuration
│   │   │   ├── mock.json       # `getProductsList` lambda input parameter, if any, for local invocation
│   │   │   └── schema.ts       # `getProductsList` lambda input event JSON-Schema
│   │   │
│   │   └── index.ts            # Import/export of all lambda configurations
|   |   |
|   |   ├── getProductsById
│   │   │   ├── handler.ts      # `getProductsById` lambda source code
│   │   │   ├── index.ts        # `getProductsById` lambda Serverless configuration
│   │   │   ├── mock.json       # `getProductsById` lambda input parameter, if any, for local invocation
│   │   │   └── schema.ts       # `getProductsById` lambda input event JSON-Schema
│   │   │
│   │   └── index.ts            # Import/export of all lambda configurations
│   │
│   └── libs                    # Lambda shared code
│       └── apiGateway.ts       # API Gateway specific helpers
│       └── handlerResolver.ts  # Sharable library for resolving lambda handlers
│       └── lambda.ts           # Lambda middleware
│       └── helpers.ts          # functions that interacts with the lamdbas
│
├── package.json
├── serverless.ts               # Serverless service file
├── tsconfig.json               # Typescript compiler configuration
├── tsconfig.paths.json         # Typescript paths
└── webpack.config.js           # Webpack configuration
```

### 3rd party libraries

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) - uses JSON-Schema definitions used by API Gateway for HTTP request validation to statically generate TypeScript types in your lambda's handler code base
- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file

### Advanced usage

Any tsconfig.json can be used, but if you do, set the environment variable `TS_NODE_CONFIG` for building the application, eg `TS_NODE_CONFIG=./tsconfig.app.json npx serverless webpack`
