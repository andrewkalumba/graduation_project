"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SetupGuide } from "@/app/components/SetupGuide";

interface SetupPageProps {
  onComplete: () => void;
}

export const SetupPage: React.FC<SetupPageProps> = ({ onComplete }) => {
  const { setSupabaseCredentials, supabaseUrl, supabaseKey } = useAuth();
  const [showGuide, setShowGuide] = useState(false);

  const handleSetupComplete = (url: string, key: string) => {
    setSupabaseCredentials(url, key);
    setShowGuide(false);
    onComplete();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/database.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-teal-900/80 to-blue-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Visubase</h1>
          <p className="text-gray-600">Let's connect to your Supabase project</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">First Time Setup</h3>
            <p className="text-sm text-blue-800 mb-3">
              You'll need to configure your Supabase connection to use Visubase. We'll guide you through every step.
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
              <li>Create/open Supabase project</li>
              <li>Get your Project URL and API Key</li>
              <li>Run 2 simple SQL scripts</li>
              <li>Start designing!</li>
            </ul>
          </div>

          <button
            onClick={() => setShowGuide(true)}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors font-medium shadow-lg"
          >
            🚀 Start Setup Guide
          </button>

          {supabaseUrl && supabaseKey && (
            <div className="text-center">
              <p className="text-sm text-green-600 mb-2">✅ Already configured!</p>
              <button
                onClick={onComplete}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Continue to Login
              </button>
            </div>
          )}
        </div>
      </div>

      {showGuide && (
        <SetupGuide
          onComplete={handleSetupComplete}
          onClose={() => setShowGuide(false)}
        />
      )}
    </div>
  );
};
