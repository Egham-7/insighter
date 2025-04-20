import type React from "react";
import Link from "next/link";
import { SiGoogleads } from "react-icons/si";

import {
  SidebarGroup,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from "../ui/sidebar";

import ConnectDataSourceModal from "./ConnectDataSourceModal";

const items = [
  {
    id: "google-ads",
    title: "Google Ads",
    icon: SiGoogleads,
    url: "/home/datasources/google-ads/",
  },
];

const DatasourceNavGroup = () => {
  return (
    <SidebarGroup>
      <div className="flex  justify-between items-center px-4 py-1 mb-1">
        <SidebarGroupLabel>Datasources</SidebarGroupLabel>
        <ConnectDataSourceModal />
      </div>

      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild tooltip={item.title}>
              <Link href={item.url}>
                {item.icon && (
                  <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                )}
                <span className="truncate flex-grow">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default DatasourceNavGroup;
