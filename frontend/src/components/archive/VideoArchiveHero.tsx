import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface VideoArchiveHeroProps {
    onUploadClick: () => void;
    uploading?: boolean;
}

export function VideoArchiveHero({ onUploadClick, uploading }: VideoArchiveHeroProps) {
    return (
        <section className="pt-32 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="font-serif text-5xl font-bold text-[#8B4513] mb-4">
                            技艺数字化档案
                        </h1>
                        <p className="text-xl text-gray-600">
                            AI 自动提取视频工序，结构化展示非遗技艺传承过程
                        </p>
                    </div>
                    <Button
                        onClick={onUploadClick}
                        disabled={uploading}
                        className="bg-gradient-to-r from-[#8B4513] to-[#D4AF37] hover:shadow-lg"
                        size="lg"
                    >
                        <Upload className="w-5 h-5 mr-2" />
                        {uploading ? '上传中...' : '上传视频'}
                    </Button>
                </div>
            </div>
        </section>
    );
}
