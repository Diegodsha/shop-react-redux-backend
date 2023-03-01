export interface Product {
id: number | string;
title: string;
description?: string;
price: number;
}

export type ProductList = Product[]