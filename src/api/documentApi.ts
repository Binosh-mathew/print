import axios from "../config/axios";
import { toast } from "@/components/ui/use-toast";

/**
 * Fetches the document URL for a specific order
 * @param orderId The ID of the order
 * @param documentName The name of the document
 * @param fileIndex The index of the file in the order (defaults to 0)
 * @returns Promise with the document URL
 */
export const getDocumentUrl = async (
  orderId: string,
  fileIndex: number = 0
): Promise<string> => {
  try {
    // Fetch the order details to get the document URL
    const response = await axios.get(
      `/orders/${orderId}?timestamp=${new Date().getTime()}`,
      {}
    );

    if (
      response.data &&
      response.data.files &&
      response.data.files.length > fileIndex    ) {
      const file = response.data.files[fileIndex];
      if (file && file.fileName) {
        return file.fileName;
      }
    }

    // Fallback if the document URL is not found
    throw new Error("Document URL not found in order details");
  } catch (error) {
    console.error("Error fetching document URL:", error);
    toast({
      title: "Could not load document",
      description:
        "The document URL could not be retrieved. Please try again later.",
      variant: "destructive",
    });
    throw new Error("Could not retrieve document URL");
  }
};

/**
 * Uploads a document to the server
 * @param orderId The ID of the order to associate the document with
 * @param file The file to upload
 * @returns Promise with the upload result
 */
export const uploadDocument = async (
  orderId: string,
  file: File
): Promise<{ success: boolean; documentUrl?: string }> => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("document", file);
    formData.append("orderId", orderId);

    // Send the file to the server
    const response = await axios.post(`/documents/upload`, formData);

    return {
      success: true,
      documentUrl: response.data.documentUrl,
    };
  } catch (error) {
    console.error("Error uploading document:", error);
    return { success: false };
  }
};

/**
 * Opens a document in a new window and triggers the print dialog
 * @param documentUrl The URL of the document to print
 * @param documentName The name of the document (for the window title)
 */
export const printDocument = (
  documentUrl: string,
  documentName: string = "Document" // Keep parameter for API compatibility
) => {
  try {
    // Check if the document URL is valid
    if (!documentUrl) {
      throw new Error("Document URL is not available");
    }

    // Try using an iframe approach instead of window.open to avoid fullscreen permission issues
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = documentUrl;
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Remove the iframe after printing is initiated
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 1000);

        toast({
          title: "Print dialog opened",
          description: "The print dialog should appear shortly.",
        });
      } catch (err) {
        console.error("Error in iframe print:", err);
        // Fallback to window.open if iframe approach fails
        const printWindow = window.open(documentUrl, "_blank");

        if (printWindow) {
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 1500);
        } else {
          throw new Error("Unable to open print window");
        }
      }
    };

    document.body.appendChild(iframe);
  } catch (error) {
    console.error("Error printing document:", error);
    toast({
      title: "Print failed",
      description:
        "There was an error printing the document. Please try again later.",
      variant: "destructive",
    });
  }
};

/**
 * Downloads a document
 * @param documentUrl The URL of the document to download
 * @param documentName The name to save the document as
 */
export const downloadDocument = (
  documentUrl: string,
  documentName: string = "document.pdf"
) => {
  try {
    // Check if the document URL is valid
    if (!documentUrl) {
      throw new Error("Document URL is not available");
    }

    // For direct download of remote files, we need to handle CORS issues
    // Option 1: If the server supports it, use the download attribute
    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = documentName;
    link.target = "_blank";

    // Append to the document, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "The document download should begin shortly.",
    });
  } catch (error) {
    console.error("Error downloading document:", error);
    toast({
      title: "Download failed",
      description:
        "There was an error downloading the document. Please try again later.",
      variant: "destructive",
    });
  }
};

/**
 * Checks if a document exists for an order
 * @param orderId The ID of the order
 * @returns Promise with boolean indicating if document exists
 */
export const checkDocumentExists = async (): Promise<boolean> => {
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
