// ********* Navbar Operations here (My Account, Shopping Cart Count etc.) - I will make more modular here later *********

import { ShoppingCart, LogIn, UserPlus, LogOut, User } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useEffect, useState } from "react";
import { CartModal } from "../ShoppingCart/CartModal";
import { AuthModal } from "../Auth/AuthModal";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Navbar = () => {
  const logoUrl = "https://i.ibb.co/KsgRyvK/Ekran-g-r-nt-s-2024-12-20-222513-removebg-preview.png";
  const { userId, user, logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const { basketData, getTotalItems, fetchBasket } = useCart();

  useEffect(() => {
    if (userId) {
      fetchBasket();
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  return (
    <>
      <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img src={logoUrl} alt="Logo" className="h-20 transform hover:scale-105 transition-transform duration-200" />
              </Link>
            </div>

            <div className="flex items-center space-x-6">
              {userId ? (
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowAccountMenu(true)}
                      className="flex items-center space-x-2 text-gray-100 hover:text-white transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">My Account</span>
                    </button>

                    {showAccountMenu && (
                      <div
                        className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl py-3 z-50 border border-gray-100 transform transition-all duration-200 ease-out"
                        onMouseEnter={() => setShowAccountMenu(true)}
                        onMouseLeave={() => {
                          setTimeout(() => setShowAccountMenu(false), 200);
                        }}
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">Welcome</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <User className="h-5 w-5 mr-3 text-blue-500" />
                            My Profile
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <svg className="h-5 w-5 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            My Orders
                          </Link>
                          <Link
                            to="/invoices"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <svg className="h-5 w-5 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            My Invoices
                          </Link>
                          <div className="border-t border-gray-100 mt-2">
                            <button
                              onClick={logout}
                              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                            >
                              <LogOut className="h-5 w-5 mr-3" />
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-4 py-2 bg-blue-500 bg-opacity-20 text-blue-100 rounded-lg hover:bg-opacity-30 flex items-center gap-2 transition-all duration-200"
                  >
                    <LogIn className="h-5 w-5" />
                    <span className="font-medium">Login</span>
                  </button>
                  <button
                    onClick={() => setIsSignupOpen(true)}
                    className="px-4 py-2 bg-green-500 bg-opacity-20 text-green-100 rounded-lg hover:bg-opacity-30 flex items-center gap-2 transition-all duration-200"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span className="font-medium">Sign Up</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-100 hover:text-white transition-colors duration-200"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium animate-pulse">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showWelcome && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="w-96 bg-gradient-to-r from-[#1F2937] via-[#0E81FB] to-[#A2D02F] p-6 rounded-lg shadow-xl text-white animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img
                  src="https://www.newmind-neurofeedback-centers.com/images/NewMind-Neurofeedback.png"
                  alt="Welcome Icon"
                  className="h-9 w-9"
                />
                <AlertTitle className="text-2xl font-bold">
                  Welcome {user?.name}!
                </AlertTitle>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-white bg-[#1F2937] hover:bg-opacity-80 rounded-full p-2"
              >
                ✕
              </button>
            </div>
            <AlertDescription className="text-lg">
              We are glad to see you again! Enjoy your shopping experience with
              us.
            </AlertDescription>
            <div className="mt-4">
              <button
                className="w-full bg-white text-[#0E81FB] font-semibold py-2 rounded-lg hover:bg-[#A2D02F] hover:text-white transition duration-300"
                onClick={() => setShowWelcome(false)}
              >
                Start Discover
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        type="login"
      />

      <AuthModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        type="register"
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        basketData={basketData}
      />
    </>
  );
};