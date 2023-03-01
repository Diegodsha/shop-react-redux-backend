import products from "../mocks/products.json"

export const findProductById=(id:string)=>{
    return products.find((product)=> product.id === id)
}