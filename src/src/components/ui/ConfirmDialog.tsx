import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  confirmLoadingLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive" | "action" | "outline";
  onConfirm: () => void;
  isPending?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  confirmLoadingLabel,
  cancelLabel = "Cancel",
  confirmVariant = "destructive",
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-secondary">{description}</div>
        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending
              ? (confirmLoadingLabel ?? `${confirmLabel}…`)
              : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
