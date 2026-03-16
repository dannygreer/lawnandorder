"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  Check,
  Clock,
  X,
} from "lucide-react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ScheduleEntry {
  date: string;
  jobs: {
    customer: string;
    time: string;
    status: "completed" | "scheduled" | "cancelled";
  }[];
  weather?: "sunny" | "cloudy" | "rain";
}

const scheduleData: Record<string, ScheduleEntry> = {
  "2026-03-16": {
    date: "2026-03-16",
    jobs: [
      { customer: "Johnson Family", time: "7:00 AM", status: "scheduled" },
      { customer: "Smith Residence", time: "8:00 AM", status: "scheduled" },
      { customer: "Anderson Home", time: "9:00 AM", status: "scheduled" },
      { customer: "Taylor Residence", time: "10:15 AM", status: "scheduled" },
      { customer: "Thomas Home", time: "11:30 AM", status: "scheduled" },
      { customer: "Jackson Yard", time: "12:30 PM", status: "scheduled" },
    ],
    weather: "sunny",
  },
  "2026-03-17": {
    date: "2026-03-17",
    jobs: [
      { customer: "Williams Home", time: "7:00 AM", status: "scheduled" },
      { customer: "Davis Property", time: "8:15 AM", status: "scheduled" },
      { customer: "Rodriguez Home", time: "9:15 AM", status: "scheduled" },
      { customer: "Lee Residence", time: "10:00 AM", status: "scheduled" },
      { customer: "Walker Property", time: "11:00 AM", status: "scheduled" },
      { customer: "Hall Yard", time: "12:00 PM", status: "scheduled" },
    ],
    weather: "cloudy",
  },
  "2026-03-18": {
    date: "2026-03-18",
    jobs: [
      { customer: "Brown Family", time: "7:00 AM", status: "scheduled" },
      { customer: "Miller Residence", time: "8:00 AM", status: "scheduled" },
      { customer: "Moore Home", time: "9:00 AM", status: "scheduled" },
      { customer: "Clark Property", time: "10:00 AM", status: "scheduled" },
      { customer: "Lewis Residence", time: "11:15 AM", status: "scheduled" },
      { customer: "Young Yard", time: "12:15 PM", status: "scheduled" },
    ],
    weather: "sunny",
  },
  "2026-03-19": {
    date: "2026-03-19",
    jobs: [
      { customer: "Garcia Home", time: "7:00 AM", status: "scheduled" },
      { customer: "Wilson Property", time: "8:15 AM", status: "scheduled" },
      { customer: "Martinez Yard", time: "9:15 AM", status: "scheduled" },
      { customer: "Robinson Home", time: "10:30 AM", status: "scheduled" },
      { customer: "King Property", time: "11:30 AM", status: "scheduled" },
      { customer: "Wright Residence", time: "12:30 PM", status: "scheduled" },
      { customer: "Lopez Yard", time: "1:15 PM", status: "scheduled" },
      { customer: "Hill Home", time: "2:00 PM", status: "scheduled" },
    ],
    weather: "rain",
  },
  "2026-03-13": {
    date: "2026-03-13",
    jobs: [
      { customer: "Garcia Home", time: "7:00 AM", status: "completed" },
      { customer: "Wilson Property", time: "8:15 AM", status: "completed" },
      { customer: "Martinez Yard", time: "9:15 AM", status: "completed" },
      { customer: "Robinson Home", time: "10:30 AM", status: "completed" },
      { customer: "King Property", time: "11:30 AM", status: "cancelled" },
    ],
    weather: "rain",
  },
  "2026-03-14": {
    date: "2026-03-14",
    jobs: [
      { customer: "Davis Property", time: "7:00 AM", status: "completed" },
      { customer: "Brown Family", time: "8:00 AM", status: "completed" },
    ],
    weather: "sunny",
  },
  "2026-03-15": {
    date: "2026-03-15",
    jobs: [
      { customer: "Johnson Family", time: "7:00 AM", status: "completed" },
      { customer: "Smith Residence", time: "8:00 AM", status: "completed" },
      { customer: "Williams Home", time: "9:00 AM", status: "completed" },
    ],
    weather: "sunny",
  },
};

const weatherIcon = {
  sunny: <Sun className="h-4 w-4 text-yellow-500" />,
  cloudy: <Cloud className="h-4 w-4 text-gray-400" />,
  rain: <CloudRain className="h-4 w-4 text-blue-500" />,
};

const statusIcon = {
  completed: <Check className="h-3.5 w-3.5 text-green-500" />,
  scheduled: <Clock className="h-3.5 w-3.5 text-blue-500" />,
  cancelled: <X className="h-3.5 w-3.5 text-red-500" />,
};

const statusStyle = {
  completed: "bg-green-50 border-green-200",
  scheduled: "bg-blue-50 border-blue-200",
  cancelled: "bg-red-50 border-red-200 line-through opacity-60",
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState("2026-03-16");
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // March 2026

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const formatDate = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const selected = scheduleData[selectedDate];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
        <p className="text-sm text-gray-500">
          View and manage your weekly mowing schedule
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Day detail */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            {selected && (
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                <span>{selected.jobs.length} jobs</span>
                {selected.weather && (
                  <span className="flex items-center gap-1">
                    {weatherIcon[selected.weather]}
                    {selected.weather}
                  </span>
                )}
              </div>
            )}
          </div>

          {selected ? (
            <div className="divide-y divide-gray-50">
              {selected.jobs.map((job, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-6 py-3 ${
                    job.status === "cancelled" ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    {statusIcon[job.status]}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium text-gray-900 ${job.status === "cancelled" ? "line-through" : ""}`}>
                      {job.customer}
                    </p>
                    <p className="text-xs text-gray-500">{job.time}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyle[job.status]}`}
                  >
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-gray-400">
              No jobs scheduled for this day.
              <br />
              <span className="text-xs">
                Select a day with scheduled jobs to see details.
              </span>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="rounded-lg p-1 hover:bg-gray-100">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h4 className="text-sm font-bold text-gray-900">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h4>
            <button onClick={nextMonth} className="rounded-lg p-1 hover:bg-gray-100">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
            {daysOfWeek.map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (!day) return <div key={i} />;
              const dateStr = formatDate(day);
              const hasJobs = scheduleData[dateStr];
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === "2026-03-16";

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative flex h-10 items-center justify-center rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-green-brand text-white font-bold"
                      : isToday
                        ? "bg-green-50 text-green-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {day}
                  {hasJobs && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-green-brand" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2 border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500">Legend</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" /> Completed
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" /> Scheduled
              </span>
              <span className="flex items-center gap-1">
                <X className="h-3 w-3 text-red-500" /> Cancelled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
