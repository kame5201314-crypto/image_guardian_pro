"use client";

interface StatsProps {
  stats: {
    pending: number;
    evidenced: number;
    reported: number;
    resolved: number;
    dismissed: number;
    total: number;
  };
}

export function InfringementStats({ stats }: StatsProps) {
  const cards = [
    {
      label: "待處理",
      value: stats.pending,
      color: "bg-amber-50 text-amber-700",
      dotColor: "bg-amber-500",
    },
    {
      label: "已存證",
      value: stats.evidenced,
      color: "bg-blue-50 text-blue-700",
      dotColor: "bg-blue-500",
    },
    {
      label: "已檢舉",
      value: stats.reported,
      color: "bg-purple-50 text-purple-700",
      dotColor: "bg-purple-500",
    },
    {
      label: "已解決",
      value: stats.resolved,
      color: "bg-green-50 text-green-700",
      dotColor: "bg-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.color} rounded-2xl p-6 transition-all hover:scale-[1.02]`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${card.dotColor}`} />
            <span className="text-sm font-medium opacity-80">{card.label}</span>
          </div>
          <div className="text-3xl font-semibold">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
