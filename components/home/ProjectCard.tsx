"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
}

export function ProjectCard({ id, title, description }: ProjectCardProps) {
  const router = useRouter();
  return (
    <Card className="w-[350px] h-[200px] flex flex-col justify-between p-4">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-4">{description}</CardDescription>
      </div>
      <Button onClick={() => router.push(`/projects/${id}`)}>
        View Project
      </Button>
    </Card>
  );
}
