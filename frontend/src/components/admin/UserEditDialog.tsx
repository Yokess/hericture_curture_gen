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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield, User as UserIcon, Loader2 } from 'lucide-react';
import type { User } from '@/api/admin';

interface UserEditDialogProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onSave: (userId: number, isAdmin: boolean) => Promise<void>;
}

export function UserEditDialog({ open, user, onClose, onSave }: UserEditDialogProps) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setIsAdmin(user.isAdmin);
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        try {
            await onSave(user.id, isAdmin);
            onClose();
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !saving && !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>编辑用户权限</DialogTitle>
                    <DialogDescription>
                        修改用户 <strong>{user?.nickname || user?.username}</strong> 的角色权限。
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <RadioGroup
                        value={isAdmin ? 'admin' : 'user'}
                        onValueChange={(val) => setIsAdmin(val === 'admin')}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div>
                            <RadioGroupItem value="user" id="role-user" className="peer sr-only" />
                            <Label
                                htmlFor="role-user"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#8B4513] peer-data-[state=checked]:text-[#8B4513] cursor-pointer"
                            >
                                <UserIcon className="mb-3 h-6 w-6" />
                                普通用户
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="admin" id="role-admin" className="peer sr-only" />
                            <Label
                                htmlFor="role-admin"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#8B4513] peer-data-[state=checked]:text-[#8B4513] cursor-pointer"
                            >
                                <Shield className="mb-3 h-6 w-6" />
                                管理员
                            </Label>
                        </div>
                    </RadioGroup>

                    {isAdmin && (
                        <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                            注意：管理员拥有系统的完全控制权限，包括管理其他用户和非遗内容。
                        </div>
                    )}
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
                        {saving ? '保存中...' : '保存更改'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
