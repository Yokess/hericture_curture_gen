import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProcessStep {
    stepNumber: number;
    name: string;
    description: string;
    timestamp: string;
}

interface ProcessStepsProps {
    steps: ProcessStep[];
}

export function ProcessSteps({ steps }: ProcessStepsProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="font-serif text-xl font-bold text-[#8B4513] mb-4">
                    提取的工序步骤
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {steps.map((step) => (
                        <Card key={step.stepNumber} className="bg-gradient-to-br from-[#F5F5DC] to-white">
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    <Badge className="bg-[#8B4513] text-white shrink-0">
                                        步骤 {step.stepNumber}
                                    </Badge>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">{step.name}</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                            {step.description}
                                        </p>
                                        <span className="text-xs text-gray-500">{step.timestamp}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
