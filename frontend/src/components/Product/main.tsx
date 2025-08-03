// ********* Product main actions here *********

import { useState } from "react";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import { ProductCard } from "./ProductCard/ProductCard";
import { ProductControls } from "./ProductControls/ProductControls";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

function Product() {

  const [searchTerm, setSearchTerm] = useState("");

  const { products, loading, lastProductRef } = useInfiniteScroll();

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
     
      <ProductControls searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
       
        {filteredProducts.map((product, index) => (
           <ProductCard
           key={`${product._id}-${index}`} 
           product={product}
           ref={index === filteredProducts.length - 1 ? lastProductRef : undefined}
         />
        ))}
      </div>

      {loading && <LoadingSpinner />}

    </>
  );
}


export default Product;
