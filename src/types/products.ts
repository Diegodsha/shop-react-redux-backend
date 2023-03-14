export interface Product {
id: number | string;
title: string;
description: string;
price: number;
count: number
}

export type ProductList = Product[]

export interface Stock {
    product_id: string;
    count: number;
}