import type { AWS } from '@serverless/typescript';
import * as dotenv from 'dotenv';
import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';
dotenv.config()

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: 'dev',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: [
          `arn:aws:s3:::${process.env.PRODUCTS_IMPORT_BUCKET_NAME}`,
          `arn:aws:s3:::${process.env.PRODUCTS_IMPORT_BUCKET_NAME}/*`,
        ],
      },
      {
        Effect: "Allow",
        Action: ["sqs:*"],
        Resource:
          "arn:aws:sqs:${self:provider.region}:*:catalogItemsQueue",
      },
    ],
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      BUCKET_IMPORT: `${process.env.PRODUCTS_IMPORT_BUCKET_NAME}`
    },
  },
  // import the function via paths
  functions: { importProductsFile,importFileParser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
