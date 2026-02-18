import { useMemo } from 'react';
import type { ApexOptions } from 'apexcharts';
import { Database } from 'lucide-react';
import { ApexChart } from '@/components/charts/ApexChart';

export function KnowledgebaseStatusDonutCard({
  completed,
  processing,
  pending,
  totalAccessCount,
  totalQuestionCount,
}: {
  completed: number;
  processing: number;
  pending: number;
  totalAccessCount: number;
  totalQuestionCount: number;
}) {
  const series = useMemo(() => [completed, processing, pending], [completed, pending, processing]);

  const options = useMemo<ApexOptions>(
    () => ({
      chart: { type: 'donut', toolbar: { show: false }, foreColor: '#6b7280' },
      labels: ['已完成', '处理中', '待处理'],
      colors: ['#8B4513', '#D4AF37', '#e5e7eb'],
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
          <h2 className="text-lg font-bold text-gray-900">知识库向量化状态</h2>
          <p className="text-sm text-gray-500">已完成 / 处理中 / 待处理</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
          <Database className="w-4 h-4" /> 处理
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ApexChart type="donut" series={series} options={options} height={256} />
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">累计访问</div>
            <div className="text-2xl font-bold text-gray-900">{totalAccessCount.toLocaleString('zh-CN')}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">累计提问</div>
            <div className="text-2xl font-bold text-gray-900">{totalQuestionCount.toLocaleString('zh-CN')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

