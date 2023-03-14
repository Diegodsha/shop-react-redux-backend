import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { joinTables } from '@libs/helpers';
import { middyfy } from '@libs/lambda';
import schema from './schema';
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const scan = async ()=>{
    const {Items: productsItems} = await dynamo.scan({
        TableName: process.env.PRODUCTS_TABLE
    }).promise();
   
    const {Items: stocksItems} = await dynamo.scan({
        TableName: process.env.STOCKS_TABLE
    }).promise();
    

  let joinedStocksProducts = joinTables(stocksItems, productsItems, 'product_id', 'id', 'count', 'Product with this id is not in the list')

    return joinedStocksProducts;
}

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  console.log('get products list');
  try {
    const products = await scan()
    
    return formatJSONResponse(products, 200);
  } catch (error) {
    return formatJSONResponse({errorMessage: error.message},500)
  }
};

export const main = middyfy(getProductsList);

