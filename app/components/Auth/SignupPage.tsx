"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "@/lib/validations/auth";
import { useMutation } from "@tanstack/react-query";

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onSwitchToSetup: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin, onSwitchToSetup }) => {
  const { signUp, supabaseUrl, supabaseKey } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupInput) => {
      const result = await signUp(data.email, data.password, data.fullName);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    },
    onSuccess: () => {
      // User is now logged in, setup page will redirect to app automatically
    },
  });

  const onSubmit = (data: SignupInput) => {
    signupMutation.mutate(data);
  };

  const hasCredentials = supabaseUrl && supabaseKey;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-2 sm:p-4">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/database3.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-red-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md w-full max-h-[95vh] overflow-y-auto">
        {/* Logo/Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Create Account</h1>
          <p className="text-sm sm:text-base text-gray-600">Join Visubase today</p>
        </div>

        {/* Credentials Warning */}
        {!hasCredentials && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">
              ⚠️ Supabase not configured
            </p>
            <button
              onClick={onSwitchToSetup}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Click here to set up Supabase connection
            </button>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              {...register("fullName")}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.fullName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-purple-500"
              }`}
              placeholder="John Doe"
              disabled={!hasCredentials || signupMutation.isPending}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

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
                  : "border-gray-300 focus:ring-purple-500"
              }`}
              placeholder="you@example.com"
              disabled={!hasCredentials || signupMutation.isPending}
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
                  : "border-gray-300 focus:ring-purple-500"
              }`}
              placeholder="••••••••"
              disabled={!hasCredentials || signupMutation.isPending}
            />
            {errors.password && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password.message}</p>
            )}
            {!errors.password && (
              <p className="text-xs text-gray-500 mt-1">Must contain uppercase, lowercase, and number (min 6 characters)</p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-purple-500"
              }`}
              placeholder="••••••••"
              disabled={!hasCredentials || signupMutation.isPending}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {signupMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {signupMutation.error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={signupMutation.isPending || !hasCredentials}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {signupMutation.isPending ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Creating account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Setup Link */}
        {!hasCredentials && (
          <div className="mt-4 text-center">
            <button
              onClick={onSwitchToSetup}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              🔧 Configure Supabase
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
