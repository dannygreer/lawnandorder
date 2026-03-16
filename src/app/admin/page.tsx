import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
} from "lucide-react";

const stats = [
  {
    label: "Active Customers",
    value: "25",
    change: "+3 this month",
    up: true,
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Weekly Revenue",
    value: "$1,250",
    change: "+$150 vs last week",
    up: true,
    icon: DollarSign,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Lawns This Week",
    value: "22",
    change: "3 remaining",
    up: true,
    icon: Calendar,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Routes Today",
    value: "6",
    change: "North Lindale",
    up: true,
    icon: MapPin,
    color: "bg-orange-50 text-orange-600",
  },
];

const recentActivity = [
  {
    customer: "Johnson Family",
    action: "Mowed & edged",
    date: "Today, 9:30 AM",
    amount: "$50",
  },
  {
    customer: "Smith Residence",
    action: "Mowed & edged",
    date: "Today, 8:15 AM",
    amount: "$40",
  },
  {
    customer: "Williams Home",
    action: "Mowed, edged, bagged",
    date: "Today, 7:00 AM",
    amount: "$60",
  },
  {
    customer: "Davis Property",
    action: "Payment received (Venmo)",
    date: "Yesterday",
    amount: "$50",
  },
  {
    customer: "Miller Residence",
    action: "Payment received (Zelle)",
    date: "Yesterday",
    amount: "$45",
  },
];

const upcomingJobs = [
  { time: "7:00 AM", customer: "Anderson Home", address: "145 Oak St", size: "Medium" },
  { time: "8:00 AM", customer: "Taylor Residence", address: "220 Pine Ave", size: "Large" },
  { time: "9:15 AM", customer: "Brown Family", address: "330 Elm Dr", size: "Small" },
  { time: "10:00 AM", customer: "Garcia Home", address: "412 Maple Ln", size: "Medium" },
  { time: "11:00 AM", customer: "Wilson Property", address: "508 Cedar Ct", size: "Medium" },
  { time: "12:00 PM", customer: "Martinez Yard", address: "615 Birch Rd", size: "Large" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              {stat.up ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-xs text-green-600">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Jobs */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Today&apos;s Schedule
            </h2>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              {upcomingJobs.length} jobs
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingJobs.map((job, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="w-16 text-xs font-medium text-gray-500">
                    {job.time}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {job.customer}
                    </p>
                    <p className="text-xs text-gray-500">{job.address}</p>
                  </div>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {job.size}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.customer}
                  </p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {activity.amount}
                  </p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
