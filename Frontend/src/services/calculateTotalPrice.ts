import { FileDetails } from "@/types/order";
import { parseColorPages } from "@/utils/printUtils";

export const calculateTotalPrice = (
    fileDetails: FileDetails[],
    pricing: any = null,
    selectedStorePricing: any = null
  ) => {
    // If no pricing data is provided, use default pricing
    const defaultPricing = {
      blackAndWhite: { singleSided: 2, doubleSided: 3 },
      color: { singleSided: 5, doubleSided: 8 },
      binding: { spiralBinding: 25, staplingBinding: 10, hardcoverBinding: 50 },
      paperTypes: { normal: 0, glossy: 5, matte: 7, transparent: 10 },
    };

    // Use store pricing if available, otherwise use default pricing
    const storePricing = pricing || selectedStorePricing || defaultPricing;

    return fileDetails.reduce((total, file) => {
      // Get the appropriate price based on print type and whether it's double-sided
      let basePricePerPage;
      let basePrice = 0;

      // Use actual page count from file metadata or estimate based on file size
      // For PDF files, we can get a more accurate page count
      let pageCount = 0;

      if (file.pageCount && file.pageCount > 0) {
        // Use the page count if it's available in the file metadata
        pageCount = file.pageCount;
      } else {
        // Estimate page count based on file size (rough estimate: 100KB per page for PDFs)
        const fileSizeInKB = file.file.size / 1024;
        pageCount = Math.max(1, Math.ceil(fileSizeInKB / 100));
      }

      const copiesMultiplier = file.copies || 1;

      // Handle mixed printing differently
      if (file.printType === "mixed") {
        // Use the imported parseColorPages function
        
        // Get color pages
        const colorPages = parseColorPages(file.colorPages || "", pageCount);
        const colorPagesCount = colorPages.length;
        const bwPagesCount = pageCount - colorPagesCount;

        // Calculate price for color pages
        const colorPricePerPage = file.doubleSided
          ? storePricing.color?.doubleSided || defaultPricing.color.doubleSided
          : storePricing.color?.singleSided || defaultPricing.color.singleSided;
        
        // Calculate price for B&W pages
        const bwPricePerPage = file.doubleSided
          ? storePricing.blackAndWhite?.doubleSided || defaultPricing.blackAndWhite.doubleSided
          : storePricing.blackAndWhite?.singleSided || defaultPricing.blackAndWhite.singleSided;
        
        // Calculate combined price
        basePrice = (colorPricePerPage * colorPagesCount + bwPricePerPage * bwPagesCount) * copiesMultiplier;
      } else if (file.printType === "color") {
        basePricePerPage = file.doubleSided
          ? storePricing.color?.doubleSided || defaultPricing.color.doubleSided
          : storePricing.color?.singleSided || defaultPricing.color.singleSided;
        
        basePrice = basePricePerPage * pageCount * copiesMultiplier;
      } else {
        // blackAndWhite
        basePricePerPage = file.doubleSided
          ? storePricing.blackAndWhite?.doubleSided ||
            defaultPricing.blackAndWhite.doubleSided
          : storePricing.blackAndWhite?.singleSided ||
            defaultPricing.blackAndWhite.singleSided;
        
        basePrice = basePricePerPage * pageCount * copiesMultiplier;
      }

      // Additional costs for special paper
      let specialPaperCost = 0;
      if (file.specialPaper !== "none") {
        specialPaperCost =
          (storePricing.paperTypes?.[file.specialPaper] ||
            defaultPricing.paperTypes[file.specialPaper]) *
          pageCount *
          copiesMultiplier;
      }

      // Binding costs
      let bindingCost = 0;
      if (file.binding.needed && file.binding.type !== "none") {
        bindingCost =
          storePricing.binding?.[file.binding.type] ||
          defaultPricing.binding[file.binding.type];
      }

      return total + basePrice + specialPaperCost + bindingCost;
    }, 0);
  };