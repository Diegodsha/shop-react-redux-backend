import { formatJSONResponse } from '@libs/api-gateway';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { middyfy } from '@libs/lambda';
import ProductsController from 'src/Controllers';

const catalogBatchProcess = async (event) => {
  const snsClient = new SNSClient({ region: 'us-east-1' });

  const products = new ProductsController()

  try {
    for (const record of event.Records) {
      const product = JSON.parse(record.body);

      const newProduct = await products.create(product);

      if (newProduct) {
        const publishCommand = new PublishCommand({
          Subject: 'New product created',
          Message: `New products ${JSON.stringify(product)}`,
          MessageAttributes: {
            title: {
              DataType: 'String',
              StringValue: product.title,
            },
          },
          TopicArn: process.env.SNS_TOPIC_ARN,
        });

        await snsClient.send(publishCommand);
      }
    }

    return formatJSONResponse(
      {
        message: 'Product has been created',
      },
      202
    );
  } catch (error) {
    return formatJSONResponse({ message: `Batch process failed: ${error.message}` }, 500);
  }
};

export const main = middyfy(catalogBatchProcess);
