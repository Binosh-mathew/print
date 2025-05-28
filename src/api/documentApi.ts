import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

// Define the API base URL
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetches the document URL for a specific order
 * @param orderId The ID of the order
 * @param documentName The name of the document
 * @param fileIndex The index of the file in the order (defaults to 0)
 * @returns Promise with the document URL
 */
export const getDocumentUrl = async (orderId: string, documentName: string, fileIndex: number = 0): Promise<string> => {
  try {
    // In a real implementation, make an API call to get the document URL
    // For demo purposes, we'll directly use sample documents based on the document name
    // to avoid making API calls to endpoints that don't exist
    
    // NOTE: In a production environment, you would uncomment the code below
    // and implement the actual endpoint on your backend
    /*
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}/document`);
      if (response.data && response.data.documentUrl) {
        return response.data.documentUrl;
      }
    } catch (apiError) {
      console.log('API document fetch failed, using fallback documents', apiError);
      // If API fails, fall back to sample documents
    }
    */
    
    // Select sample documents based on document name
    // These are publicly available PDFs that allow embedding and printing
    console.log(`Getting document for: ${documentName}`);
    
    if (documentName.toLowerCase().includes('algorithm')) {
      return `https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf`;
    } else if (documentName.toLowerCase().includes('report')) {
      return `https://www.africau.edu/images/default/sample.pdf`;
    } else if (documentName.toLowerCase().includes('form')) {
      return `https://www.irs.gov/pub/irs-pdf/fw4.pdf`;
    } else {
      // Default document - this one works well for embedding
      return `https://www.africau.edu/images/default/sample.pdf`;
    }
  } catch (error) {
    console.error('Error fetching document URL:', error);
    throw new Error('Could not retrieve document URL');
  }
};

/**
 * Uploads a document to the server
 * @param orderId The ID of the order to associate the document with
 * @param file The file to upload
 * @returns Promise with the upload result
 */
export const uploadDocument = async (orderId: string, file: File): Promise<{ success: boolean, documentUrl?: string }> => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('document', file);
    formData.append('orderId', orderId);
    
    // Send the file to the server
    const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return {
      success: true,
      documentUrl: response.data.documentUrl
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { success: false };
  }
};

/**
 * Opens a document in a new window and triggers the print dialog
 * @param documentUrl The URL of the document to print
 * @param documentName The name of the document (for the window title)
 */
export const printDocument = (documentUrl: string, documentName: string = 'Document') => {
  try {
    // Check if the document URL is valid
    if (!documentUrl) {
      throw new Error('Document URL is not available');
    }
    
    // Open the document in a new window
    const printWindow = window.open(documentUrl, '_blank');
    
    if (printWindow) {
      // Focus the window and trigger print after a short delay to ensure the document is loaded
      printWindow.focus();
      
      // Add a small delay to allow the document to load before printing
      setTimeout(() => {
        printWindow.print();
      }, 1500); // Increased delay to ensure document loads
      
      toast({
        title: "Print dialog opened",
        description: "The document has been opened in a new window and the print dialog should appear shortly.",
      });
    } else {
      // If the window didn't open, it might be blocked by a popup blocker
      toast({
        title: "Print failed",
        description: "Unable to open the print window. Please check your popup blocker settings.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Error printing document:', error);
    toast({
      title: "Print failed",
      description: "There was an error printing the document. Please try again later.",
      variant: "destructive",
    });
  }
};

/**
 * Downloads a document
 * @param documentUrl The URL of the document to download
 * @param documentName The name to save the document as
 */
export const downloadDocument = (documentUrl: string, documentName: string = 'document.pdf') => {
  try {
    // Check if the document URL is valid
    if (!documentUrl) {
      throw new Error('Document URL is not available');
    }
    
    // For direct download of remote files, we need to handle CORS issues
    // Option 1: If the server supports it, use the download attribute
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    link.target = '_blank';
    
    // Append to the document, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "The document download should begin shortly.",
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    toast({
      title: "Download failed",
      description: "There was an error downloading the document. Please try again later.",
      variant: "destructive",
    });
  }
};

/**
 * Checks if a document exists for an order
 * @param orderId The ID of the order
 * @returns Promise with boolean indicating if document exists
 */
export const checkDocumentExists = async (orderId: string): Promise<boolean> => {
  // In a real implementation, we would check if the document exists on the server
  // For our demo, we'll simulate that documents always exist for certain order types
  // and return true without making an actual API call to avoid 404 errors
  
  // This is just for demo purposes - in a real app, you would uncomment the code below
  // and implement the actual endpoint on your backend
  
  /*
  try {
    const response = await axios.head(`${API_BASE_URL}/orders/${orderId}/document`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
  */
  
  // Always return true for the demo
  return true;
};
