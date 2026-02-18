import { useMemo } from 'react';
import type { ApexOptions } from 'apexcharts';
import { UserCheck } from 'lucide-react';
import { ApexChart } from '@/components/charts/ApexChart';

export function UserStatusDonutCard({
  enabled,
  banned,
}: {
  enabled: number;
  banned: number;
}) {
  const series = useMemo(() => [enabled, banned], [banned, enabled]);

  const options = useMemo<ApexOptions>(
    () => ({
      chart: { type: 'donut', toolbar: { show: false }, foreColor: '#6b7280' },
      labels: ['启用', '禁用'],
      colors: ['#10b981', '#ef4444'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: false },
      stroke: { width: 3, colors: ['#fff'] },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
          },
        },
      },
      tooltip: { theme: 'light' },
    }),
    []
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">用户状态概览</h2>
          <p className="text-sm text-gray-500">取最近200位用户统计启用/禁用</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
          <UserCheck className="w-4 h-4" /> 状态
        </div>
      </div>
      <ApexChart type="donut" series={series} options={options} height={288} />
    </div>
  );
}

