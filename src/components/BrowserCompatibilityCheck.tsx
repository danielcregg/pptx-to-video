import React, { useEffect, useState } from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface CompatibilityInfo {
  isCompatible: boolean;
  issues: string[];
  recommendations: string[];
}

export const BrowserCompatibilityCheck: React.FC = () => {
  const [compatibility, setCompatibility] = useState<CompatibilityInfo | null>(null);

  useEffect(() => {
    const checkCompatibility = (): CompatibilityInfo => {
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check SharedArrayBuffer support
      if (typeof SharedArrayBuffer === 'undefined') {
        issues.push('SharedArrayBuffer is not available');
        recommendations.push('Use HTTPS and ensure proper security headers are set');
      }

      // Check cross-origin isolation
      if (!crossOriginIsolated) {
        issues.push('Cross-origin isolation is not enabled');
        recommendations.push('Serve your site with Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy headers');
      }

      // Check if we're in a secure context
      if (!window.isSecureContext) {
        issues.push('Not running in a secure context');
        recommendations.push('Use HTTPS instead of HTTP');
      }

      // Check browser support for modern features
      if (!window.Worker) {
        issues.push('Web Workers are not supported');
        recommendations.push('Use a modern browser that supports Web Workers');
      }

      return {
        isCompatible: issues.length === 0,
        issues,
        recommendations
      };
    };

    setCompatibility(checkCompatibility());
  }, []);

  if (!compatibility) return null;

  if (compatibility.isCompatible) {
    return (
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm text-green-800 font-medium">
            Browser is compatible with video processing
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            Browser Compatibility Issues Detected
          </h3>
          
          <div className="text-sm text-yellow-700 space-y-2">
            <div>
              <p className="font-medium">Issues:</p>
              <ul className="list-disc list-inside ml-2">
                {compatibility.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <p className="font-medium">Recommendations:</p>
              <ul className="list-disc list-inside ml-2">
                {compatibility.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-yellow-600">
            <p>
              Video processing may not work properly. Consider using a different browser or hosting environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};