import React from 'react';
import { VideoCameraIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import type { Slide } from '../store/appStore';
import { cn } from '../utils/cn';

interface VideoCreatorProps {
  slides: Slide[];
  videoUrl?: string | null;
  onCreateVideo: () => void;
  onDownloadVideo: () => void;
  isCreatingVideo?: boolean;
  videoProgress?: number;
}

export const VideoCreator: React.FC<VideoCreatorProps> = ({
  slides,
  videoUrl,
  onCreateVideo,
  onDownloadVideo,
  isCreatingVideo = false,
  videoProgress = 0
}) => {
  const hasAllAudio = slides.every(slide => slide.audioUrl);
  const canCreateVideo = slides.length > 0 && hasAllAudio && !isCreatingVideo;

  const formatProgress = (progress: number) => {
    return Math.round(progress * 100);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Your Video
        </h2>
        <p className="text-gray-600">
          Combine your slides and audio into a final video presentation.
        </p>
      </div>

      {/* Video Preview */}
      {videoUrl && (
        <div className="mb-8">
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              controls
              src={videoUrl}
              className="w-full h-auto"
              poster={slides[0]?.imageUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Action Section */}
      <div className="text-center">
        {!videoUrl ? (
          <div className="space-y-6">
            {/* Prerequisites Check */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Video Requirements
              </h3>
              <div className="space-y-2 text-sm">
                <div className={cn(
                  "flex items-center justify-center",
                  slides.length > 0 ? "text-green-600" : "text-gray-400"
                )}>
                  <span className="mr-2">{slides.length > 0 ? "✅" : "⭕"}</span>
                  Slides loaded ({slides.length} slides)
                </div>
                <div className={cn(
                  "flex items-center justify-center",
                  hasAllAudio ? "text-green-600" : "text-gray-400"
                )}>
                  <span className="mr-2">{hasAllAudio ? "✅" : "⭕"}</span>
                  Audio generated ({slides.filter(s => s.audioUrl).length}/{slides.length} slides)
                </div>
              </div>
            </div>

            {/* Create Video Button */}
            <button
              onClick={onCreateVideo}
              disabled={!canCreateVideo}
              className={cn(
                "inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg",
                canCreateVideo
                  ? "text-white bg-purple-600 hover:bg-purple-700 shadow-lg"
                  : "text-gray-400 bg-gray-200 cursor-not-allowed"
              )}
            >
              {isCreatingVideo ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Video... {formatProgress(videoProgress)}%
                </>
              ) : (
                <>
                  <VideoCameraIcon className="h-6 w-6 mr-3" />
                  Create Video
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isCreatingVideo && (
              <div className="max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${formatProgress(videoProgress)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Processing slides and audio...
                </p>
              </div>
            )}

            {/* Info */}
            <div className="text-sm text-gray-500 max-w-2xl mx-auto">
              <p>
                This process combines your slide images with the generated audio to create an MP4 video file. 
                The video will play each slide for the duration of its corresponding audio narration.
              </p>
              <p className="mt-2 text-xs">
                <strong>Note:</strong> Video processing requires a modern browser with SharedArrayBuffer support and HTTPS. 
                If you encounter issues, try refreshing the page or using a different browser.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <VideoCameraIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Video Created Successfully! 🎉
              </h3>
              <p className="text-green-700">
                Your presentation has been converted to video. You can preview it above and download it below.
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={onDownloadVideo}
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg"
            >
              <ArrowDownTrayIcon className="h-6 w-6 mr-3" />
              Download Video
            </button>

            {/* Video Stats */}
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-gray-900 mb-2">Video Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>📊 Slides: {slides.length}</div>
                <div>⏱️ Duration: ~{slides.length * 5} seconds</div>
                <div>📐 Resolution: 1920x1080 (Full HD)</div>
                <div>🎵 Audio: Narrated</div>
              </div>
            </div>

            {/* Create Another */}
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Create Another Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};