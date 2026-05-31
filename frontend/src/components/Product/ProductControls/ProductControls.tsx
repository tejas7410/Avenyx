// ********* Product Controls (Add, Edit, Search buttons etc.) here *********

import { Search, Plus, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

interface ProductControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
}

export const ProductControls = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
}: ProductControlsProps) => {
  const { isAuthenticated, isSeller, isBuyer } = useAuth();

  return (
    <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-black/20 sm:flex-row">
      <div className="w-full sm:w-auto">
        {!isAuthenticated && (
          <p className="text-sm text-slate-300">
            Browse products as a guest, or sign in as a{" "}
            <span className="font-medium text-cyan-300">buyer</span> to purchase.
          </p>
        )}
        {isAuthenticated && isBuyer && (
          <p className="text-sm font-medium text-cyan-300">
            Shopping as a buyer - add items to your cart and checkout.
          </p>
        )}
        {isAuthenticated && isSeller && (
          <p className="text-sm font-medium text-slate-200">
            Seller dashboard - manage your listed products below.
          </p>
        )}
        {selectedCategory !== "all" && (
          <p className="mt-1 text-xs text-slate-400">
            Filtering products in {selectedCategory}
          </p>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
        {isSeller && (
          <div className="flex w-full gap-4 sm:w-auto">
            <Link to="/add-product" className="w-32">
              <button className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 py-2 text-base font-medium text-slate-950 transition-colors duration-200 hover:bg-cyan-400">
                <Plus className="h-5 w-5" /> Add
              </button>
            </Link>

            <Link to="/edit-product" className="w-32">
              <button className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-800 py-2 text-base text-white transition-colors duration-200 hover:bg-slate-700">
                <Edit className="h-5 w-5" /> Edit
              </button>
            </Link>
          </div>
        )}

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 py-2 pl-10 pr-4 text-base text-slate-100 transition-all duration-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
        </div>
      </div>
    </div>
  );
};
