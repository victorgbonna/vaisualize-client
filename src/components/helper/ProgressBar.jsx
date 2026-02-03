import { useEffect, useState } from "react";

export default function ProgressBar({
  currentStep = 1,
  totalSteps = 5,extraStyle
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const percentage = (currentStep / totalSteps) * 100;
    setProgress(percentage);
  }, [currentStep, totalSteps]);

  return (
    <div className="w-full">
      {/* <div className="flex justify-between mb-3">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isActive = step <= currentStep;

          return (
            <div
              key={step}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
                transition-all duration-300
                ${
                  isActive
                    ? "bg-blue-600 text-white scale-105"
                    : "bg-gray-200 text-gray-500"
                }`}
            >
              {step}
            </div>
          );
        })}
      </div> */}

      {/* Progress Track */}
      <div style={extraStyle} className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Label
      <p className="mt-2 text-sm text-gray-600 text-right">
        Step {currentStep} of {totalSteps}
      </p> */}
    </div>
  );
}
