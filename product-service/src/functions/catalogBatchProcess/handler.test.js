
import AWS from 'aws-sdk-mock'
import ProductsController from '../../Controllers/index'
import {handler} from './handler'

// const create = new ProductsController().create

jest.mock('../../Controllers/index', () => ({
    create: jest.fn(),
}))

describe('catalog-batch-process', () => {
    test('should notify sns if product created', async () => {
        AWS.mock('SNS', 'publish', () => console.log('notify'));

        const result = await handler({ Records: [{ body: '{"a": 1}' }, { body: '{"b": 2}' }] });

        expect(create).toHaveBeenCalledTimes(2);

        expect(result.statusCode).toEqual(200);
    })
})