import { useMemo } from 'react';
import type { ApexOptions } from 'apexcharts';
import { TrendingUp } from 'lucide-react';
import { ApexChart } from '@/components/charts/ApexChart';

export function GrowthLineChartCard({
  labels,
  userGrowth,
  postGrowth,
}: {
  labels: string[];
  userGrowth: number[];
  postGrowth: number[];
}) {
  const series = useMemo(
    () => [
      { name: '新增用户', data: userGrowth },
      { name: '新增帖子', data: postGrowth },
    ],
    [postGrowth, userGrowth]
  );

  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: 'line',
        toolbar: { show: false },
        zoom: { enabled: false },
        foreColor: '#6b7280',
      },
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      colors: ['#8B4513', '#D4AF37'],
      xaxis: {
        categories: labels,
        labels: { rotate: 0 },
        axisBorder: { color: '#e5e7eb' },
        axisTicks: { color: '#e5e7eb' },
      },
      yaxis: {
        labels: { formatter: (v) => Math.round(v).toString() },
      },
      grid: { borderColor: '#f3f4f6' },
      legend: { position: 'top', horizontalAlign: 'right' },
      tooltip: { theme: 'light' },
    }),
    [labels]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">近14天增长</h2>
          <p className="text-sm text-gray-500">用户与社区内容的增量趋势</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
          <TrendingUp className="w-4 h-4" /> 趋势
        </div>
      </div>
      <ApexChart type="line" series={series} options={options} height={288} />
    </div>
  );
}

