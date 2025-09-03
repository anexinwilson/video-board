import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "../../components/Layout";
import backendApi from "../../api/backendApi";

interface ResetPasswordEmailResponse {
  success: true;
  message: string;
}

const ResetPasswordEmail = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await backendApi.post<ResetPasswordEmailResponse>(
        "/api/v1/auth/reset-password",
        { email }
      );
      if (data.success) {
        toast.success(data.message);
        setEmail("");
        navigate("/sign-in");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Reset Your Password
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 bg-blue-500 text-white font-bold rounded-md shadow-md transition duration-300
              disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center ${
                loading ? "bg-opacity-90" : "hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Not a member yet?</span>{" "}
            <Link
              to="/sign-up"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordEmail;
