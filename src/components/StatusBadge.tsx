const statusConfig = {
  "in-progress": { label: "진행중", className: "bg-blue-50 text-blue-600 border-blue-200" },
  completed: { label: "완료", className: "bg-green-50 text-green-600 border-green-200" },
  paused: { label: "중단", className: "bg-gray-50 text-gray-500 border-gray-200" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["in-progress"];
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
}
