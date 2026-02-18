import { useMemo } from 'react';
import type { ApexOptions } from 'apexcharts';
import { BookOpen } from 'lucide-react';
import { ApexChart } from '@/components/charts/ApexChart';

export function ProjectCategoryBarChartCard({
  categories,
  counts,
}: {
  categories: string[];
  counts: number[];
}) {
  const series = useMemo(() => [{ name: '项目数', data: counts }], [counts]);

  const options = useMemo<ApexOptions>(
    () => ({
      chart: { type: 'bar', toolbar: { show: false }, foreColor: '#6b7280' },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: '60%',
        },
      },
      dataLabels: { enabled: false },
      colors: ['#8B4513'],
      xaxis: {
        categories,
        axisBorder: { color: '#e5e7eb' },
        axisTicks: { color: '#e5e7eb' },
      },
      grid: { borderColor: '#f3f4f6' },
      tooltip: { theme: 'light' },
    }),
    [categories]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">非遗类别分布</h2>
          <p className="text-sm text-gray-500">按项目类别统计（Top 8）</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
          <BookOpen className="w-4 h-4" /> 分布
        </div>
      </div>
      <ApexChart type="bar" series={series} options={options} height={288} />
    </div>
  );
}

