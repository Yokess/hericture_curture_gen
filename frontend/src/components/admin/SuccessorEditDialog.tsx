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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Successor, HeritageProject } from '@/api/admin';

interface SuccessorEditDialogProps {
    open: boolean;
    successor: Successor | null;
    projects: HeritageProject[];
    onClose: () => void;
    onSave: (data: Partial<Successor>) => Promise<void>;
}

export function SuccessorEditDialog({ open, successor, projects, onClose, onSave }: SuccessorEditDialogProps) {
    const [formData, setFormData] = useState<Partial<Successor>>({
        name: '',
        projectId: undefined,
        gender: '',
        birthYear: '',
        description: '',
        officialUrl: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (successor) {
            setFormData({
                name: successor.name,
                projectId: successor.projectId,
                gender: successor.gender || '',
                birthYear: successor.birthYear || '',
                description: successor.description || '',
                officialUrl: successor.officialUrl || '',
            });
        } else {
            setFormData({
                name: '',
                projectId: undefined,
                gender: '',
                birthYear: '',
                description: '',
                officialUrl: '',
            });
        }
    }, [successor, open]);

    const handleSave = async () => {
        // 验证必填字段
        if (!formData.name?.trim()) {
            alert('请填写传承人姓名');
            return;
        }
        if (!formData.projectId) {
            alert('请选择关联项目');
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
                    <DialogTitle>{successor ? '编辑传承人' : '新建传承人'}</DialogTitle>
                    <DialogDescription>
                        {successor ? '修改传承人信息' : '创建新的传承人记录'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            姓名 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="例如: 王安江"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="projectId">
                            关联项目 <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.projectId?.toString()}
                            onValueChange={(value) => setFormData({ ...formData, projectId: parseInt(value) })}
                        >
                            <SelectTrigger id="projectId">
                                <SelectValue placeholder="选择非遗项目" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id.toString()}>
                                        {project.name} ({project.officialId})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="gender">性别</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                            >
                                <SelectTrigger id="gender">
                                    <SelectValue placeholder="选择性别" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="男">男</SelectItem>
                                    <SelectItem value="女">女</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="birthYear">出生年份</Label>
                            <Input
                                id="birthYear"
                                value={formData.birthYear}
                                onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                                placeholder="例如: 1950"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">简介</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="输入传承人的生平简介..."
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
