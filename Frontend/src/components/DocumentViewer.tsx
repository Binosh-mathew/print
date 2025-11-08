import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Download,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  printDocument,
  downloadDocument,
  checkDocumentExists,
  fetchDocumentFile,
} from "@/api/documentApi";
import { DocumentViewerProps } from "@/types/document";

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  orderId,
  documentUrl: initialDocumentUrl,
  documentName = "Document",
  fileIndex = 0,
  fallbackMessage = "Document preview is not available",
  onDocumentLoaded,
}) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(
    initialDocumentUrl || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  useEffect(() => {
    if (initialDocumentUrl) {
      setDocumentUrl(initialDocumentUrl);
      if (onDocumentLoaded) onDocumentLoaded(initialDocumentUrl);
    } else if (orderId) {
      const fetchTimer = setTimeout(() => {
        checkAndFetchDocument();
      }, 300);

      return () => {
        clearTimeout(fetchTimer);
      };
    }
  }, [initialDocumentUrl]);

  const checkAndFetchDocument = async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const exists = await checkDocumentExists();

      if (exists) {
        await fetchDocument(orderId);
      } else {
        setError(
          "The document file is not available. Please contact the customer for the original file."
        );
        setIsLoading(false);
      }
    } catch (err) {
      setTimeout(async () => {
        try {
          await fetchDocument(orderId);
        } catch (fetchErr) {
          setError("Could not load document. Please try again later.");
          setIsLoading(false);
        }
      }, 1000);
    }
  };

  const fetchDocument = async (orderId: string) => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDocumentFile(
        orderId,
        documentName,
        fileIndex,
        (progress) => {
          setDownloadProgress(progress);
        }
      );
      const objectUrl = URL.createObjectURL(result.blob);
      setDocumentUrl(objectUrl);
      setFileSize(result.fileSize);
      onDocumentLoaded?.(result.signedUrl);
      toast({
        title: "Document loaded",
        description:
          "The document is ready for viewing, printing, or downloading.",
      });
    } catch (err) {
      console.error("Error fetching document:", err);
      setError("Failed to load the document. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (documentUrl) {
      try {
        printDocument(documentUrl);

        toast({
          title: "Print dialog opened",
          description: `${documentName} is being printed.`,
        });
      } catch (error) {
        console.error("Error printing document:", error);
        toast({
          title: "Print failed",
          description:
            error instanceof Error
              ? error.message
              : "Unable to print document.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Cannot print document",
        description: "The document is not available for printing.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (documentUrl) {
      try {
        downloadDocument(documentUrl, documentName);
      } catch (error) {
        console.error("Error downloading document:", error);
        toast({
          title: "Download failed",
          description:
            error instanceof Error
              ? error.message
              : "Unable to download document.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Cannot download document",
        description: "No Document URL is available for downloading.",
        variant: "destructive",
      });
    }
  };

  const isPdf =
    documentUrl?.toLowerCase().endsWith(".pdf") ||
    documentUrl?.includes("pdf") ||
    (documentName?.toLowerCase().endsWith(".pdf") ?? false);

  const isImage =
    documentUrl?.match(/\.(jpe?g|png|gif|bmp|webp)($|\?)/i) ||
    (documentName?.match(/\.(jpe?g|png|gif|bmp|webp)$/i) ?? false);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center w-full">
        <p className="text-gray-600 mb-2">Downloading document...</p>
        <div className="w-1/2">
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-600 rounded"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {downloadProgress}%
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Document Error
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={checkAndFetchDocument}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!documentUrl) {
    return (
      <div className="p-8 text-center">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Document Available
        </h3>
        <p className="text-gray-600 mb-4">{fallbackMessage}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium">
          {documentName}
          {fileSize ? (
            <span className="text-xs text-gray-500 ml-2">
              ({(fileSize / 1024).toFixed(1)} KB)
            </span>
          ) : null}
        </h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="p-0 bg-white min-h-[500px] flex items-center justify-center">
        {isPdf ? (
          <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden">
            <iframe
              src={documentUrl}
              title={`${documentName} preview`}
              className="w-full h-full border-0"
              allowFullScreen={true}
              onError={() => {
                setError(
                  "Failed to load document preview. You can still print or download the document."
                );
              }}
            />
          </div>
        ) : isImage ? (
          <div className="w-full h-[500px] border border-gray-200 rounded overflow-hidden flex items-center justify-center bg-gray-50">
            <img
              src={documentUrl}
              alt={documentName}
              className="max-w-full max-h-full object-contain"
              onError={() => {
                setError(
                  "Failed to load image preview. You can still print or download the image."
                );
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Document Preview Not Available
            </h3>
            <p className="text-gray-600 mb-6">
              This document format cannot be previewed directly in the browser.
            </p>
            <div className="flex space-x-4">
              <Button onClick={handlePrint}>Print Document</Button>
              <Button variant="outline" onClick={handleDownload}>
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
