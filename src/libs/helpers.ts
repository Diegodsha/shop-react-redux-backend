export const findProductById=(id:string, table)=>{
    return table.find((item)=> item.id === id)
}

export const joinTables = (tableA: object[], tableB:object[], foreignKeyA:string, foreignKeyB:string, propertyToJoin:string, messageNotFound:string)=>{
    return tableA.map((itemA, idx)=>{
        let findedItem = tableB.find(itemB =>itemB[foreignKeyB] == itemA[foreignKeyA]) || tableB[idx] || {message: messageNotFound}
    
        return{
          ...findedItem,
          [propertyToJoin]: itemA[propertyToJoin]
        }
      })
}