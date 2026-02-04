import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Upload, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { knowledgebaseApi } from '@/api/knowledgebase';
import { Progress } from '@/components/ui/progress';

interface FileUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function FileUploadDialog({ open, onClose, onSuccess }: FileUploadDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 重置表单
    const resetForm = () => {
        setFile(null);
        setName('');
        setCategory('');
        setError(null);
        setProgress(0);
    };

    // 处理文件选择
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            // 自动填充名称（去掉扩展名）
            const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
            setName(fileNameWithoutExt);
            setError(null);
        }
    };

    // 处理拖拽
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            const fileNameWithoutExt = droppedFile.name.replace(/\.[^/.]+$/, "");
            setName(fileNameWithoutExt);
            setError(null);
        }
    };

    // 提交上传
    const handleSubmit = async () => {
        if (!file) {
            setError('请选择文件');
            return;
        }

        if (!name.trim()) {
            setError('请输入知识库名称');
            return;
        }

        setUploading(true);
        setError(null);
        setProgress(0);

        // 模拟进度条（因为 axios 的 onUploadProgress 在 mock 环境或某些配置下可能不准确，这里简单模拟一下视觉反馈）
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 300);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', name);
            if (category) {
                formData.append('category', category);
            }

            await knowledgebaseApi.uploadKnowledgeBase(formData);

            clearInterval(progressInterval);
            setProgress(100);

            setTimeout(() => {
                onSuccess();
                resetForm();
            }, 500);

        } catch (err: any) {
            clearInterval(progressInterval);
            console.error('上传失败:', err);
            setError(err.response?.data?.message || err.message || '上传失败，请重试');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            onClose();
            // 稍微延迟重置，避免动画闪烁
            setTimeout(resetForm, 300);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>上传知识库文件</DialogTitle>
                    <DialogDescription>
                        支持 PDF, Word, Markdown, TXT 等格式。由于使用了向量数据库，文件处理可能需要一些时间。
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* 文件上传区域 */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                            ${file
                                ? 'border-[#8B4513] bg-[#8B4513]/5'
                                : 'border-gray-300 hover:border-[#8B4513] hover:bg-gray-50'
                            }
                        `}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => !file && fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.md,.txt"
                        />

                        {file ? (
                            <div className="relative w-full">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-4 -right-4 h-6 w-6 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                                <FileText className="w-10 h-10 text-[#8B4513] mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-900 truncate px-2">
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-900">
                                    点击上传或拖拽文件到此处
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    最大支持 50MB
                                </p>
                            </>
                        )}
                    </div>

                    {/* 表单字段 */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">名称</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="请输入知识库名称"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">分类 (可选)</Label>
                        <Input
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="例如: 政策法规, 历史档案..."
                        />
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="flex items-center text-red-600 text-sm bg-red-50 p-2 rounded">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    {/* 进度条 */}
                    {uploading && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>上传中...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={uploading}>
                        取消
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!file || !name || uploading}
                        className="bg-[#8B4513] hover:bg-[#8B4513]/90"
                    >
                        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {uploading ? '上传中...' : '开始上传'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
