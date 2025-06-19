import { FileText, X, Book } from "lucide-react";
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
import { useEffect } from "react";

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
  useEffect(()=>{
    console.log(bindingAvailable)
  },[]);
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
    } else {
      onUpdate({
        ...fileDetail,
        [field]: value,
      });
    }
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
            </SelectContent>
          </Select>
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
