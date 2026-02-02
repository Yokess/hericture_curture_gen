import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
    id: string;
    code: string;
    batch: string;
    name: string;
    category: string;
    location: string;
    description: string;
    successorCount: number;
    categoryIcon: string;
    gradient: string;
}

export function ProjectCard({
    id,
    code,
    batch,
    name,
    category,
    location,
    description,
    successorCount,
    categoryIcon,
    gradient,
}: ProjectCardProps) {
    return (
        <Link to={`/projects/${id}`}>
            <Card className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#D4AF37]/10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className={`${gradient} p-6`}>
                    <div className="flex items-center space-x-3">
                        <div className="text-4xl">{categoryIcon}</div>
                        <div>
                            <div className="text-sm text-gray-700 font-medium">{category}</div>
                            <div className="font-serif text-lg font-bold text-[#8B4513]">{name}</div>
                        </div>
                    </div>
                </div>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="bg-[#F5F5DC] text-[#8B4513]">
                            {code}
                        </Badge>
                        <span className="text-sm text-gray-500">{batch}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{location}</p>
                    <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">{description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{successorCount} 位传承人</span>
                        </div>
                        <span className="text-[#D4AF37] font-medium hover:text-[#8B4513] transition-colors duration-200">
                            查看详情 →
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
