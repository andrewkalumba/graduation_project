"use client";

import React, { useState } from "react";
import { toast } from "sonner";

interface SetupGuideProps {
  onComplete: (url: string, key: string) => void;
  onClose: () => void;
}

export const SetupGuide: React.FC<SetupGuideProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [sqlStep1Done, setSqlStep1Done] = useState(false);
  const [sqlStep2Done, setSqlStep2Done] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (supabaseUrl && supabaseKey && sqlStep1Done && sqlStep2Done) {
      onComplete(supabaseUrl, supabaseKey);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">🚀 Connect to Supabase - Easy Setup</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    step <= currentStep ? "bg-white" : "bg-white bg-opacity-30"
                  }`}
                />
                <p className="text-xs mt-1 text-center">
                  Step {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Create/Open Supabase Project */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  📁 Step 1: Open Your Supabase Project
                </h3>
                <p className="text-gray-700">
                  Let's get your Supabase project ready!
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Go to Supabase
                  </h4>
                  <p className="text-gray-600 mb-3">
                    Open your web browser and go to:
                  </p>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm flex items-center justify-between">
                    <span>https://supabase.com</span>
                    <button
                      onClick={() => window.open("https://supabase.com", "_blank")}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                      Open →
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    Sign In or Sign Up
                  </h4>
                  <ul className="text-gray-600 space-y-2 ml-8 list-disc">
                    <li>Click <strong>"Sign In"</strong> in the top right corner</li>
                    <li>If you don't have an account, click <strong>"Sign Up"</strong></li>
                    <li>You can use GitHub, Google, or Email</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                    Create or Select a Project
                  </h4>
                  <ul className="text-gray-600 space-y-2 ml-8 list-disc">
                    <li><strong>New Project:</strong> Click <strong>"New Project"</strong> button</li>
                    <li><strong>Existing Project:</strong> Click on your project name from the list</li>
                    <li>Wait for the project to finish setting up (takes ~2 minutes for new projects)</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    ✅ Once you're inside your Supabase project dashboard, click Next!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Get URL and API Key */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  🔑 Step 2: Get Your Project Credentials
                </h3>
                <p className="text-gray-700">
                  We need two things: your Project URL and API Key
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Open Project Settings
                  </h4>
                  <ul className="text-gray-600 space-y-2 ml-8 list-disc">
                    <li>Look at the left sidebar in your Supabase dashboard</li>
                    <li>Scroll down and click the <strong>⚙️ "Settings"</strong> icon (gear icon at the bottom)</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    Go to API Settings
                  </h4>
                  <ul className="text-gray-600 space-y-2 ml-8 list-disc">
                    <li>In Settings, click <strong>"API"</strong> from the menu</li>
                    <li>You'll see a page with your project credentials</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                    Copy Your Project URL
                  </h4>
                  <p className="text-gray-600 mb-3">
                    Look for the section called <strong>"Project URL"</strong>
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                    <p className="text-sm text-yellow-800">
                      It looks like: <code className="bg-white px-2 py-1 rounded">https://xxxxx.supabase.co</code>
                    </p>
                  </div>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="Paste your Project URL here"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
                    Copy Your Anon/Public Key
                  </h4>
                  <p className="text-gray-600 mb-3">
                    Scroll down to <strong>"Project API keys"</strong> section
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                    <p className="text-sm text-yellow-800 mb-2">
                      Copy the <strong>"anon" "public"</strong> key (NOT the "service_role" key!)
                    </p>
                    <p className="text-xs text-yellow-700">
                      It's a long string starting with: <code className="bg-white px-2 py-1 rounded">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code>
                    </p>
                  </div>
                  <textarea
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="Paste your Anon/Public Key here"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    rows={3}
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    {supabaseUrl && supabaseKey ? (
                      "✅ Great! Both credentials entered. Click Next!"
                    ) : (
                      "⏳ Enter both URL and Key above, then click Next"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Run SQL Script 1 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  💾 Step 3: Run Setup SQL (Part 1 of 2)
                </h3>
                <p className="text-gray-700">
                  We need to run 2 SQL scripts in your Supabase database. Let's do the first one!
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Open SQL Editor
                  </h4>
                  <ul className="text-gray-600 space-y-2 ml-8 list-disc">
                    <li>In your Supabase dashboard, look at the left sidebar</li>
                    <li>Click on <strong>🗄️ "SQL Editor"</strong></li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    Create New Query
                  </h4>
                  <ul className="text-gray-600 space-y-2 ml-8 list-disc">
                    <li>Click the <strong>"New Query"</strong> button (usually at the top)</li>
                    <li>A blank editor will appear</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                    Copy This SQL Script
                  </h4>
                  <p className="text-gray-600 mb-3">
                    Click the button below to copy the SQL code:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query;
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;`}</pre>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)\nRETURNS JSONB\nLANGUAGE plpgsql\nSECURITY DEFINER\nAS $$\nDECLARE\n  result JSONB;\nBEGIN\n  EXECUTE sql_query;\n  RETURN jsonb_build_object('success', true);\nEXCEPTION\n  WHEN OTHERS THEN\n    RETURN jsonb_build_object('success', false, 'error', SQLERRM);\nEND;\n$$;`,
                        "SQL Script 1"
                      )
                    }
                    className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    📋 Copy SQL Script 1
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
                    Paste and Run
                  </h4>
                  <ul className="text-gray-600 space-y-2 ml-8 list-disc">
                    <li>Paste the copied SQL into the editor</li>
                    <li>Click the <strong>"RUN"</strong> button (or press Ctrl+Enter / Cmd+Enter)</li>
                    <li>You should see <strong>"Success. No rows returned"</strong></li>
                  </ul>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sqlStep1Done}
                      onChange={(e) => setSqlStep1Done(e.target.checked)}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="text-gray-800 font-medium">
                      ✅ I ran the SQL and it was successful
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Run SQL Script 2 */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  💾 Step 4: Run Setup SQL (Part 2 of 2)
                </h3>
                <p className="text-gray-700">
                  Last step! One more SQL script and you're done!
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Copy Second SQL Script
                  </h4>
                  <p className="text-gray-600 mb-3">
                    Still in the SQL Editor, click to copy this second script:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-64 overflow-y-auto">
                    <pre>{`CREATE TABLE IF NOT EXISTS public.schemas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schemas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON public.schemas
