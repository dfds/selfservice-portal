import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDemoSignups } from "@/state/remote/queries/demos";
import { Text } from "@/components/ui/Text";

export default function DemoSignupModal({ isOpen, onClose }) {
  const { isFetched: isFetchedSignups, data: signups } = useDemoSignups();

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demo signups</DialogTitle>
        </DialogHeader>
        {!isFetchedSignups ? (
          <Text>Loading...</Text>
        ) : (
          <>
            {signups && signups.length > 0 ? (
              <>
                {signups.map((signup) => (
                  <Text key={signup.email}>
                    {signup.name} ({signup.email})
                  </Text>
                ))}
              </>
            ) : (
              <Text>No one has signed up yet.</Text>
            )}
          </>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(
                signups.map((signup) => signup.email).join(", "),
              );
            }}
          >
            Copy e-mails to clipboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
