import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { cn } from '../utils/cn';

interface Step {
  id: string;
  name: string;
  description: string;
  status: 'complete' | 'current' | 'upcoming';
}

interface WorkflowStepperProps {
  currentStep: 'upload' | 'scripts' | 'audio' | 'video' | 'download';
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ currentStep }) => {
  const steps: Step[] = [
    {
      id: 'upload',
      name: 'Upload',
      description: 'Upload PowerPoint file',
      status: 'complete'
    },
    {
      id: 'scripts',
      name: 'Scripts',
      description: 'Generate & edit scripts',
      status: currentStep === 'upload' ? 'upcoming' : 'complete'
    },
    {
      id: 'audio',
      name: 'Audio',
      description: 'Generate audio narration',
      status: currentStep === 'upload' || currentStep === 'scripts' ? 
        (currentStep === 'scripts' ? 'current' : 'upcoming') : 'complete'
    },
    {
      id: 'video',
      name: 'Video',
      description: 'Create final video',
      status: currentStep === 'video' ? 'current' : 
        (currentStep === 'download' ? 'complete' : 'upcoming')
    },
    {
      id: 'download',
      name: 'Download',
      description: 'Download your video',
      status: currentStep === 'download' ? 'current' : 'upcoming'
    }
  ];

  // Update step statuses based on current step
  const stepIndex = steps.findIndex(step => step.id === currentStep);
  steps.forEach((step, index) => {
    if (index < stepIndex) {
      step.status = 'complete';
    } else if (index === stepIndex) {
      step.status = 'current';
    } else {
      step.status = 'upcoming';
    }
  });

  return (
    <div className="py-6">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center space-x-4 md:space-x-8">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="flex items-center">
              {/* Step */}
              <div className="flex flex-col items-center">
                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium",
                      step.status === 'complete'
                        ? "bg-blue-600 border-blue-600 text-white"
                        : step.status === 'current'
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-gray-300 text-gray-500 bg-white"
                    )}
                  >
                    {step.status === 'complete' ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <span>{stepIdx + 1}</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      step.status === 'complete' || step.status === 'current'
                        ? "text-blue-600"
                        : "text-gray-500"
                    )}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 max-w-20 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector */}
              {stepIdx < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 md:w-16 h-0.5 ml-4 md:ml-8",
                    step.status === 'complete'
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};