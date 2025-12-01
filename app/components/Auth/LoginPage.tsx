"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { useMutation } from "@tanstack/react-query";

interface LoginPageProps {
  onSwitchToSignup: () => void;
  onSwitchToSetup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup, onSwitchToSetup }) => {
  const { signIn, supabaseUrl, supabaseKey } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await signIn(data.email, data.password);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  const hasCredentials = supabaseUrl && supabaseKey;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-2 sm:p-4">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/database2.jpg)' }} >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-pink-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Visubase</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">3D Database Schema Designer</p>
        </div>

        {/* Credentials Warning */}
        {!hasCredentials && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs sm:text-sm text-yellow-800 mb-2">
              ⚠️ Supabase not configured
            </p>
            <button
              onClick={onSwitchToSetup}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Click here to set up Supabase connection
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="you@example.com"
              disabled={!hasCredentials || loginMutation.isPending}
            />
            {errors.email && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="••••••••"
              disabled={!hasCredentials || loginMutation.isPending}
            />
            {errors.password && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {loginMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {loginMutation.error.message}
            </div>
          )}

          {loginMutation.isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              ✅ Login successful! Redirecting...
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending || !hasCredentials}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              className="text-blue-600 hover:text-blue-800 font-medium"
              disabled={!hasCredentials}
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Setup Link */}
        {!hasCredentials && (
          <div className="mt-4 text-center">
            <button
              onClick={onSwitchToSetup}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              🔧 Configure Supabase
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
