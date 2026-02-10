import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { HeritageProject } from '@/api/admin';

interface ProjectEditDialogProps {
    open: boolean;
    project: HeritageProject | null;
    onClose: () => void;
    onSave: (data: Partial<HeritageProject>) => Promise<void>;
}

export function ProjectEditDialog({ open, project, onClose, onSave }: ProjectEditDialogProps) {
    const [formData, setFormData] = useState<Partial<HeritageProject>>({
        name: '',
        officialId: '',
        category: '',
        location: '',
        batch: '',
        description: '',
        officialUrl: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name,
                officialId: project.officialId,
                category: project.category || '',
                location: project.location || '',
                batch: project.batch || '',
                description: project.description || '',
                officialUrl: project.officialUrl || '',
            });
        } else {
            setFormData({
                name: '',
                officialId: '',
                category: '',
                location: '',
                batch: '',
                description: '',
                officialUrl: '',
            });
        }
    }, [project, open]);

    const handleSave = async () => {
        // 验证必填字段
        if (!formData.name?.trim() || !formData.officialId?.trim()) {
            alert('请填写项目名称和官方ID');
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !saving && !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{project ? '编辑非遗项目' : '新建非遗项目'}</DialogTitle>
                    <DialogDescription>
                        {project ? '修改非遗项目信息' : '创建新的非遗项目记录'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            项目名称 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="例如: 苗族古歌"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="officialId">
                            官方ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="officialId"
                            value={formData.officialId}
                            onChange={(e) => setFormData({ ...formData, officialId: e.target.value })}
                            placeholder="例如: Ⅰ-001"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category">类别</Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="例如: 民间文学"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="batch">批次</Label>
                            <Input
                                id="batch"
                                value={formData.batch}
                                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                placeholder="例如: 2006(第一批)"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="location">地区</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="例如: 贵州省台江县"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">项目描述</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="输入项目的详细描述..."
                            rows={4}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="officialUrl">官方网址</Label>
                        <Input
                            id="officialUrl"
                            value={formData.officialUrl}
                            onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                            placeholder="https://..."
                            type="url"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        取消
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#8B4513] hover:bg-[#8B4513]/90"
                    >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {saving ? '保存中...' : '保存'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
