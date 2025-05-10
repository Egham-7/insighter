import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingFormData } from "./types/types";

interface PreferencesStepProps {
  formData: OnboardingFormData;
  handleInterestToggle: (interest: string) => void;
  handleSelectChange: (name: string, value: string) => void;
  businessInterests: string[];
}

export function PreferencesStep({
  formData,
  handleInterestToggle,
  handleSelectChange,
  businessInterests,
}: PreferencesStepProps) {
  return (
    <div className="space-y-4">
      <Label>Select Business Goals</Label>
      <div className="flex flex-wrap gap-2">
        {businessInterests.map((interest) => (
          <Badge
            key={interest}
            variant={
              formData.interests.includes(interest) ? "default" : "outline"
            }
            className="cursor-pointer text-sm px-3 py-1"
            onClick={() => handleInterestToggle(interest)}
          >
            {interest}
          </Badge>
        ))}
      </div>
      <div className="space-y-2 mt-4">
        <Label htmlFor="marketingPreference">
          How would you like to receive updates?
        </Label>
        <Select
          value={formData.marketingPreference}
          onValueChange={(value) =>
            handleSelectChange("marketingPreference", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select contact preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email Updates</SelectItem>
            <SelectItem value="push">Push Notifications</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
