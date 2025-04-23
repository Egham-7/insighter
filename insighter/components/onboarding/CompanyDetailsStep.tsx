import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingFormData } from "./types/types";

interface CompanyDetailsStepProps {
  formData: OnboardingFormData;
  handleSelectChange: (name: string, value: string) => void;
}

export function CompanyDetailsStep({
  formData,
  handleSelectChange,
}: CompanyDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companySize">Company Size</Label>
        <Select
          value={formData.companySize}
          onValueChange={(value) => handleSelectChange("companySize", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10 employees</SelectItem>
            <SelectItem value="11-50">11-50 employees</SelectItem>
            <SelectItem value="51-200">51-200 employees</SelectItem>
            <SelectItem value="201-500">201-500 employees</SelectItem>
            <SelectItem value="500+">500+ employees</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type</Label>
        <Select
          value={formData.businessType}
          onValueChange={(value) => handleSelectChange("businessType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="b2b">B2B</SelectItem>
            <SelectItem value="b2c">B2C</SelectItem>
            <SelectItem value="both">Both B2B and B2C</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
