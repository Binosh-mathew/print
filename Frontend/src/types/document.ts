export interface DocumentViewerProps {
  orderId?: string;
  documentUrl?: string;
  documentName?: string;
  fileIndex?: number;
  fallbackMessage?: string;
  onDocumentLoaded?: (url: string) => void;
}