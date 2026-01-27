import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  altitude?: string;
  distance?: string;
  highlights?: string[];
}

interface ItineraryTimelineProps {
  days: ItineraryDay[];
  totalDays: number;
}

export const ItineraryTimeline = ({
  days,
  totalDays,
}: ItineraryTimelineProps) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  return (
    <div className="py-8">
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-accent via-brand-accent to-brand-warning" />

        {/* Days */}
        <div className="space-y-6">
          {days.map((dayData) => (
            <div key={dayData.day} className="relative pl-24">
              {/* Footstep Marker */}
              <div className="absolute left-0 top-2 flex items-center justify-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* Animated footstep icon */}
                  <div className="absolute inset-0 bg-brand-accent/20 rounded-full animate-pulse" />
                  <div className="relative flex items-center justify-center w-14 h-14 bg-white border-4 border-brand-accent rounded-full shadow-lg">
                    <svg
                      className="w-7 h-7 text-brand-accent"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {/* Footprint Icon */}
                      <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2M12 7C9.24 7 7 9.24 7 12C7 13.5 7.73 14.83 8.86 15.62L8.33 19.5C8.25 20.11 8.77 20.6 9.38 20.54L9.9 16.65C10.3 16.87 10.75 17 11.23 17C12.25 17 13.19 16.48 13.72 15.62L14.25 19.5C14.33 20.11 14.85 20.6 15.46 20.54L14.93 16.65C16.06 15.86 16.79 14.53 16.79 13C16.79 10.24 14.55 8 12 7M6 8C4.9 8 4 8.9 4 10C4 11.1 4.9 12 6 12C7.1 12 8 11.1 8 10C8 8.9 7.1 8 6 8M18 8C16.9 8 16 8.9 16 10C16 11.1 16.9 12 18 12C19.1 12 20 11.1 20 10C20 8.9 19.1 8 18 8Z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Content Card */}
              <button
                onClick={() =>
                  setExpandedDay(expandedDay === dayData.day ? null : dayData.day)
                }
                className={cn(
                  "w-full text-left bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-lg",
                  expandedDay === dayData.day
                    ? "border-brand-accent shadow-lg"
                    : "border-gray-200"
                )}
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-brand-dark mb-2">
                      Day {dayData.day}: {dayData.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">
                      {dayData.description}
                    </p>
                    {dayData.distance && (
                      <div className="mt-3 flex gap-6 text-sm text-gray-500">
                        {dayData.distance && (
                          <span>📍 {dayData.distance}</span>
                        )}
                        {dayData.altitude && (
                          <span>⛰️ {dayData.altitude}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {expandedDay === dayData.day ? (
                      <ChevronUp className="w-6 h-6 text-brand-accent" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedDay === dayData.day && (
                  <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
                    <p className="text-gray-700 mb-4">{dayData.description}</p>
                    {dayData.highlights && dayData.highlights.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-brand-dark mb-3">
                          Highlights:
                        </h4>
                        <ul className="space-y-2">
                          {dayData.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex gap-3 text-gray-700">
                              <span className="text-brand-accent font-bold">
                                ✓
                              </span>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-12 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-accent to-brand-warning h-full transition-all duration-500"
            style={{
              width: `${(days.length / totalDays) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Day 1</span>
          <span className="font-semibold">Day {days.length}</span>
          <span>Day {totalDays}</span>
        </div>
      </div>
    </div>
  );
};
