import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    gradient: string;
    link: string;
}

export function FeatureCard({ icon: Icon, title, description, gradient, link }: FeatureCardProps) {
    return (
        <Link to={link}>
            <Card className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#D4AF37]/10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className={`${gradient} p-8`}>
                    <Icon className="w-12 h-12 text-white" />
                </div>
                <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-bold text-[#8B4513] mb-3">{title}</h3>
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                </CardContent>
            </Card>
        </Link>
    );
}
