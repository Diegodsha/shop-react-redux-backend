import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const scanById = async (id) => {
  const { Item: productItem } = await dynamo
    .get({
      TableName: process.env.PRODUCTS_TABLE,
      Key: { id: id },
    })
    .promise();

  const { Item: stockItem } = await dynamo
    .get({
      TableName: process.env.STOCKS_TABLE,
      Key: { product_id: id },
    })
    .promise();

  return stockItem?.count
    ? {
        ...productItem,
        count: stockItem.count,
      }
    : null;
};

const getProductsById: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const { id } = event.pathParameters;

  console.log(id);

  const product = await scanById(id);

  try {
    if (!product) {
      return formatJSONResponse(
        { message: `Product ${id} is not in the list` },
        404
      );
    }

    return formatJSONResponse(product, 200);
  } catch (error) {
    return formatJSONResponse({ errorMessage: error.message }, 500);
  }
};

export const main = middyfy(getProductsById);
