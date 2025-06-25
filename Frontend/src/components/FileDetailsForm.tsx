import { FileText, X, Book, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FileDetails } from "@/types/order";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { parseColorPages } from "@/utils/printUtils";

interface FileDetailsFormProps {
  fileDetail: FileDetails;
  onUpdate: (updatedDetails: FileDetails) => void;
  onRemove: () => void;
  bindingAvailable?: boolean;
}

const FileDetailsForm = ({
  fileDetail,
  onUpdate,
  onRemove,
  bindingAvailable,
}: FileDetailsFormProps) => {
  // Track parsed color pages for display
  const [parsedColorPages, setParsedColorPages] = useState<number[]>([]);
  const [invalidPageWarning, setInvalidPageWarning] = useState<string | null>(null);
  
  // Effect to parse color pages when they change
  useEffect(() => {
    if (fileDetail.printType === "mixed" && fileDetail.colorPages) {
      // First parse without limiting to catch any out-of-range pages
      const parsedPages = parseColorPages(fileDetail.colorPages);
      setParsedColorPages(parsedPages);
      
      // Check if any page is beyond the document's total pages
      if (fileDetail.pageCount && parsedPages.length > 0) {
        const maxPage = Math.max(...parsedPages);
        if (maxPage > fileDetail.pageCount) {
          setInvalidPageWarning(`Page ${maxPage} exceeds the document's total page count (${fileDetail.pageCount}).`);
        } else {
          setInvalidPageWarning(null);
        }
      } else {
        setInvalidPageWarning(null);
      }
    } else {
      setParsedColorPages([]);
      setInvalidPageWarning(null);
    }
  }, [fileDetail.printType, fileDetail.colorPages, fileDetail.pageCount]);

  const handleChange = (
    field: keyof FileDetails | "bindingNeeded" | "bindingType" | "specialPaper",
    value: any
  ) => {
    if (field === "bindingNeeded") {
      onUpdate({
        ...fileDetail,
        binding: {
          ...fileDetail.binding,
          needed: value,
          type: value ? fileDetail.binding.type : "none",
        },
      });
    } else if (field === "bindingType") {
      onUpdate({
        ...fileDetail,
        binding: {
          ...fileDetail.binding,
          type: value,
        },
      });
    } else if (field === "specialPaper") {
      onUpdate({
        ...fileDetail,
        specialPaper: value,
      });
    } else if (field === "printType") {
      // When changing print type, reset colorPages if not mixed
      onUpdate({
        ...fileDetail,
        [field]: value,
        colorPages: value === "mixed" ? fileDetail.colorPages || "" : "",
      });
    } else if (field === "colorPages") {
      // For colorPages, we'll do additional validation against pageCount
      // But we'll keep the original input for now - validation warning will show if needed
      onUpdate({
        ...fileDetail,
        colorPages: value,
      });
    } else {
      onUpdate({
        ...fileDetail,
        [field]: value,
      });
    }
  };

  // Validates color pages against total pages and returns cleaned input
  const validateColorPages = (input: string, pageCount?: number) => {
    if (!pageCount) return input; // Can't validate without knowing page count
    
    const parsedPages = parseColorPages(input);
    const validPages = parsedPages.filter(page => page <= pageCount);
    
    // If all pages are valid, return original input
    if (validPages.length === parsedPages.length) {
      return input;
    }
    
    // Otherwise, rebuild a cleaned string with only valid pages
    return convertPagesToString(validPages);
  };
  
  // Convert array of page numbers back to range string format
  const convertPagesToString = (pages: number[]): string => {
    if (pages.length === 0) return '';
    
    const sortedPages = [...pages].sort((a, b) => a - b);
    const ranges: string[] = [];
    
    let rangeStart = sortedPages[0];
    let rangeEnd = rangeStart;
    
    for (let i = 1; i < sortedPages.length; i++) {
      if (sortedPages[i] === rangeEnd + 1) {
        // Continue the current range
        rangeEnd = sortedPages[i];
      } else {
        // End the current range and start a new one
        ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
        rangeStart = sortedPages[i];
        rangeEnd = rangeStart;
      }
    }
    
    // Add the last range
    ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
    
    return ranges.join(',');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-scale-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fileDetail.file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(fileDetail.file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`copies-${fileDetail.file.name}`}>Copies</Label>
          <Input
            id={`copies-${fileDetail.file.name}`}
            type="number"
            min="1"
            value={fileDetail.copies}
            onChange={(e) =>
              handleChange("copies", parseInt(e.target.value) || 1)
            }
            className="w-24"
          />
        </div>

        <div className="space-y-2">
          <Label>Additional Special Paper</Label>
          <Select
            value={fileDetail.specialPaper}
            onValueChange={(value) => handleChange("specialPaper", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select if you need special paper" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No additional paper</SelectItem>
              <SelectItem value="glossy">Glossy Paper (A4)</SelectItem>
              <SelectItem value="matte">Matte Paper (A4)</SelectItem>
              <SelectItem value="transparent">
                Transparent Sheet (A4)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            All printing is done on normal A4 white paper. This is an option to
            purchase additional special paper separate from your prints.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Print Type</Label>
          <Select
            value={fileDetail.printType}
            onValueChange={(value) => handleChange("printType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select print type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blackAndWhite">Black & White</SelectItem>
              <SelectItem value="color">Color</SelectItem>
              <SelectItem value="mixed">Mixed (B&W + Color)</SelectItem>
            </SelectContent>
          </Select>
          {fileDetail.pageCount ? (
            <p className="text-xs text-muted-foreground mt-1">
              Document has {fileDetail.pageCount} total pages
            </p>
          ) : null}
          
          {fileDetail.printType === "mixed" && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-1">
                <Label htmlFor={`color-pages-${fileDetail.file.name}`} className="text-xs">Color Pages</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Enter page numbers to print in color, separated by commas.
                        Examples: "1,5,10-15" or "1,3,5-8,10"
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id={`color-pages-${fileDetail.file.name}`}
                type="text"
                placeholder="e.g., 1,3,5-8,10"
                value={fileDetail.colorPages || ''}
                onChange={(e) => handleChange("colorPages", e.target.value)}
                className={`text-sm ${invalidPageWarning ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              
              {invalidPageWarning && (
                <div className="flex flex-col space-y-1 mt-1">
                  <p className="text-xs text-red-500">
                    {invalidPageWarning}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      // Auto-fix by validating against page count
                      const validInput = validateColorPages(fileDetail.colorPages || "", fileDetail.pageCount);
                      handleChange("colorPages", validInput);
                    }}
                    className="text-xs text-primary hover:text-primary/90 font-medium"
                  >
                    Auto-correct to valid pages
                  </button>
                </div>
              )}
              
              {parsedColorPages.length > 0 && !invalidPageWarning && (
                <div className="mt-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {parsedColorPages.length}
                    </span> page(s) will be printed in color:
                    <span className="ml-1 font-medium">
                      {parsedColorPages.length <= 10 
                        ? parsedColorPages.join(', ')
                        : `${parsedColorPages.slice(0, 10).join(', ')}... (${parsedColorPages.length - 10} more)`
                      }
                    </span>
                  </p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
                All other pages will be printed in black & white
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Double Sided</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={fileDetail.doubleSided}
              onCheckedChange={(checked) =>
                handleChange("doubleSided", checked)
              }
            />
            <Label>{fileDetail.doubleSided ? "Yes" : "No"}</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2 ">
          <div className="flex items-center space-x-2 justify-between">
            <div className="flex items-center space-x-2">
              <Book className="h-4 w-4 text-primary" /> 
              <Label>Binding Options</Label>
            </div>
            {!bindingAvailable ? <span className="text-red-500 font-semibold text-sm">Unavailable</span> : null}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
            disabled={!bindingAvailable}
              checked={fileDetail.binding.needed}
              onCheckedChange={(checked) =>
                handleChange("bindingNeeded", checked)
              }
            />
            <Label>Need binding?</Label>
          </div>
        </div>

        {fileDetail.binding.needed && (
          <RadioGroup
            value={fileDetail.binding.type}
            onValueChange={(value) => handleChange("bindingType", value)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spiralBinding" id="spiral" />
              <Label htmlFor="spiral">Spiral Binding</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="staplingBinding" id="stapling" />
              <Label htmlFor="stapling">Stapling</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hardcoverBinding" id="hardcover" />
              <Label htmlFor="hardcover">Hardcover</Label>
            </div>
          </RadioGroup>
        )}
      </div>

      <div className="space-y-2">
        <Label>Specific Requirements</Label>
        <textarea
          value={fileDetail.specificRequirements}
          onChange={(e) => handleChange("specificRequirements", e.target.value)}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
          placeholder="Add any specific requirements for this file..."
        />
      </div>
    </div>
  );
};

export default FileDetailsForm;
