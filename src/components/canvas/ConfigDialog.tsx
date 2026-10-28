"use client";

/**
 * Окно настроек Koubou: описание, ключ CloseRouter и выбор модели.
 * Ключ можно оставить пустым, тогда прокси берёт CLOSEROUTER_API_KEY из .env.
 * Сохранение делает App, этот компонент только показывает поля.
 */

import * as React from "react";
import {
  Settings,
  Info,
  ArrowRight,
  AlertCircleIcon,
  CheckCircle2Icon,
  FileText,
  Github,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ModelSelect } from "@/components/canvas/ModelSelect";
import { CLOSEROUTER_KEY_HELP } from "@/lib/models";

const data = {
  nav: [
    { name: "About", icon: Info },
    { name: "Configuration", icon: Settings },
    { name: "Terms of Use", icon: FileText },
    { name: "Github", icon: Github, url: "https://github.com/za01br/koubou" },
  ],
};

/** Диалог настроек с вкладками About, Configuration и Terms */
export function ConfigDialog({
  open,
  onOpenChange,
  activeTab,
  setActiveTab,
  modelId,
  setModelId,
  apiKey,
  setApiKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  modelId: string;
  setModelId: (id: string) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
}) {
  const [showKey, setShowKey] = React.useState<boolean>(false);

  const handleNavClick = (item: (typeof data.nav)[0]) => {
    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else {
      setActiveTab(item.name.toLowerCase().replace(/ /g, ""));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            !item.url &&
                            item.name.toLowerCase().replace(/ /g, "") ===
                              activeTab
                          }
                          onClick={() => handleNavClick(item)}
                        >
                          <a>
                            <item.icon />
                            <span>{item.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-4 pl-8 pr-8">
              {activeTab === "about" && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <img src="/logo.png" alt="Logo" style={{ width: "40px" }} />
                    <h2 className="text-2xl font-semibold">Koubou</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        A BYOK (Bring Your Own Key) open-source AI canvas for
                        generating, manipulating, and editing images with AI
                        models.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Features
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                        <li>Text-to-Image generation</li>
                        <li>Image-to-Image editing</li>
                        <li>Image upload & clipboard paste</li>
                        <li>Image download (right-click)</li>
                        <li>Infinite Canvas w/ pan & zoom</li>
                        <li>Multi-image selection</li>
                        <li>Delete selected images</li>
                        <li>Resize images via drag handles</li>
                      </ul>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setActiveTab("configuration")}
                        className="cursor-pointer mt-8"
                      >
                        SET UP API KEY <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "configuration" && (
                <div>
                  <h2 className="text-lg font-semibold mb-6">Configuration</h2>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Model
                      </h4>
                      <ModelSelect value={modelId} onValueChange={setModelId} />
                    </div>

                    <div>
                      <Label
                        htmlFor="apiKey"
                        className="text-sm text-gray-700 mb-1 block"
                      >
                        {CLOSEROUTER_KEY_HELP.title}
                      </Label>
                      <div className="relative w-[420px]">
                        <Input
                          id="apiKey"
                          type={showKey ? "text" : "password"}
                          placeholder="Enter your API key"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowKey((prev) => !prev)}
                        >
                          {showKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Alert className="mt-2">
                        <AlertCircleIcon className="h-4 w-4" />
                        <AlertTitle>Get your API Key</AlertTitle>
                        <AlertDescription>
                          <a
                            href={CLOSEROUTER_KEY_HELP.href}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {CLOSEROUTER_KEY_HELP.href}
                          </a>{" "}
                          {CLOSEROUTER_KEY_HELP.note}
                        </AlertDescription>
                      </Alert>
                      <Alert
                        variant="destructive"
                        className="mt-2 text-red-500"
                      >
                        <CheckCircle2Icon className="h-4 w-4 text-red-500" />
                        <AlertTitle className="text-red-500">Safety</AlertTitle>
                        <AlertDescription className="text-red-500">
                          <ul className="list-disc pl-5">
                            <li>
                              Calls go to CloseRouter through this app's local
                              proxy (check the network tab)
                            </li>
                            <li>
                              API key is stored in your browser's local storage.
                            </li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                      <Button
                        variant="destructive"
                        className="mt-4 cursor-pointer"
                        onClick={() => setApiKey("")}
                      >
                        Delete API Key
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "termsofuse" && (
                <div>
                  <h2 className="text-lg font-semibold mb-6">Terms of Use</h2>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      By using this application, you agree and you understand
                      the following:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                      <li>
                        <strong>No Data Storad:</strong> This application does
                        not store any of your data, including images, prompts,
                        or API key on its servers.
                      </li>
                      <li>
                        <strong>Direct API Connection:</strong> Your API key is
                        used to connect to CloseRouter. You are responsible for
                        complying with CloseRouter's terms.
                      </li>
                      <li>
                        <strong>Open Source Project:</strong> This is an
                        open-source project. The code is publicly available for
                        review. We are not responsible for any misuse of the
                        application.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
