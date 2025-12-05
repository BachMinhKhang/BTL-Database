import apiClient from "./api";

export const getAllProducts = async (
  keyword = "",
  minPrice = "",
  maxPrice = ""
) => {
  const response = await apiClient.get("/products", {
    params: {
      keyword,
      minPrice,
      maxPrice,
    },
  });
  return response.data;
};

export const getBestSellers = async () => {
  const response = await apiClient.get("/products/bestsellers");
  return response.data;
};
