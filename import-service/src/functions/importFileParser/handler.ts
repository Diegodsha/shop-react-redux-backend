import { formatJSONResponse } from '@libs/api-gateway';
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import * as dotenv from 'dotenv';
import { Readable } from 'stream';
dotenv.config();
const csv = require('csv-parser');

//clients
const s3client = new S3Client({ region: 'us-east-1' });
const sqsClient = new SQSClient({ region: 'us-east-1' });

//helpers
const sendDataToSQS = async (csvData) => {
  const { QUEUE_URL: sqsUrl } = process.env;

  try {
    if (!sqsUrl) {
      throw new Error(
        'QUEUE_URL environment variable is missing'
      );
    }

    console.log(`Sending data to SQS [raw: ${JSON.stringify(csvData)}]`);

    const command = new SendMessageCommand({
      QueueUrl: sqsUrl,
      MessageBody: JSON.stringify(csvData),
    });

    await sqsClient.send(command);

    console.log(`Message is sent to SQS`);
  } catch (error) {
    console.log(error);
  }
};

//handler
const importFileParser = async (event) => {
  const { PRODUCTS_IMPORT_BUCKET_NAME: bucketName } = process.env;

  if (!bucketName) {
    throw new Error(
      'PRODUCTS_IMPORT_BUCKET_NAME environment variable is missing'
    );
  }

  try {
    for (const record of event.Records) {
      const key = record.s3.object.key;

      //Get
      const getObjectInput = {
        Bucket: bucketName,
        Key: key,
      };

      const getObjectCommand = new GetObjectCommand(getObjectInput);

      const getObjectResponse = await s3client.send(getObjectCommand);

      (getObjectResponse.Body as Readable)
        .pipe(csv())
        .on('data', async (data) => await sendDataToSQS(data))
        .on('end', () => {
          console.log('CSV file successfully parsed');
        })
        .on('error', (e) => {
          throw new Error(`Erro in parsing CSV ${e}`);
        });

      //Copy
      const copyObjectInput = {
        Bucket: bucketName,
        CopySource: `${bucketName}/${key}`,
        Key: key.replace('uploaded', 'parsed'),
      };

      const commandCopy = new CopyObjectCommand(copyObjectInput);
      await s3client.send(commandCopy);

      // Delete
      const commandDelete = new DeleteObjectCommand(getObjectInput);

      await s3client.send(commandDelete);
    }

    return formatJSONResponse({ message: 'File has been imported' }, 202);
  } catch (error) {
    return formatJSONResponse(
      { message: `Error importing file ${error}` },
      500
    );
  }
};

export const main = importFileParser;
