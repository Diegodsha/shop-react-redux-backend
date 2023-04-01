const dynamo = new DynamoDB.DocumentClient();
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Product, Stock } from 'src/types/products';
import { joinTables } from '@libs/helpers';

class ProductsController {
  scan = async () => {
    const productPromise = dynamo
      .scan({
        TableName: process.env.PRODUCTS_TABLE,
      })
      .promise();

    const stocksPromise = dynamo
      .scan({
        TableName: process.env.STOCKS_TABLE,
      })
      .promise();

    const [
      {
        value: { Items: productsItems },
      },
      {
        value: { Items: stocksItems },
      },
    ] = (await Promise.allSettled([
      productPromise,
      stocksPromise,
    ])) as unknown as [
      { value: { Items: Product[] } },
      { value: { Items: Stock[] } }
    ];

    console.log(productsItems);
    let joinedStocksProducts = joinTables(
      stocksItems,
      productsItems,
      'product_id',
      'id',
      'count',
      'Product with this id is not in the list'
    );

    return joinedStocksProducts;
  };

  scanById = async (id) => {
    const productPromise = dynamo
      .get({
        TableName: process.env.PRODUCTS_TABLE,
        Key: { id: id },
      })
      .promise();

    const stocksPromise = dynamo
      .get({
        TableName: process.env.STOCKS_TABLE,
        Key: { product_id: id },
      })
      .promise();

    const [
      {
        value: { Item: productItem },
      },
      {
        value: { Item: stockItem },
      },
    ] = (await Promise.allSettled([
      productPromise,
      stocksPromise,
    ])) as unknown as [
      { value: { Item: Product } },
      { value: { Item: Stock } }
    ];

    if (!productItem || !stockItem) {
      return;
    }

    return {
      ...productItem,
      count: stockItem.count,
    };
  };

  async create(data) {
    const id = uuidv4();

    if (!data.title || !data.price || !data.description || !data.count) {
      return null;
    }

    await dynamo
      .transactWrite({
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
      })
      .promise();

    return { ...data, id: id };
  }
}

export default ProductsController;
