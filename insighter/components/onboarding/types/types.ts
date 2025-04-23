export interface OnboardingFormData {
  businessName: string;
  industry: string;
  companySize: string;
  businessType: string;
  interests: string[];
  marketingPreference: "email" | "push" | "both";
}
