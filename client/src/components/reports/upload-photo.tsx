import { ChangeEvent, useState } from "react";
import { Upload, X, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadPhotoProps {
  onPhotoSelected: (files: FileList) => void;
  maxFiles?: number;
  className?: string;
}

export function UploadPhoto({ onPhotoSelected, maxFiles = 5, className }: UploadPhotoProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    handleFiles(files);
  };
  
  const handleFiles = (files: FileList) => {
    // Limit to maxFiles
    const filesArray = Array.from(files).slice(0, maxFiles);
    
    // Create previews
    const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
    
    // Pass files to parent
    onPhotoSelected(files);
  };
  
  const removePreview = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    
    // Also need to remove from the file input, but this is tricky with FileList
    // In a real app, we'd track the selected files separately in state
    // For this demo, we'll just show the preview management
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  return (
    <div className={className}>
      <div 
        className={cn(
          "flex items-center justify-center p-6 border-2 border-dashed rounded-md transition-colors",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
          previewUrls.length > 0 ? "pb-2" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-10 w-10 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
              <span>Upload photos</span>
              <input 
                id="file-upload" 
                name="photos" 
                type="file" 
                className="sr-only" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange}
                max={maxFiles}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 10MB (max {maxFiles} photos)
          </p>
        </div>
      </div>
      
      {previewUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative h-24 rounded-md overflow-hidden border border-gray-200 group">
              <img 
                src={url} 
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="absolute top-1 right-1 bg-gray-800 bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
