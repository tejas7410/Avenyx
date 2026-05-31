// ************* I created this hook for infinite scroll logic (dynamic pagination) *************

import { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from "../types/main"
import { API_URLS } from "../config/api";

export const useInfiniteScroll = () => {
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastProductRef = useCallback((node: HTMLDivElement) => {
    
    // -> 'hasMore' is coming from backend mean still more item to fetch not last
    if (loading || !hasMore) return;

    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);


  // -> Fetching products from backend with page and limit is 10 here
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URLS.monolith}/products?page=${page}&limit=10`
      );
      const data = await response.json();

      if (!response.ok) {
        if (page === 1) {
          setProducts([]);
        }
        setHasMore(false);
        return;
      }

      const incomingProducts: Product[] = data.products ?? [];

      setProducts((prev) => {
        const newProducts = incomingProducts.filter(
          (product) =>
            !prev.some((existingProduct) => existingProduct._id === product._id)
        );
        return [...prev, ...newProducts];
      });

      setHasMore(data.pagination?.hasMore ?? false);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (page === 1) {
        setProducts([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
    return () => observer.current?.disconnect();
  }, [page]);

  return { products, loading, hasMore, lastProductRef };
};