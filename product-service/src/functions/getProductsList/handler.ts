import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import ProductsController from 'src/Controllers';
import schema from './schema';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema[]> = async () => {
  console.log('get products list');
  try {
    const products = new ProductsController()
    const allProducts = await products.scan()
    
    return formatJSONResponse(allProducts, 200);
  } catch (error) {
    return formatJSONResponse({errorMessage: error.message},500)
  }
};

export const main = middyfy(getProductsList);

