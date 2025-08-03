// ************* Managing Adding Product Page Here *************

import { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  
  const [product, setProduct] = useState({
    name: "",
    category: "",
    description: "",
    price: 0,
    stock: 0,
    image: null as File | null,
  });

  const navigate = useNavigate(); // -> For redirection ops

  // -> Handle all change in form inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // -> Handle file change here
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setProduct((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // -> Create a new FormData instance
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", product.category); 
    formData.append("description", product.description);
    formData.append("price", product.price.toString());
    formData.append("stock", product.stock.toString()); 
    
    if (product.image) {
      formData.append("image", product.image); 
    }

    formData.forEach((value, key) => {
      console.log(key, value);
    });

    // -> Post my backend monolith product service
    try {
      const response = await axios.post(
        "http://localhost:3000/products",
        formData
      );

      console.log("Product added successfully:", response.data);

      navigate("/"); 

    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Add New Product</h2>
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
          className="w-40 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2 text-base"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
