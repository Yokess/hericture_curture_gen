import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export function ApexChart({
  type,
  series,
  options,
  height,
}: {
  type: 'line' | 'bar' | 'donut';
  series: any;
  options: ApexOptions;
  height: number;
}) {
  return <Chart type={type} series={series} options={options} height={height} />;
}

