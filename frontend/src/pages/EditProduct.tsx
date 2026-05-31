// ************* Managing Edit Product Page Here *************

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URLS, apiClient } from "../config/api";

const PRODUCT_CATEGORIES = [
  "Monitor",
  "Keyboard",
  "Mouse",
  "RAM",
  "Graphic Card",
  "Motherboard",
  "Processor",
];

const EditProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    category: PRODUCT_CATEGORIES[0],
    description: "",
    price: "",
    stock: "",
    image: null as File | null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get(
          `${API_URLS.monolith}/products/seller/me`
        );
        setProducts(response.data.products ?? []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load your products");
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (selectedProductId) {
        try {
          const response = await apiClient.get(
            `${API_URLS.monolith}/products/${selectedProductId}`
          );
          setProduct({
            name: response.data.name,
            category: response.data.category,
            description: response.data.description,
            price: String(response.data.price),
            stock: String(response.data.stock),
            image: null,
          });
        } catch (err) {
          console.error("Error fetching product:", err);
        }
      }
    };

    fetchProduct();
  }, [selectedProductId]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(e.target.value);
    setError("");
    setSuccess("");
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setProduct((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", product.category);
    formData.append("description", product.description);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    if (product.image) {
      formData.append("image", product.image);
    }

    try {
      await apiClient.put(
        `${API_URLS.monolith}/products/${selectedProductId}`,
        formData
      );

      setSuccess("Product updated successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to update product");
      } else {
        setError("Failed to update product");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-2">Edit My Products</h2>
      <p className="text-gray-600 mb-6 text-sm">
        You can only edit products that you listed.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700" htmlFor="product-select">
          Select Your Product
        </label>
        <select
          id="product-select"
          name="product-select"
          value={selectedProductId}
          onChange={handleSelectChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a product...</option>
          {products.map((productItem) => (
            <option key={productItem._id} value={productItem._id}>
              {productItem.name}
            </option>
          ))}
        </select>
        {products.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            You have not listed any products yet.
          </p>
        )}
      </div>

      {selectedProductId && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="name">
              Product Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={product.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={product.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="description">
              Description
            </label>
            <input
              id="description"
              name="description"
              type="text"
              value={product.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="price">
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={product.price}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="stock">
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={product.stock}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="image">
              New Image (optional)
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </button>
        </form>
      )}
    </div>
  );
};

export default EditProduct;
