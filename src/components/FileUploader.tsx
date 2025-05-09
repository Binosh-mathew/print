import React, { useState, useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from '@/components/ui/use-toast';
import FileDetailsForm from './FileDetailsForm';
import type { FileDetails } from '@/types/order';

interface FileUploaderProps {
  onFileSelected: (fileDetails: FileDetails) => void;
  onFileRemoved: (file: File) => void;
  files: FileDetails[];
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, onFileRemoved, files }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    const validFiles = newFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload PDF, DOC, DOCX, PPT, or PPTX files.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit.`,
          variant: "destructive",
        });
        return false;
      }

      if (files.some(f => f.file.name === file.name)) {
        toast({
          title: "File already exists",
          description: `${file.name} has already been added.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    validFiles.forEach(file => {
      const newFileDetails: FileDetails = {
        file,
        copies: 1,
        specialPaper: 'none',
        printType: 'blackAndWhite',
        doubleSided: false,
        binding: {
          needed: false,
          type: 'none'
        },
        specificRequirements: '',
      };
      onFileSelected(newFileDetails);
    });
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`file-drop-area ${dragActive ? 'dragging' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          multiple
        />
        <div className="flex flex-col items-center justify-center">
          <Upload className="h-12 w-12 text-primary mb-4" />
          <p className="text-lg font-medium mb-2">Drag and drop your files here</p>
          <p className="text-sm text-gray-500 mb-4">Supported formats: PDF, DOC, DOCX, PPT, PPTX</p>
          <Button type="button" className="bg-primary hover:bg-primary-500">
            Browse Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          {files.map((fileDetail, index) => (
            <FileDetailsForm
              key={`${fileDetail.file.name}-${index}`}
              fileDetail={fileDetail}
              onUpdate={(updatedDetails) => {
                const newFiles = [...files];
                newFiles[index] = updatedDetails;
                onFileSelected(updatedDetails);
              }}
              onRemove={() => onFileRemoved(fileDetail.file)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
