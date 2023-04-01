import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import ProductsController from 'src/Controllers';
import schema from './schema';


const getProductsById: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const { id } = event.pathParameters;

  console.log(id);

  const product = new ProductsController()

  const productScanned = await product.scanById(id);

  try {
    if (!productScanned) {
      return formatJSONResponse(
        { message: `Product ${id} is not in the list` },
        404
      );
    }

    return formatJSONResponse(productScanned, 200);
  } catch (error) {
    return formatJSONResponse({ errorMessage: error.message }, 500);
  }
};

export const main = middyfy(getProductsById);
