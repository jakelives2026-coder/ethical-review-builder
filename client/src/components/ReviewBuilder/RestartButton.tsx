import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { getMobileTextStyles, getMobileButtonStyles } from "@/lib/mobile-standards";

interface RestartButtonProps {
  onRestart: () => void;
}

export function RestartButton({ onRestart }: RestartButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConfirmDialog(true)}
        className="text-gray-500 hover:text-gray-700"
      >
        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
        Restart
      </Button>
      
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={getMobileTextStyles("heading")}>
              Restart Review Process?
            </DialogTitle>
            <DialogDescription className={getMobileTextStyles("body")}>
              This will clear all your answers and start over from the beginning. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className={getMobileButtonStyles()}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setShowConfirmDialog(false);
                onRestart();
              }}
              className={getMobileButtonStyles()}
            >
              Yes, Restart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}