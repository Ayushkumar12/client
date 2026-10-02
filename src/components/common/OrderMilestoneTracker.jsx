import React from 'react';
import { Check } from 'lucide-react';
import { getMilestoneTrackerSteps } from '../../utils/orderMilestones.js';

/**
 * OrderMilestoneTracker Component
 * Renders the 5-step horizontal tracker with milestone scan locations, timestamps, and active status telemetry.
 */
export function OrderMilestoneTracker({
  order,
  customStatus = null,
  compact = false,
  className = ''
}) {
  const { steps, progressPercent, isCancelled } = getMilestoneTrackerSteps(order, customStatus);

  if (isCancelled) {
    return (
      <div className={`p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800 ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
          <span className="font-bold">Order Cancelled & Refund Initiated</span>
        </div>
        <span className="font-mono text-[11px] text-rose-600">Processed</span>
      </div>
    );
  }

  if (!steps || steps.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      {/* 5-Step Visual Tracker Bar */}
      <div className="relative pt-2 pb-1">
        {/* Connector Background Track Line (Between center of 1st node 10% and 5th node 90%) */}
        <div className="absolute top-4 sm:top-5 left-[10%] right-[10%] h-0.5 sm:h-1 bg-neutral-200/90 rounded-full overflow-hidden -z-0">
          {/* Active Animated Progress Track Line */}
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-700 ease-out"
            style={{
              width: progressPercent
            }}
          />
        </div>

        {/* 5 Node Columns */}
        <div className="grid grid-cols-5 text-center relative z-10 gap-1 sm:gap-2">
          {steps.map((step, idx) => {
            const isCompleted = step.isCompleted;
            const isCurrent = step.isCurrent;

            return (
              <div key={step.id || idx} className="flex flex-col items-center group">
                {/* Node Circle */}
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-all duration-300 shadow-2xs ${
                    isCompleted && !isCurrent
                      ? 'bg-emerald-600 text-white shadow-emerald-700/20'
                      : isCompleted && isCurrent
                      ? 'bg-emerald-600 ring-4 ring-emerald-600/20 text-white shadow-emerald-700/20'
                      : isCurrent
                      ? 'bg-[#5A1827] ring-4 ring-[#5A1827]/20 text-white font-bold shadow-brand-maroon/30 scale-105'
                      : 'border-2 border-neutral-300 bg-white text-neutral-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  ) : isCurrent ? (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse" />
                  ) : null}
                </div>

                {/* Step Title Label */}
                <span
                  className={`text-[11px] sm:text-xs mt-2 transition-colors ${
                    isCompleted && !isCurrent
                      ? 'text-neutral-900 font-bold'
                      : isCurrent
                      ? isCompleted ? 'text-emerald-800 font-extrabold' : 'text-[#5A1827] font-extrabold'
                      : 'text-neutral-400 font-semibold'
                  }`}
                >
                  {step.label}
                </span>

                {/* Milestone Scan Location Tag */}
                <div className="mt-1 w-full flex flex-col items-center px-0.5">
                  {isCurrent && !isCompleted ? (
                    <span
                      title={step.location}
                      className="text-[9.5px] sm:text-[10.5px] font-bold text-[#5A1827] bg-[#FBF1F3] px-1.5 py-0.5 rounded border border-[#5A1827]/25 shadow-2xs truncate max-w-full block leading-tight"
                    >
                      {step.shortLocation || step.location}
                    </span>
                  ) : (
                    <span
                      title={step.location}
                      className={`text-[9px] sm:text-[10px] truncate max-w-full block leading-tight ${
                        isCompleted ? 'text-neutral-600 font-medium' : 'text-neutral-400'
                      }`}
                    >
                      {step.shortLocation || step.location}
                    </span>
                  )}

                  {/* Milestone Timestamp / Activity */}
                  <span
                    className={`text-[8.5px] sm:text-[9.5px] mt-0.5 truncate max-w-full font-mono block ${
                      isCompleted
                        ? 'text-emerald-700 font-semibold'
                        : isCurrent
                        ? 'text-brand-maroon font-bold'
                        : 'text-neutral-400'
                    }`}
                  >
                    {step.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
