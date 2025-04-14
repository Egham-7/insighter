"use client";

import { useCallback, useState } from "react";
import { runStagehand, startBBSSession } from "@/stagehand/main";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function StagehandEmbed() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [debugUrl, setDebugUrl] = useState<string | null>(null);

  const startSession = useCallback(async () => {
    try {
      const { sessionId, debugUrl } = await startBBSSession();
      setSessionId(sessionId);
      setDebugUrl(debugUrl);
      await runStagehand(sessionId);
    } catch (error) {
      console.error("Failed to start session:", error);
      toast.error("Failed to start session");
    }
  }, []);

  const resetSession = useCallback(() => {
    setSessionId(null);
    setDebugUrl(null);
  }, []);

  return (
    <Card className="w-full h-full rounded-none border shadow-sm overflow-hidden flex flex-col">
      <CardContent className="flex-1 p-0">
        {!sessionId && (
          <div className="flex flex-col items-center gap-4 justify-center h-full p-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Start a new session to see Insighter in action
              </p>
            </div>
            <Button onClick={startSession} className="gap-3">
              <Search className="h-4 w-4" />
              Start Session
            </Button>
          </div>
        )}

        {sessionId && debugUrl && (
          <div className="w-full h-full">
            <iframe
              src={debugUrl}
              className="w-full h-full border-0"
              title="Insighter Interface"
            />
          </div>
        )}
      </CardContent>

      {sessionId && debugUrl && (
        <CardFooter className="border-t bg-muted/30 py-2 px-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">
                Session active
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSession}
                className="h-8"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
              <Button variant="outline" size="sm" asChild className="h-8">
                <a href={debugUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Open
                </a>
              </Button>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
