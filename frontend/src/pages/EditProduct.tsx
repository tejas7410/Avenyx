// ************* Managing Edit Product Page Here *************

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";

const EditProduct = () => {
  const [products, setProducts] = useState<any[]>([]);

  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const [product, setProduct] = useState({
    name: "",
    category: "",
    description: "",
    price: 0,
    stock: 0,
    image: null as File | null,
  });

  // -> In my scenario I m choosing which product will be edited from drop down so fetching products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/products");

        const { products } =response.data;
        
        setProducts(products);

      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // -> Fetch the selected product details when product is selected from the dropdown
    const fetchProduct = async () => {
      if (selectedProductId) {
        try {
          const response = await axios.get(
            `http://localhost:3000/products/${selectedProductId}`
          );
          setProduct({
            name: response.data.name,
            category: response.data.category,
            description: response.data.description,
            price: response.data.price,
            stock: response.data.stock,
            image: null,
          });
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      }
    };

    fetchProduct();
  }, [selectedProductId]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(e.target.value);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setProduct((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: FormEvent) => {
    
    e.preventDefault();

    // -> Init form
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", product.category);
    formData.append("description", product.description);
    formData.append("price", product.price.toString());
    formData.append("stock", product.stock.toString());
    if (product.image) {
      formData.append("image", product.image);
    }

    try {
      const response = await axios.put(
        `http://localhost:3000/products/${selectedProductId}`,
        formData
      );

      console.log("Product updated successfully:", response.data);
  
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Edit Product</h2>

      {/* Dropdown to select product */}
      <div className="mb-4">
        <label className="block text-gray-700" htmlFor="product-select">
          Select Product
        </label>
        <select
          id="product-select"
          name="product-select"
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
      </div>

      {/* Form to edit product details */}
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
            <input
              id="category"
              name="category"
              type="text"
              value={product.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
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
              value={product.stock}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="image">
              Image
            </label>
            <input
              id="image"
              name="image"
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md"
          >
            Update Product
          </button>
        </form>
      )}
    </div>
  );
};

export default EditProduct;
