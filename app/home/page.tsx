"use client";
import { useEffect, useState } from "react";
import { ProjectCard } from "@/components/home/ProjectCard";
import { AddProjectCard } from "@/components/home/AddProjectCard";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  description: string;
  user_id: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
}

// Sample data
const SAMPLE_USER = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "demo@example.com",
  created_at: "2024-01-01T00:00:00Z",
};

const SAMPLE_PROJECTS = [
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    title: "Market Analysis Dashboard",
    description:
      "Interactive dashboard for analyzing market trends and consumer behavior",
    user_id: SAMPLE_USER.id,
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174002",
    title: "Sales Forecasting Tool",
    description:
      "ML-powered tool for predicting future sales based on historical data",
    user_id: SAMPLE_USER.id,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Simulate authentication check
    setUser(SAMPLE_USER);
    setProjects(SAMPLE_PROJECTS);
  }, []);

  const handleAddProject = (title: string, description: string) => {
    const newProject = {
      id: crypto.randomUUID(),
      title,
      description,
      user_id: SAMPLE_USER.id,
    };
    setProjects([newProject, ...projects]);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <header className="space-y-2 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Home
            </h2>
            <p className="text-lg text-muted-foreground">
              Create and manage your data analysis projects
            </p>
          </header>

          <div className="w-full h-[420px] rounded-lg overflow-hidden shadow-lg">
            <img
              src="/images/home.png"
              alt="Analytics Dashboard"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {user && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold">User Details</h2>
              <div className="mt-2">
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Joined:</strong>{" "}
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-6 justify-start">
            <AddProjectCard onAdd={handleAddProject} />
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
              />
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
