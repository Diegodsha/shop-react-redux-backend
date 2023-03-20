import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { joinTables } from '@libs/helpers';
import { middyfy } from '@libs/lambda';
import { Product, Stock } from 'src/types/products';
import schema from './schema';
import { DynamoDB} from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();

const scan = async ()=>{
    const productPromise =  dynamo.scan({
        TableName: process.env.PRODUCTS_TABLE
    }).promise();
   
    const stocksPromise =  dynamo.scan({
        TableName: process.env.STOCKS_TABLE
    }).promise();

    
    const [{value: {Items: productsItems}}, {value: {Items: stocksItems}}] = await Promise.allSettled([productPromise, stocksPromise])  as unknown as [{value:{Items:Product[]}},{value:{Items:Stock[]}}]
    
    console.log(productsItems)
    let joinedStocksProducts = joinTables(stocksItems, productsItems, 'product_id', 'id', 'count', 'Product with this id is not in the list')

    return joinedStocksProducts;
}

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema[]> = async () => {
  console.log('get products list');
  try {
    const products = await scan()
    
    return formatJSONResponse(products, 200);
  } catch (error) {
    return formatJSONResponse({errorMessage: error.message},500)
  }
};

export const main = middyfy(getProductsList);

