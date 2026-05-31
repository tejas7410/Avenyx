// ********* Product Controls (Add, Edit, Search buttons etc.) here *********

import { Search, Plus, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

interface ProductControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ProductControls = ({
  searchTerm,
  onSearchChange,
}: ProductControlsProps) => {
  const { isAuthenticated, isSeller, isBuyer } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
      <div className="w-full sm:w-auto">
        {!isAuthenticated && (
          <p className="text-gray-600 text-sm">
            Browse products as a guest, or sign in as a{" "}
            <span className="font-medium">buyer</span> to purchase.
          </p>
        )}
        {isAuthenticated && isBuyer && (
          <p className="text-blue-700 text-sm font-medium">
            Shopping as a buyer — add items to your cart and checkout.
          </p>
        )}
        {isAuthenticated && isSeller && (
          <p className="text-gray-700 text-sm font-medium">
            Seller dashboard — manage your listed products below.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        {isSeller && (
          <div className="flex gap-4 w-full sm:w-auto">
            <Link to="/add-product" className="w-32">
              <button className="w-full py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2 text-base">
                <Plus className="h-5 w-5" /> Add
              </button>
            </Link>

            <Link to="/edit-product" className="w-32">
              <button className="w-full py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2 text-base">
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-base"
          />
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
    </div>
  );
};
