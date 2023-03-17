
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import {S3Client,PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv'
dotenv.config()
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const importProductsFile = async (event) => {
  const { name } = event.queryStringParameters;
  console.log(name);

  const { PRODUCTS_IMPORT_BUCKET_NAME: bucketName } = process.env;

  
  if (!bucketName) {
    throw new Error('PRODUCTS_IMPORT_BUCKET_NAME environment variable is missing');
  }

  const client = new S3Client({ region: 'us-east-1' });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: `uploaded/${name}`,
    ContentType: "text/csv",
  });

  try {
    if (!name) {
      return formatJSONResponse({message:'name param is not valid or missing'},404);
    }
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    console.log(url);
    return formatJSONResponse({url},200)
  } catch (error) {
    return formatJSONResponse({message:error.message},500)
  }
};

export const main = middyfy(importProductsFile);
