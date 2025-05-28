import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getDocumentUrl, printDocument, downloadDocument, checkDocumentExists } from '@/api/documentApi';

interface DocumentViewerProps {
  orderId?: string;
  documentUrl?: string;
  documentName?: string;
  fallbackMessage?: string;
  onDocumentLoaded?: (url: string) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  orderId,
  documentUrl: initialDocumentUrl,
  documentName = 'Document',
  fallbackMessage = 'Document preview is not available',
  onDocumentLoaded
}) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(initialDocumentUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentExists, setDocumentExists] = useState<boolean>(false);

  useEffect(() => {
    if (initialDocumentUrl) {
      setDocumentUrl(initialDocumentUrl);
      if (onDocumentLoaded) onDocumentLoaded(initialDocumentUrl);
    } else if (orderId) {
      checkAndFetchDocument();
    }
  }, [initialDocumentUrl, orderId, onDocumentLoaded]);

  const checkAndFetchDocument = async () => {
    if (!orderId) return;
    
    setIsLoading(true);
    try {
      // First check if document exists
      const exists = await checkDocumentExists(orderId);
      setDocumentExists(exists);
      
      if (exists) {
        // If document exists, fetch it
        await fetchDocument();
      } else {
        setError("The document file is not available. Please contact the customer for the original file.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error checking document existence:', err);
      // If check fails, try to fetch anyway
      await fetchDocument();
    }
  };

  const fetchDocument = async () => {
    if (!orderId) return;
    
    setIsLoading(true);
    try {
      const url = await getDocumentUrl(orderId, documentName || 'Document');
      setDocumentUrl(url);
      setError(null);
      
      if (onDocumentLoaded) onDocumentLoaded(url);
      
      toast({
        title: "Document loaded",
        description: "The document is ready for viewing, printing, or downloading.",
      });
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Failed to load the document. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (documentUrl) {
      try {
        // Use the document API to print the document
        printDocument(documentUrl, documentName);
        
        toast({
          title: "Print dialog opened",
          description: `${documentName} is being printed.`,
        });
      } catch (error) {
        console.error('Error printing document:', error);
        toast({
          title: "Print failed",
          description: error instanceof Error ? error.message : "Unable to print document.",
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
        // Use the document API to download the document
        downloadDocument(documentUrl, documentName);
      } catch (error) {
        console.error('Error downloading document:', error);
        toast({
          title: "Download failed",
          description: error instanceof Error ? error.message : "Unable to download document.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Cannot download document",
        description: "The document is not available for downloading.",
        variant: "destructive",
      });
    }
  };
  
  // Check if the document is a PDF (for display purposes)
  const isPdf = documentUrl?.toLowerCase().endsWith('.pdf') || 
                documentUrl?.includes('pdf') ||
                (documentName?.toLowerCase().endsWith('.pdf') ?? false);
  
  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading document...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Document Error</h3>
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Available</h3>
        <p className="text-gray-600 mb-4">{fallbackMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium">{documentName}</h3>
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
            {/* Use iframe for PDF preview with fallback content */}
            <iframe 
              src={documentUrl} 
              className="w-full h-full border-0"
              title={documentName}
              onError={() => {
                setError("Failed to load document preview. You can still print or download the document.");
              }}
            >
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
                <p className="text-gray-600 mb-6">
                  Your browser cannot display this document, but you can still print or download it.
                </p>
                <div className="flex space-x-4">
                  <Button onClick={handlePrint}>Print Document</Button>
                  <Button variant="outline" onClick={handleDownload}>Download</Button>
                </div>
              </div>
            </iframe>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview Not Available</h3>
            <p className="text-gray-600 mb-6">
              This document format cannot be previewed directly in the browser.
            </p>
            <div className="flex space-x-4">
              <Button onClick={handlePrint}>Print Document</Button>
              <Button variant="outline" onClick={handleDownload}>Download</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
