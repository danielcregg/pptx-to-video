import React from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  error?: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  isProcessing = false,
  error 
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    }
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400",
          isProcessing && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <DocumentArrowUpIcon className="mx-auto h-16 w-16 text-gray-400" />
        
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isProcessing ? 'Processing...' : 'Upload PowerPoint File'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {isDragActive
              ? 'Drop your .pptx file here'
              : 'Drag and drop your .pptx file here, or click to browse'
            }
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Only .pptx files are supported
          </p>
        </div>
        
        {isProcessing && (
          <div className="mt-4">
            <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing slides...
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};