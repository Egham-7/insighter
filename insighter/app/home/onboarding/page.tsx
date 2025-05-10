"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessInfoStep } from "@/components/onboarding/BusinessInfoStep";
import { CompanyDetailsStep } from "@/components/onboarding/CompanyDetailsStep";
import { PreferencesStep } from "@/components/onboarding/PreferencesStep";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OnboardingFormData } from "@/components/onboarding/types/types";

const OnboardingPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    businessName: "",
    industry: "",
    companySize: "",
    businessType: "",
    interests: [],
    marketingPreference: "email",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => {
      const currentInterests = prev.interests || [];
      return {
        ...prev,
        interests: currentInterests.includes(interest)
          ? currentInterests.filter((i) => i !== interest)
          : [...currentInterests, interest],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    router.push("/home");
  };

  const businessInterests = [
    "Digital Marketing",
    "E-commerce",
    "Finance",
    "Technology",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Healthcare",
  ];

  const progressValue = (step / 3) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <BusinessInfoStep
            formData={formData}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
          />
        );
      case 2:
        return (
          <CompanyDetailsStep
            formData={formData}
            handleSelectChange={handleSelectChange}
          />
        );
      case 3:
        return (
          <PreferencesStep
            formData={formData}
            handleInterestToggle={handleInterestToggle}
            handleSelectChange={handleSelectChange}
            businessInterests={businessInterests}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="container flex flex-col items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to Insighter for Business!
            </CardTitle>
            <CardDescription className="text-center">
              {"Let's set up your business profile"}
            </CardDescription>
            <Progress value={progressValue} className="mt-2" />
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">{renderStep()}</CardContent>

            <CardFooter className="flex justify-between">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className={step > 1 ? "ml-auto" : "w-full"}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" className="ml-auto">
                  Complete
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
