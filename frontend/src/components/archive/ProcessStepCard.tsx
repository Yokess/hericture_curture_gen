import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';
import type { ProcessStepDto } from '@/api/archive';

interface ProcessStepCardProps {
    step: ProcessStepDto;
}

function formatTimestamp(ms: number | null): string {
    if (ms == null) return '--:--';
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function ProcessStepCard({ step }: ProcessStepCardProps) {
    const timeRange =
        step.startTimeMs != null && step.endTimeMs != null
            ? `${formatTimestamp(step.startTimeMs)} - ${formatTimestamp(step.endTimeMs)}`
            : null;

    return (
        <Card className="bg-[#F5F5DC] p-4 cursor-pointer hover:shadow-md transition-shadow duration-200">
            {/* 关键帧缩略图 */}
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {step.keyframeUrl ? (
                    <img
                        src={step.keyframeUrl}
                        alt={step.stepName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Play className="w-6 h-6 text-[#8B4513]" />
                        </div>
                        <p className="text-xs text-[#8B4513]">关键帧</p>
                    </div>
                )}
            </div>

            {/* 工序信息 */}
            <div className="flex items-center justify-between mb-2">
                <h5 className="font-serif font-semibold text-[#8B4513]">
                    {step.stepOrder}. {step.stepName}
                </h5>
                {timeRange && (
                    <span className="text-xs text-gray-500">{timeRange}</span>
                )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-3">{step.description}</p>
        </Card>
    );
}
