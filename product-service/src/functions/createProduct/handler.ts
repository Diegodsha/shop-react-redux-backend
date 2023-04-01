import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import ProductsController from 'src/Controllers';
import schema from './schema';

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { productData } = event.body;

  console.log(productData);

  try {
    const product = new ProductsController();
    const newProduct = await product.create(productData);

    if (!newProduct) {
      return formatJSONResponse(
        {
          message: `Product not created due to missing properties, check if you included title, description, count, price, and try again`,
        },
        400
      );
    }

    return formatJSONResponse(newProduct, 200);
  } catch (error) {
    return formatJSONResponse(
      { message: `Product not created ${error.message}` },
      500
    );
  }
};

export const main = middyfy(createProduct);
