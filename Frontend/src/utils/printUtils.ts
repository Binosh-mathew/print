import { FileDetails } from "@/types/order";

/**
 * Parse a string of color pages into an array of page numbers
 * Formats supported:
 * - Individual pages: "1,3,5"
 * - Ranges: "1-5,7-9"
 * - Mixed: "1,3-5,7,9-11"
 * 
 * @param colorPagesStr The string containing page numbers
 * @param maxPages Optional maximum page count for validation
 * @returns Array of page numbers
 */
export const parseColorPages = (colorPagesStr: string, maxPages?: number): number[] => {
  if (!colorPagesStr.trim()) {
    return [];
  }

  const colorPages: number[] = [];
  
  // Split by comma
  const parts = colorPagesStr.split(',');
  
  for (const part of parts) {
    const trimmedPart = part.trim();
    
    // Check if it's a range (contains a hyphen)
    if (trimmedPart.includes('-')) {
      const [startStr, endStr] = trimmedPart.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);
      
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        // Add all pages in the range
        for (let i = start; i <= end; i++) {
          // If maxPages is provided, only add pages within the range
          if (maxPages === undefined || i <= maxPages) {
            if (!colorPages.includes(i)) {
              colorPages.push(i);
            }
          }
        }
      }
    } else {
      // Individual page number
      const pageNum = parseInt(trimmedPart, 10);
      if (!isNaN(pageNum) && pageNum > 0 && 
          (maxPages === undefined || pageNum <= maxPages) && 
          !colorPages.includes(pageNum)) {
        colorPages.push(pageNum);
      }
    }
  }
  
  // Sort the pages in ascending order
  return colorPages.sort((a, b) => a - b);
};

/**
 * Calculate pricing for a mixed printing job
 * 
 * @param fileDetail The file details
 * @param pricing The pricing configuration
 * @returns Object containing total price and breakdown
 */
export const calculateMixedPrintingPrice = (
  fileDetail: FileDetails, 
  pricing: { 
    blackAndWhite: { singleSided: number, doubleSided: number },
    color: { singleSided: number, doubleSided: number } 
  }
) => {
  // Get page count or default to 0
  const totalPages = fileDetail.pageCount || 0;
  
  if (totalPages === 0) {
    return { total: 0, colorPagesCount: 0, bwPagesCount: 0 };
  }
  
  // Parse color pages with page count validation to filter out invalid pages
  const colorPages = parseColorPages(fileDetail.colorPages || "", totalPages);
  
  // Number of pages to print in color
  const colorPagesCount = colorPages.length;
  
  // Number of pages to print in black and white
  const bwPagesCount = totalPages - colorPagesCount;
  
  // Calculate price based on print type (single/double sided)
  const sideType = fileDetail.doubleSided ? 'doubleSided' : 'singleSided';
  
  // Calculate price for each type
  const colorPrice = colorPagesCount * pricing.color[sideType];
  const bwPrice = bwPagesCount * pricing.blackAndWhite[sideType];
  
  // Total price
  const total = colorPrice + bwPrice;
  
  return {
    total,
    colorPagesCount,
    bwPagesCount,
    colorPrice,
    bwPrice,
    validColorPages: colorPages
  };
};
