import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingFormData } from "./types/types";

interface BusinessInfoStepProps {
  formData: OnboardingFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export function BusinessInfoStep({
  formData,
  handleInputChange,
  handleSelectChange,
}: BusinessInfoStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          name="businessName"
          type="text"
          required
          value={formData.businessName}
          onChange={handleInputChange}
          placeholder="Enter your business name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Select
          value={formData.industry}
          onValueChange={(value) => handleSelectChange("industry", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="services">Professional Services</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
