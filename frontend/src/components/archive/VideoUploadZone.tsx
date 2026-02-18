import { forwardRef } from 'react';

interface VideoUploadZoneProps {
    onFileSelected: (file: File) => void;
    accept?: string;
}

/**
 * 隐藏的视频文件选择器，由父组件通过 ref 触发
 */
export const VideoUploadZone = forwardRef<HTMLInputElement, VideoUploadZoneProps>(
    function VideoUploadZone({ onFileSelected, accept = 'video/*' }, ref) {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                onFileSelected(files[0]);
                e.target.value = '';
            }
        };

        return (
            <input
                ref={ref}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />
        );
    }
);
