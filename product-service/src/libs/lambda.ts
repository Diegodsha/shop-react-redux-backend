import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import httpHeaderNormalizer from '@middy/http-header-normalizer'


export const middyfy = (handler) => {
  return middy(handler).use(middyJsonBodyParser()).use(httpHeaderNormalizer())
}
