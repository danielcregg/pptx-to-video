import React from 'react';
import { PencilIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import type { Slide } from '../store/appStore';
import { cn } from '../utils/cn';

interface SlideEditorProps {
  slides: Slide[];
  onScriptChange: (slideId: string, script: string) => void;
  onGenerateScripts: () => void;
  onGenerateAudio: () => void;
  isGeneratingScripts?: boolean;
  isGeneratingAudio?: boolean;
  canGenerateScripts?: boolean;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slides,
  onScriptChange,
  onGenerateScripts,
  onGenerateAudio,
  isGeneratingScripts = false,
  isGeneratingAudio = false,
  canGenerateScripts = false
}) => {
  const hasAnyScripts = slides.some(slide => slide.script && slide.script.trim() !== '');
  const hasAllAudio = slides.every(slide => slide.audioUrl);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Edit Scripts & Generate Audio
        </h2>
        <p className="text-gray-600">
          Review and edit the generated scripts, then create audio narration for each slide.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={onGenerateScripts}
          disabled={!canGenerateScripts || isGeneratingScripts}
          className={cn(
            "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md",
            canGenerateScripts && !isGeneratingScripts
              ? "text-white bg-blue-600 hover:bg-blue-700"
              : "text-gray-400 bg-gray-200 cursor-not-allowed"
          )}
        >
          {isGeneratingScripts ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Scripts...
            </>
          ) : (
            <>
              <PencilIcon className="h-4 w-4 mr-2" />
              Generate Scripts with AI
            </>
          )}
        </button>

        <button
          onClick={onGenerateAudio}
          disabled={!hasAnyScripts || isGeneratingAudio}
          className={cn(
            "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md",
            hasAnyScripts && !isGeneratingAudio
              ? "text-white bg-green-600 hover:bg-green-700"
              : "text-gray-400 bg-gray-200 cursor-not-allowed"
          )}
        >
          {isGeneratingAudio ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Audio...
            </>
          ) : (
            <>
              <SpeakerWaveIcon className="h-4 w-4 mr-2" />
              Generate Audio ({slides.filter(s => s.audioUrl).length}/{slides.length})
            </>
          )}
        </button>
      </div>

      {/* Slides Grid */}
      <div className="grid gap-6">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
          >
            <div className="md:flex">
              {/* Slide Image */}
              <div className="md:flex-shrink-0 md:w-80">
                <div className="relative">
                  <img
                    src={slide.imageUrl}
                    alt={`Slide ${index + 1}`}
                    className="h-48 w-full object-contain bg-gray-50 md:h-full"
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-medium">
                    Slide {index + 1}
                  </div>
                  {slide.audioUrl && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded">
                      <SpeakerWaveIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Script Editor */}
              <div className="p-6 flex-1">
                <div className="mb-4">
                  <label
                    htmlFor={`script-${slide.id}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Narration Script
                  </label>
                  <textarea
                    id={`script-${slide.id}`}
                    value={slide.script}
                    onChange={(e) => onScriptChange(slide.id, e.target.value)}
                    placeholder="Enter the narration script for this slide..."
                    className={cn(
                      "block w-full border border-gray-300 rounded-md px-3 py-2",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      "text-sm resize-none"
                    )}
                    rows={4}
                  />
                </div>

                {/* Audio Preview */}
                {slide.audioUrl && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audio Preview
                    </label>
                    <audio
                      controls
                      src={slide.audioUrl}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Character Count */}
                <div className="mt-2 text-xs text-gray-500">
                  {slide.script.length} characters • ~{Math.ceil(slide.script.split(' ').length / 150)} min read
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      {slides.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Progress Summary</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div>📝 Scripts: {slides.filter(s => s.script.trim()).length}/{slides.length} completed</div>
            <div>🔊 Audio: {slides.filter(s => s.audioUrl).length}/{slides.length} generated</div>
            {hasAllAudio && (
              <div className="text-green-600 font-medium">✅ Ready to create video!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};