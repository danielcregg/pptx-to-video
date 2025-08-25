import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

interface ApiKeyConfigProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string | null;
}

export const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ 
  onApiKeySet, 
  currentApiKey 
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!currentApiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      setIsExpanded(false);
    }
  };

  if (!isExpanded && currentApiKey) {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <KeyIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Google AI API Key configured
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-blue-900 flex items-center">
          <KeyIcon className="h-5 w-5 mr-2" />
          Configure Google AI API Key
        </h3>
        <p className="text-sm text-blue-700 mt-1">
          Enter your Google AI Studio API key to generate scripts from slides.{' '}
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-blue-800"
          >
            Get your API key here
          </a>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Google AI API key..."
            className={cn(
              "block w-full pr-12 border border-gray-300 rounded-md px-3 py-2",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "text-sm"
            )}
            required
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showApiKey ? (
              <EyeSlashIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <EyeIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        
        <div className="flex justify-end space-x-3">
          {currentApiKey && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-md",
              apiKey.trim()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            )}
          >
            Save API Key
          </button>
        </div>
      </form>
      
      <div className="mt-3 text-xs text-blue-600">
        <p>🔒 Your API key is stored locally in your browser and never sent to our servers.</p>
      </div>
    </div>
  );
};