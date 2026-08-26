import axios, { type AxiosResponse } from "axios";
import type { Product, Category } from "../types/types";

const apiClient = axios.create({
  baseURL: "https://fakestoreapi.com",
});

export const fetchProducts = async (): Promise<AxiosResponse<Product[]>> =>
  apiClient.get<Product[]>("/products");

export const fetchCategories = async (): Promise<AxiosResponse<Category[]>> =>
  apiClient.get<Category[]>("/products/categories");
