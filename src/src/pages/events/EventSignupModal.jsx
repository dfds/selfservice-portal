import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEventSignups } from "@/state/remote/queries/events";
import { Text } from "@/components/ui/Text";

const SEPARATOR_OPTIONS = [
  { label: "Comma (,)", value: ", " },
  { label: "Semicolon (;)", value: "; " },
  { label: "New line", value: "\n" },
  { label: "Pipe (|)", value: " | " },
];

export default function EventSignupModal({ isOpen, onClose }) {
  const { isFetched: isFetchedSignups, data: signups } = useEventSignups();
  const [emailSeparator, setEmailSeparator] = React.useState(", ");

  const signupEmails = (signups ?? []).map((signup) => signup.email);
  const copiedEmails = signupEmails.join(emailSeparator);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Event signups</DialogTitle>
        </DialogHeader>
        <div className="my-4 space-y-2 overflow-y-auto flex-1">
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
        </div>
        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <label htmlFor="email-separator" className="text-sm font-medium">
              E-mail separator
            </label>
            <select
              id="email-separator"
              value={emailSeparator}
              onChange={(event) => setEmailSeparator(event.target.value)}
              className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
            >
              {SEPARATOR_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="outline"
            disabled={signupEmails.length === 0}
            onClick={async () => {
              await navigator.clipboard.writeText(copiedEmails);
            }}
          >
            Copy e-mails to clipboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
