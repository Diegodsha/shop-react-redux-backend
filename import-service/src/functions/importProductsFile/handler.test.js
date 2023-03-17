import { AWS } from 'aws-sdk-mock';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { importProductsFile as handler } from './handler';
import { formatJSONResponse } from '@libs/api-gateway';

jest.mock('../../libs/api-gateway', () => ({
  formatJSONResponse: jest.fn(),
}));

AWS?.mock('S3', 'getSignedUrl', function (method, params, callback) {
  callback(null, 'https://aws:s3:test.csv');
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('import', () => {
  test('should return error if name is not passed', async () => {
    await handler({ queryStringParameters: { name: '' } });

    expect(formatJSONResponse).toHaveBeenCalledWith(
      {
        message: 'name param is not valid or missing',
      },
      404
    );
  });

  test('should be called', async () => {
    const name = 'test.csv';
    await handler({ queryStringParameters: { name } });

    expect(getSignedUrl).toHaveBeenCalled();
  });
});