FOR ALL USING (true);`}</pre>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `CREATE TABLE IF NOT EXISTS public.schemas (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  name TEXT UNIQUE NOT NULL,\n  data JSONB NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nALTER TABLE public.schemas ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY "Allow all operations" ON public.schemas \nFOR ALL USING (true);`,
                        "SQL Script 2"
                      )
                    }
                    className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    📋 Copy SQL Script 2
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    Paste and Run
                  </h4>
                  <ul className="text-gray-600 space-y-2 ml-8 list-disc">
                    <li>Clear the previous SQL or create a new query</li>
                    <li>Paste this second SQL script</li>
                    <li>Click <strong>"RUN"</strong> again</li>
                    <li>You should see <strong>"Success"</strong> message</li>
                  </ul>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sqlStep2Done}
                      onChange={(e) => setSqlStep2Done(e.target.checked)}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="text-gray-800 font-medium">
                      ✅ I ran the second SQL and it was successful
                    </span>
                  </label>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-green-800 mb-2">
                    🎉 You're All Set!
                  </h4>
                  <p className="text-gray-700 mb-4">
                    Once both SQL scripts run successfully, click "Finish Setup" below to connect Visubase to your Supabase project!
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className={sqlStep1Done ? "text-green-600" : "text-gray-400"}>
                      {sqlStep1Done ? "✅" : "⏳"} SQL Script 1
                    </div>
                    <div className={sqlStep2Done ? "text-green-600" : "text-gray-400"}>
                      {sqlStep2Done ? "✅" : "⏳"} SQL Script 2
                    </div>
                    <div className={supabaseUrl && supabaseKey ? "text-green-600" : "text-gray-400"}>
                      {supabaseUrl && supabaseKey ? "✅" : "⏳"} Credentials
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
          >
            ← Back
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 2 && (!supabaseUrl || !supabaseKey)) ||
                (currentStep === 3 && !sqlStep1Done)
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!supabaseUrl || !supabaseKey || !sqlStep1Done || !sqlStep2Done}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              🎉 Finish Setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
