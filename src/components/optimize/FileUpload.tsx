"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { X, FileText, Image, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextFile {
    name: string;
    mimeType: string;
    base64: string;
    preview?: string;
}

interface FileUploadProps {
    onFilesChange: (files: ContextFile[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    disabled?: boolean;
}

const ACCEPTED_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
    "text/plain": [".txt"],
    "text/markdown": [".md"],
    "text/csv": [".csv"],
    "application/json": [".json"],
    "text/javascript": [".js"],
    "text/typescript": [".ts"],
    "text/x-python": [".py"],
};

export function FileUpload({
    onFilesChange,
    maxFiles = 5,
    maxSizeMB = 10,
    disabled = false,
}: FileUploadProps) {
    const [files, setFiles] = React.useState<ContextFile[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [processing, setProcessing] = React.useState(false);

    const processFile = async (file: File): Promise<ContextFile> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(",")[1];
                resolve({
                    name: file.name,
                    mimeType: file.type,
                    base64,
                    preview: file.type.startsWith("image/")
                        ? URL.createObjectURL(file)
                        : undefined,
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const onDrop = React.useCallback(
        async (acceptedFiles: File[]) => {
            setError(null);

            if (files.length + acceptedFiles.length > maxFiles) {
                setError(`Maximum ${maxFiles} files allowed`);
                return;
            }

            setProcessing(true);

            try {
                const processedFiles = await Promise.all(
                    acceptedFiles.map(processFile)
                );
                const newFiles = [...files, ...processedFiles];
                setFiles(newFiles);
                onFilesChange(newFiles);
            } catch (err) {
                setError("Error processing files. Please try again.");
            } finally {
                setProcessing(false);
            }
        },
        [files, maxFiles, onFilesChange]
    );

    const removeFile = (index: number) => {
        const fileToRemove = files[index];
        if (fileToRemove.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onFilesChange(newFiles);
    };

    const clearAll = () => {
        files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
        setFiles([]);
        onFilesChange([]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES,
        maxSize: maxSizeMB * 1024 * 1024,
        disabled: disabled || processing,
        onDropRejected: (rejections) => {
            const err = rejections[0]?.errors[0];
            if (err?.code === "file-too-large") {
                setError(`File too large. Maximum size is ${maxSizeMB}MB`);
            } else if (err?.code === "file-invalid-type") {
                setError("Invalid file type. Try images, PDFs, or text files.");
            }
        },
    });

    // Cleanup previews on unmount
    React.useEffect(() => {
        return () => {
            files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
        };
    }, []);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">📎 Context Files (Optional)</label>
                {files.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200",
                    isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-input hover:border-muted-foreground bg-muted/30",
                    (disabled || processing) && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                {processing ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing files...
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            {isDragActive
                                ? "Drop files here..."
                                : "📁 Drag & drop files here, or click to browse"}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Images, PDFs, Text files • Max {maxSizeMB}MB each • Up to {maxFiles} files
                        </p>
                    </>
                )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {files.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="relative group border rounded-lg p-2 bg-background shadow-sm"
                        >
                            {file.preview ? (
                                <img
                                    src={file.preview}
                                    alt={file.name}
                                    className="w-14 h-14 object-cover rounded"
                                />
                            ) : (
                                <div className="w-14 h-14 flex items-center justify-center bg-muted rounded">
                                    {file.mimeType.includes("pdf") ? (
                                        <FileText className="h-6 w-6 text-muted-foreground" />
                                    ) : (
                                        <FileText className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-[56px]">
                                {file.name}
                            </p>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground 
                         rounded-full text-xs opacity-0 group-hover:opacity-100 
                         transition-opacity flex items-center justify-center shadow-sm"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-muted-foreground/70 italic flex items-center gap-1">
                🔒 Files processed in real-time, never stored
            </p>
        </div>
    );
}

export type { ContextFile };
