import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { Product, Stock } from 'src/types/products';
import schema from './schema';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();

const scanById = async (id) => {

    const productPromise =  dynamo
    .get({
      TableName: process.env.PRODUCTS_TABLE,
      Key: { id: id },
    })
    .promise()

    const stocksPromise = dynamo
    .get({
      TableName: process.env.STOCKS_TABLE,
      Key: { product_id: id },
    })
    .promise();

    const [{value: {Item: productItem}}, {value: {Item: stockItem}}] = await Promise.allSettled([productPromise, stocksPromise]) as unknown as [{value:{Item:Product}},{value:{Item:Stock}}]
    
    if (!productItem || !stockItem) {
      return
    }

  return  {
        ...productItem,
        count: stockItem.count,
      }
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
