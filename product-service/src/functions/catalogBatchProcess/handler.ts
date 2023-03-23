import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

const createProduct = async (event) => {

  const {productData} = event.body


  try {

    return formatJSONResponse({},200);
  } catch (error) {
    
    return formatJSONResponse({message:`Product not created ${error.message}`},500);
  }

};

export const main = middyfy(createProduct);