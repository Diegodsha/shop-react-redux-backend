import { formatJSONResponse } from '@libs/api-gateway';
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import { Readable } from 'stream';
dotenv.config();

const csv = require('csv-parser');

const importFileParser = async (event) => {
  const { PRODUCTS_IMPORT_BUCKET_NAME: bucketName } = process.env;

  const client = new S3Client({ region: 'us-east-1' });

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

      const getObjectResponse = await client.send(getObjectCommand);

      (getObjectResponse.Body as Readable)
        .pipe(csv())
        .on('data', (data) => console.log(data))
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
      await client.send(commandCopy);

      // Delete
      const commandDelete = new DeleteObjectCommand(getObjectInput);

      await client.send(commandDelete);
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
