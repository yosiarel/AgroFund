interface CreateProjectStepperProps {
  steps: string[]
  currentStep: number
}

export function CreateProjectStepper({ steps, currentStep }: CreateProjectStepperProps) {
  return (
    <div className="flex items-center justify-between w-full relative">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none relative">
          <div className="flex flex-col md:flex-row items-center gap-2 flex-shrink-0 z-10 relative bg-[var(--color-neutral-50)] pr-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-[700] transition-colors ${
                i < currentStep
                  ? "bg-[var(--color-primary-600)] text-white"
                  : i === currentStep
                  ? "bg-[var(--color-primary-100)] text-[var(--color-primary-700)] ring-2 ring-[var(--color-primary-400)]"
                  : "bg-white text-[var(--color-neutral-500)] border-2 border-[var(--color-neutral-200)]"
              }`}
            >
              {i < currentStep ? "✓" : i + 1}
            </div>
            <span
              className={`text-[10px] md:text-xs absolute md:static -bottom-5 left-1/2 md:translate-x-0 -translate-x-1/2 md:mt-0 whitespace-nowrap ${
                i <= currentStep ? "text-[var(--color-neutral-900)] font-[600]" : "text-[var(--color-neutral-400)] font-[500]"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-[2px] mx-1 md:mx-4 transition-colors relative z-0 -ml-2 md:ml-0 ${
                i < currentStep ? "bg-[var(--color-primary-600)]" : "bg-[var(--color-neutral-200)]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
