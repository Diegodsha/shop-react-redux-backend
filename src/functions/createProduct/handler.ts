// import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
import { v4 as uuidv4 } from 'uuid';
import schema from './schema';

const create = async ( data)=>{
  const id = uuidv4();

  if (!data.title || !data.price || !data.description || !data.count) {
    return null;
  }

  await dynamo.transactWrite({
    TransactItems: [
      {
        Put: {
          TableName: process.env.STOCKS_TABLE,
          Item: {
            product_id: id,
            count: data.count,
          },
        },
      },
      {
        Put: {
          TableName: process.env.PRODUCTS_TABLE,
          Item: {
            id: id,
            description: data.description,
            price: data.price,
            title: data.title,
          },
        },
      },
    ],
  }).promise();

  return { ...data, id: id};

}

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

  const {productData} = event.body

  console.log(productData);

  try {
   const newProduct= create(productData)

   if (!newProduct) {
    return formatJSONResponse({message:`Product not created due to missing properties`},400);
   }

    return newProduct
  } catch (error) {
    
    return formatJSONResponse({message:`Product not created ${error.message}`},500);
  }

};

export const main = middyfy(createProduct);