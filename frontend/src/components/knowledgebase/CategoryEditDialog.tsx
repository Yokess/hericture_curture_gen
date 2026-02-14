import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { knowledgebaseApi } from '@/api/knowledgebase';
import { Loader2, Tag } from 'lucide-react';

interface CategoryEditDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    knowledgeBaseId: number;
    currentCategory: string | null;
    knowledgeBaseName: string;
}

export function CategoryEditDialog({
    open,
    onClose,
    onSuccess,
    knowledgeBaseId,
    currentCategory,
    knowledgeBaseName
}: CategoryEditDialogProps) {
    const [category, setCategory] = useState(currentCategory || '');
    const [loading, setLoading] = useState(false);
    const [allCategories, setAllCategories] = useState<string[]>([]);

    // 加载所有分类
    useEffect(() => {
        if (open) {
            loadCategories();
            setCategory(currentCategory || '');
        }
    }, [open, currentCategory]);

    const loadCategories = async () => {
        try {
            const categories = await knowledgebaseApi.getAllCategories();
            setAllCategories(categories);
        } catch (error) {
            console.error('加载分类失败:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await knowledgebaseApi.updateCategory(
                knowledgeBaseId,
                category.trim() || null
            );
            alert('分类更新成功!');
            onSuccess();
        } catch (error: any) {
            alert('更新失败: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-[#8B4513]" />
                        编辑分类
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="text-sm text-gray-600">知识库名称</Label>
                            <div className="mt-1 text-sm font-medium text-gray-900">
                                {knowledgeBaseName}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="category">分类</Label>
                            <Input
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="输入分类名称（留空表示未分类）"
                                className="mt-1"
                                list="categories"
                            />
                            <datalist id="categories">
                                {allCategories.map((cat) => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>
                            <p className="text-xs text-gray-500 mt-1">
                                可以输入新分类或从现有分类中选择
                            </p>
                        </div>

                        {allCategories.length > 0 && (
                            <div>
                                <Label className="text-sm text-gray-600">现有分类</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {allCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                                category === cat
                                                    ? 'bg-[#8B4513] text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            取消
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#8B4513] hover:bg-[#8B4513]/90"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            保存
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

