"use client";

import { useState } from "react";
import type React from "react";
import { SiMeta, SiGoogleads, SiLinkedin, SiTiktok } from "react-icons/si";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "../ui/card";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MultiStepLoader } from "../ui/multi-step-loader";

type DataSource = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

export default function ConnectDataSourceModal() {
  const [open, setOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  const dataSources: DataSource[] = [
    {
      id: "meta-ads",
      name: "Meta Ads",
      icon: <SiMeta className="h-12 w-12" />,
    },
    {
      id: "google-ads",
      name: "Google Ads",
      icon: <SiGoogleads className="h-12 w-12" />,
    },
    {
      id: "linkedin-ads",
      name: "LinkedIn Ads",
      icon: <SiLinkedin className="h-12 w-12" />,
    },
    {
      id: "tiktok-ads",
      name: "TikTok Ads",
      icon: <SiTiktok className="h-12 w-12" />,
    },
  ];

  const handleSelectSource = (sourceId: string) => {
    setSelectedSource(sourceId);
  };

  // Updated loading states with clearer, sequential steps
  const loadingStates = [
    { text: "Initiating connection..." },
    { text: "Verifying credentials..." },
    { text: "Finalizing setup..." },
  ];

  const handleConnect = async () => {
    if (!selectedSource) return;

    setIsConnecting(true);

    try {
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log(`Connected to ${selectedSource}`);
      setOpen(false);
      setSelectedSource(null);
      router.push(`/home/datasources/${selectedSource}`);
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    if (!isConnecting) {
      setSelectedSource(null);
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isConnecting) {
      setOpen(newOpen);
      if (!newOpen) {
        setSelectedSource(null);
      }
    }
  };

  if (isConnecting) {
    return (
      <MultiStepLoader
        loadingStates={loadingStates}
        loading
        duration={2000}
        loop
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost">+</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Connect Data Source
          </DialogTitle>
          <DialogDescription>
            Select a platform to connect your advertising data
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
          {dataSources.map((source) => (
            <Card
              key={source.id}
              onClick={() => handleSelectSource(source.id)}
              className={cn(
                "flex flex-col items-center justify-center cursor-pointer transition-all duration-150 ease-in-out border-2",
                selectedSource === source.id
                  ? "border-primary ring-2 ring-primary ring-offset-background ring-offset-2 bg-primary/10"
                  : "border-transparent hover:border-border hover:bg-accent",
              )}
            >
              <CardHeader className="justify-center items-center p-4 pb-2">
                {source.icon}
              </CardHeader>
              <CardContent className="p-4 pt-2 text-center">
                <span className="font-medium text-foreground">
                  {source.name}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center border-t pt-4 gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isConnecting}>
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={!selectedSource || isConnecting}
            className="min-w-[120px]"
          >
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
