// ********* With click login-signup modal operations here *********

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserRole } from "../../types/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register";
}

const emptyLoginForm = { email: "", password: "" };
const emptyRegisterForm = {
  name: "",
  surname: "",
  email: "",
  password: "",
};

const RoleSelector = ({
  role,
  onChange,
}: {
  role: UserRole;
  onChange: (role: UserRole) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      I am a
    </label>
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange("buyer")}
        className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors ${
          role === "buyer"
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
      >
        Buyer
        <span className="block text-xs font-normal mt-1 opacity-80">
          Browse and purchase
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange("seller")}
        className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors ${
          role === "seller"
            ? "bg-gray-800 text-white border-gray-800"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
      >
        Seller
        <span className="block text-xs font-normal mt-1 opacity-80">
          List and manage products
        </span>
      </button>
    </div>
  </div>
);

export const AuthModal = ({ isOpen, onClose, type }: AuthModalProps) => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<UserRole>("buyer");
  const [formData, setFormData] = useState(
    type === "login" ? emptyLoginForm : emptyRegisterForm
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(type === "login" ? emptyLoginForm : emptyRegisterForm);
      setRole("buyer");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (type === "login") {
        await login({
          email: formData.email.trim(),
          password: formData.password,
          role,
        });
      } else {
        const registerData = formData as typeof emptyRegisterForm;
        await signup({
          name: registerData.name.trim(),
          surname: registerData.surname.trim(),
          email: registerData.email.trim(),
          password: registerData.password,
          role,
        });
      }
      onClose();
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {type === "login" ? "Login" : "Sign Up"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <RoleSelector role={role} onChange={setRole} />

          {type === "register" && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={(formData as typeof emptyRegisterForm).name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                  minLength={2}
                  required
                />
              </div>

              <div>
                <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
                  Surname
                </label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={(formData as typeof emptyRegisterForm).surname}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                  minLength={2}
                  required
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {isSubmitting
              ? "Please wait..."
              : type === "login"
                ? `Login as ${role}`
                : `Sign up as ${role}`}
          </button>
        </form>
      </div>
    </div>
  );
};
