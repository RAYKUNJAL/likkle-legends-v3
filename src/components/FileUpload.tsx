'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, Loader2, ImageIcon, FileAudio, File } from 'lucide-react';
import { uploadFile, StorageBucket } from '@/lib/storage';
import styles from './FileUpload.module.css';

interface FileUploadProps {
    bucket: StorageBucket;
    path: string;
    accept?: string;
    maxSizeMB?: number;
    onUploadComplete?: (url: string) => void;
    onError?: (error: string) => void;
    label?: string;
    preview?: boolean;
}

export default function FileUpload({
    bucket,
    path,
    accept = 'image/*',
    maxSizeMB = 5,
    onUploadComplete,
    onError,
    label = 'Upload File',
    preview = true
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            onError?.(`File too large. Maximum size is ${maxSizeMB}MB`);
            return;
        }

        setUploading(true);
        setUploaded(false);

        // Show preview for images
        if (preview && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target?.result as string);
            reader.readAsDataURL(file);
        }

        const result = await uploadFile(bucket, file, path);

        setUploading(false);

        if (result.success && result.url) {
            setUploaded(true);
            onUploadComplete?.(result.url);
        } else {
            setPreviewUrl(null);
            onError?.(result.error || 'Upload failed');
        }
    }, [bucket, path, maxSizeMB, onUploadComplete, onError, preview]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const clearUpload = () => {
        setPreviewUrl(null);
        setUploaded(false);
        if (inputRef.current) inputRef.current.value = '';
    };

    const getIcon = () => {
        if (accept.includes('audio')) return <FileAudio size={24} />;
        if (accept.includes('image')) return <ImageIcon size={24} />;
        return <File size={24} />;
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>
            <div
                className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''} ${uploaded ? styles.uploaded : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                {uploading ? (
                    <div className={styles.uploading}>
                        <Loader2 className="animate-spin" size={32} />
                        <span>Uploading...</span>
                    </div>
                ) : uploaded && previewUrl ? (
                    <div className={styles.preview}>
                        <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                        <button className={styles.clearBtn} onClick={(e) => { e.stopPropagation(); clearUpload(); }}>
                            <X size={16} />
                        </button>
                        <CheckCircle className={styles.checkIcon} size={20} />
                    </div>
                ) : uploaded ? (
                    <div className={styles.success}>
                        <CheckCircle size={32} />
                        <span>File uploaded!</span>
                        <button className={styles.clearBtn} onClick={(e) => { e.stopPropagation(); clearUpload(); }}>
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className={styles.placeholder}>
                        {getIcon()}
                        <span>Drop file here or click to browse</span>
                        <small>Max {maxSizeMB}MB</small>
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className={styles.hiddenInput}
                />
            </div>
        </div>
    );
}
