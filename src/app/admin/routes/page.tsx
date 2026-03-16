"use client";

import { MapPin, Clock, Users, ChevronRight } from "lucide-react";

const routes = [
  {
    day: "Monday",
    area: "North Lindale",
    color: "bg-blue-500",
    homes: [
      { name: "Johnson Family", address: "145 Oak St", time: "7:00 AM", size: "Medium" },
      { name: "Smith Residence", address: "220 Pine Ave", time: "8:00 AM", size: "Small" },
      { name: "Anderson Home", address: "310 Oak Ct", time: "9:00 AM", size: "Medium" },
      { name: "Taylor Residence", address: "415 Pine Dr", time: "10:15 AM", size: "Large" },
      { name: "Thomas Home", address: "520 Oak Way", time: "11:30 AM", size: "Medium" },
      { name: "Jackson Yard", address: "625 Pine Ln", time: "12:30 PM", size: "Small" },
    ],
  },
  {
    day: "Tuesday",
    area: "Downtown Area",
    color: "bg-green-500",
    homes: [
      { name: "Williams Home", address: "330 Elm Dr", time: "7:00 AM", size: "Large" },
      { name: "Davis Property", address: "412 Maple Ln", time: "8:15 AM", size: "Medium" },
      { name: "Rodriguez Home", address: "505 Main St", time: "9:15 AM", size: "Small" },
      { name: "Lee Residence", address: "618 Commerce Ave", time: "10:00 AM", size: "Medium" },
      { name: "Walker Property", address: "722 Center Blvd", time: "11:00 AM", size: "Medium" },
      { name: "Hall Yard", address: "830 Market St", time: "12:00 PM", size: "Large" },
    ],
  },
  {
    day: "Wednesday",
    area: "New Subdivisions",
    color: "bg-purple-500",
    homes: [
      { name: "Brown Family", address: "508 Cedar Ct", time: "7:00 AM", size: "Medium" },
      { name: "Miller Residence", address: "720 Walnut Way", time: "8:00 AM", size: "Small" },
      { name: "Moore Home", address: "115 Sunset Dr", time: "9:00 AM", size: "Medium" },
      { name: "Clark Property", address: "228 Sunrise Ln", time: "10:00 AM", size: "Large" },
      { name: "Lewis Residence", address: "335 Dawn Ct", time: "11:15 AM", size: "Medium" },
      { name: "Young Yard", address: "440 Twilight Ave", time: "12:15 PM", size: "Small" },
    ],
  },
  {
    day: "Thursday",
    area: "County Road Homes",
    color: "bg-orange-500",
    homes: [
      { name: "Garcia Home", address: "615 Birch Rd", time: "7:00 AM", size: "Large" },
      { name: "Wilson Property", address: "835 Hickory Dr", time: "8:15 AM", size: "Medium" },
      { name: "Martinez Yard", address: "1020 CR 411", time: "9:15 AM", size: "Large" },
      { name: "Robinson Home", address: "1150 CR 413", time: "10:30 AM", size: "Medium" },
      { name: "King Property", address: "1275 CR 415", time: "11:30 AM", size: "Medium" },
      { name: "Wright Residence", address: "1380 FM 16", time: "12:30 PM", size: "Small" },
      { name: "Lopez Yard", address: "1450 FM 16", time: "1:15 PM", size: "Medium" },
      { name: "Hill Home", address: "1560 CR 418", time: "2:00 PM", size: "Large" },
    ],
  },
  {
    day: "Friday",
    area: "Overflow / Makeup",
    color: "bg-gray-500",
    homes: [
      { name: "Rain delays", address: "—", time: "—", size: "—" },
      { name: "New estimates", address: "—", time: "—", size: "—" },
      { name: "Reschedules", address: "—", time: "—", size: "—" },
    ],
  },
];

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Weekly Routes</h2>
        <p className="text-sm text-gray-500">
          Neighborhoods clustered to save fuel and time
        </p>
      </div>

      {/* Route cards */}
      <div className="space-y-6">
        {routes.map((route) => (
          <div
            key={route.day}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            {/* Route header */}
            <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className={`h-3 w-3 rounded-full ${route.color}`} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {route.day}
                </h3>
                <p className="text-sm text-gray-500">{route.area}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {route.homes.length} stops
                </span>
              </div>
            </div>

            {/* Stops */}
            <div className="divide-y divide-gray-50">
              {route.homes.map((home, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {home.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {home.address}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {home.time}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {home.size}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
