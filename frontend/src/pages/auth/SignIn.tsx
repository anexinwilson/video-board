import React, { useState } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import type { AuthFormData } from "../../types";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../reducers/auth/store";
import { signInUser } from "../../reducers/auth/authReducer";

const SignIn = () => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
  });
  const dispatch = useDispatch<AppDispatch>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {email,password} = formData
    dispatch(signInUser({email,password}))
    // console.log(formData.email, formData.password);
  };

  return (
    <Layout>
      <div className="flex items-center justify-center p-4 w-full">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Join Us Today
          </h1>
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-sky-400 text-white font-bold rounded-md shadow-md transition duration-300 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center cursor: pointer "
            >
              Sign In
            </button>
          </form>
          <Link
            to="/sign-up"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-all duration-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
