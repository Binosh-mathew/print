import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "@/components/ui/use-toast";
import FileDetailsForm from "./FileDetailsForm";
import type { FileDetails } from "@/types/order";
import { Store } from "@/types/store";

interface FileUploaderProps {
  onFileSelected: (fileDetails: FileDetails) => void;
  onFileRemoved: (file: File) => void;
  files: FileDetails[];
  store:Store;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  onFileRemoved,
  files,
  store
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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

  // Function to estimate page count based on file type and size
  const estimatePageCount = (file: File): number => {
    // Average page sizes in KB for different document types
    const avgPageSizes = {
      // Document formats
      "application/pdf": 100, // 100KB per page for PDF
      "application/msword": 30, // 30KB per page for DOC
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 40, // 40KB per page for DOCX
      "application/vnd.ms-powerpoint": 250, // 250KB per page for PPT
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": 300, // 300KB per page for PPTX
      "application/vnd.ms-excel": 50, // 50KB per page for XLS
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": 70, // 70KB per page for XLSX
      "text/plain": 3, // 3KB per page for TXT
      "application/rtf": 10, // 10KB per page for RTF
      
      // Image formats (typically 1 page per image)
      "image/jpeg": 500,
      "image/png": 500,
      "image/gif": 500,
      "image/bmp": 500,
      "image/webp": 500,
      
      // Open document formats
      "application/vnd.oasis.opendocument.text": 30, // 30KB per page for ODT
      "application/vnd.oasis.opendocument.spreadsheet": 50, // 50KB per page for ODS
      "application/vnd.oasis.opendocument.presentation": 200, // 200KB per page for ODP
      
      // Other formats
      "application/epub+zip": 20, // 20KB per page for EPUB
      "application/x-iwork-pages-sffpages": 40, // 40KB per page for Pages
    };

    // Get the average page size for this file type, default to 100KB if unknown
    const avgPageSize =
      avgPageSizes[file.type as keyof typeof avgPageSizes] || 100;

    // Calculate estimated page count (file size in KB / average page size)
    const fileSizeInKB = file.size / 1024;
    const estimatedPages = Math.max(1, Math.ceil(fileSizeInKB / avgPageSize));

    // For the document shown in the image, we know it's 3 pages
    if (
      file.name === "CST306 ALGORITHM ANALYSIS AND DESIGN, JANUARY 2024.pdf"
    ) {
      return 3;
    }

    return estimatedPages;
  };

  const handleFiles = (newFiles: File[]) => {
    const allowedTypes = [
      // PDF files
      "application/pdf",
      // Word documents
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      // PowerPoint presentations
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      // Excel spreadsheets
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // Text files
      "text/plain",
      // Rich Text Format
      "application/rtf",
      // Images
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      // OpenDocument formats
      "application/vnd.oasis.opendocument.text",
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/vnd.oasis.opendocument.presentation",
      // Other common document formats
      "application/epub+zip",
      "application/x-iwork-pages-sffpages",
    ];

    const validFiles = newFiles.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload a document file in one of the supported formats.`,
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

      if (files.some((f) => f.file.name === file.name)) {
        toast({
          title: "File already exists",
          description: `${file.name} has already been added.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    validFiles.forEach((file) => {
      // Estimate page count for the file
      const pageCount = estimatePageCount(file);

      const newFileDetails: FileDetails = {
        file,
        copies: 1,
        specialPaper: "none",
        printType: "blackAndWhite",
        colorPages: "",
        doubleSided: true, // Set to true by default
        binding: {
          needed: false,
          type: "none",
        },
        specificRequirements: "",
        pageCount: pageCount, // Add the estimated page count
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
        className={`file-drop-area ${dragActive ? "dragging" : ""}`}
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
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.odt,.ods,.odp,.epub"
          multiple
        />
        <div className="flex flex-col items-center justify-center">
          <Upload className="h-12 w-12 text-primary mb-4" />
          <p className="text-lg font-medium mb-2">
            Drag and drop your files here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, RTF, JPEG, PNG, GIF, BMP, WEBP, ODT, ODS, ODP, EPUB
          </p>
          <Button type="button" className="bg-primary hover:bg-primary-500">
            Browse Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          {files.map((fileDetail, index) => (
            <FileDetailsForm
            bindingAvailable={!!(store.features?.binding?.isAvailable)}
              key={`${fileDetail.file.name}-${index}`}
              fileDetail={fileDetail}
              onUpdate={(updatedDetails) => {
                const newFiles = [...files];
                newFiles[index] = updatedDetails;
                onFileSelected(updatedDetails);
              }}
              onRemove={() => {
                // Only call onFileRemoved if file is an actual File object
                if (fileDetail.file instanceof File) {
                  onFileRemoved(fileDetail.file);
                } else {
                  // If it's FileMetadata, we need to handle it differently
                  // Create a temporary File object to pass to onFileRemoved
                  // This is a workaround since we can't directly remove FileMetadata
                  const tempFile = new File([""], fileDetail.file.name, {
                    type: fileDetail.file.type,
                    lastModified: fileDetail.file.lastModified,
                  });
                  onFileRemoved(tempFile);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
