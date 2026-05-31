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
  allowAdmin = false,
}: {
  role: UserRole;
  onChange: (role: UserRole) => void;
  allowAdmin?: boolean;
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-300">
      I am a
    </label>
    <div className={`grid ${allowAdmin ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
      <button
        type="button"
        onClick={() => onChange("buyer")}
        className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors ${
          role === "buyer"
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-slate-950 text-slate-200 border-slate-700 hover:bg-slate-800"
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
            : "bg-slate-950 text-slate-200 border-slate-700 hover:bg-slate-800"
        }`}
      >
        Seller
        <span className="block text-xs font-normal mt-1 opacity-80">
          List and manage products
        </span>
      </button>
      {allowAdmin && (
        <button
          type="button"
          onClick={() => onChange("admin")}
          className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors ${
            role === "admin"
              ? "bg-emerald-700 text-white border-emerald-700"
              : "bg-slate-950 text-slate-200 border-slate-700 hover:bg-slate-800"
          }`}
        >
          Admin
          <span className="block text-xs font-normal mt-1 opacity-80">
            Monitor platform
          </span>
        </button>
      )}
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
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl shadow-black/40">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {type === "login" ? "Login" : "Sign Up"}
          </h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-800">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-900/60 bg-red-950/70 p-3 text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <RoleSelector
            role={role}
            onChange={setRole}
            allowAdmin={type === "login"}
          />

          {type === "register" && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={(formData as typeof emptyRegisterForm).name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 shadow-sm"
                  minLength={2}
                  required
                />
              </div>

              <div>
                <label htmlFor="surname" className="block text-sm font-medium text-slate-300">
                  Surname
                </label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={(formData as typeof emptyRegisterForm).surname}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 shadow-sm"
                  minLength={2}
                  required
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 shadow-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 shadow-sm"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
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
