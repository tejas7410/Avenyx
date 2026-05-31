// ********* Product main actions here *********

import { useState } from "react";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import { ProductCard } from "./ProductCard/ProductCard";
import { ProductControls } from "./ProductControls/ProductControls";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { CategorySection } from "./CategorySection/CategorySection";

function Product() {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { products, loading, lastProductRef } = useInfiniteScroll();

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <CategorySection
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
     
      <ProductControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 && !loading ? (
          <div className="col-span-full rounded-lg border border-slate-800 bg-slate-900 py-16 text-center text-slate-400">
            <p className="text-lg font-medium text-slate-200">No products found</p>
            <p className="mt-2 text-sm">
              Try another search term or category.
            </p>
          </div>
        ) : (
          filteredProducts.map((product, index) => (
            <ProductCard
              key={`${product._id}-${index}`}
              product={product}
              ref={
                index === filteredProducts.length - 1
                  ? lastProductRef
                  : undefined
              }
            />
          ))
        )}
      </div>

      {loading && <LoadingSpinner />}

    </>
  );
}


export default Product;
