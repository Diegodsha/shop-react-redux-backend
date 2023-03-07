// import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { findProductById } from '@libs/helpers';
import { middyfy } from '@libs/lambda';

// import schema from './schema';

const createProduct = async (event) => {
  const { id } = event.pathParameters;

  return formatJSONResponse(findProductById(id));
};

export const main = middyfy(createProduct);