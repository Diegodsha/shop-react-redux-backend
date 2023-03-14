import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import schema from './schema';

const dynamo = new DynamoDB.DocumentClient();

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

  console.log( productData);

  try {
   const newProduct= await create(productData)

   if (!newProduct) {
    return formatJSONResponse({message:`Product not created due to missing properties, check if you included title, description, count, price, and try again`},400);
   }

    return formatJSONResponse(newProduct,200);
  } catch (error) {
    
    return formatJSONResponse({message:`Product not created ${error.message}`},500);
  }

};

export const main = middyfy(createProduct);