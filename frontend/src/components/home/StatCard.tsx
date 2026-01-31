import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
    icon: LucideIcon;
    value: string;
    label: string;
    gradient: string;
}

export function StatCard({ icon: Icon, value, label, gradient }: StatCardProps) {
    return (
        <Card className="bg-white/90 backdrop-blur-sm border-[#D4AF37]/20 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 ${gradient} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-[#8B4513]">{value}</div>
                        <div className="text-sm text-gray-600">{label}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
