import React, { useState } from "react";
import { Save, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { queryClient } from "@/state/remote/client";
import {
  useJsonSchema,
  useUpdateJsonSchema,
  useValidateJsonSchema,
} from "@/state/remote/queries/jsonschema";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const KNOWN_SCHEMA_IDS = ["capability"];

// ── Schema editor ─────────────────────────────────────────────────────────────

function SchemaEditor({ schemaId }: { schemaId: string }) {
  const toast = useToast();
  const { data, isFetched, refetch, isFetching } = useJsonSchema(schemaId);
  const updateSchema = useUpdateJsonSchema();
  const validateSchema = useValidateJsonSchema();

  const [text, setText] = useState<string | null>(null);
  const [textError, setTextError] = useState("");
  const [validationResult, setValidationResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  // Initialise editor text once schema loads
  React.useEffect(() => {
    if (isFetched && text === null) {
      let initial = "{}";
      if (data !== undefined && data !== null) {
        const raw: any = data;
        // API wraps the schema in a "schema" field as a JSON string
        const schemaField = raw.schema ?? raw;
        if (typeof schemaField === "string") {
          try {
            initial = JSON.stringify(JSON.parse(schemaField), null, 2);
          } catch {
            initial = schemaField;
          }
        } else {
          initial = JSON.stringify(schemaField, null, 2);
        }
      }
      setText(initial);
    }
  }, [isFetched, data]);

  function handleValidate() {
    if (text === null) return;
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      setTextError("Invalid JSON");
      return;
    }
    setTextError("");
    validateSchema.mutate({ schema: parsed }, {
      onSuccess: (result: any) => {
        setValidationResult({
          ok: true,
          message: result?.message ?? "Schema is valid",
        });
      },
      onError: (err: any) => {
        setValidationResult({
          ok: false,
          message: err?.data?.message ?? "Validation failed",
        });
      },
    });
  }

  function handleSave() {
    if (text === null) return;
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      setTextError("Invalid JSON");
      return;
    }
    setTextError("");
    updateSchema.mutate(
      { schemaId, schema: { schema: parsed } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["json-schema", schemaId] });
          toast.success("Schema saved");
          setValidationResult(null);
        },
        onError: () => toast.error("Could not save schema"),
      },
    );
  }

  if (!isFetched) {
    return (
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full rounded-[6px]" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SectionLabel className="block">
          Schema:{" "}
          <span className="font-mono text-primary">{schemaId}</span>
        </SectionLabel>
        <button
          type="button"
          onClick={() => {
            setText(null);
            refetch();
          }}
          disabled={isFetching}
          className="p-0.5 rounded text-muted hover:text-action transition-colors cursor-pointer border-0 bg-transparent"
          aria-label="Reload schema"
        >
          <RefreshCw
            size={12}
            strokeWidth={1.75}
            className={isFetching ? "animate-spin" : ""}
          />
        </button>
      </div>

      <div>
        <textarea
          value={text ?? ""}
          onChange={(e) => {
            setText(e.target.value);
            setTextError("");
            setValidationResult(null);
          }}
          rows={22}
          className={cn(
            "w-full text-xs font-mono p-3 border rounded-[6px] bg-background text-primary resize-y focus:outline-none focus:ring-1 focus:ring-action",
            textError ? "border-destructive" : "border-input",
          )}
          spellCheck={false}
        />
        {textError && (
          <p className="text-xs text-destructive mt-1 font-mono">{textError}</p>
        )}
      </div>

      {validationResult && (
        <div
          className={cn(
            "flex items-center gap-2 p-2.5 rounded-[6px] text-xs font-mono",
            validationResult.ok
              ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {validationResult.ok ? (
            <CheckCircle2 size={13} strokeWidth={1.75} />
          ) : (
            <XCircle size={13} strokeWidth={1.75} />
          )}
          <span>{validationResult.message}</span>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleValidate}
          disabled={validateSchema.isPending || text === null}
        >
          {validateSchema.isPending ? "Validating…" : "Validate"}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={updateSchema.isPending || text === null}
        >
          <Save size={13} strokeWidth={1.75} className="mr-1.5" />
          {updateSchema.isPending ? "Saving…" : "Save Schema"}
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JsonSchemaEditorPage() {
  const [loadedSchemaId, setLoadedSchemaId] = useState("");
  const [inputValue, setInputValue] = useState("");

  function handleLoad(e: React.FormEvent) {
    e.preventDefault();
    if (inputValue.trim()) {
      setLoadedSchemaId(inputValue.trim());
    }
  }

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="JSON Schema Editor"
        subtitle="View, validate, and update JSON schemas used to validate capability metadata."
      />

      {/* Schema ID input */}
      <div className="mb-6">
        <SectionLabel className="block mb-2">Schema ID</SectionLabel>
        <form onSubmit={handleLoad} className="flex gap-2 max-w-sm">
          <Input
            placeholder="e.g. capability"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            list="schema-id-suggestions"
            className="text-sm font-mono"
          />
          <datalist id="schema-id-suggestions">
            {KNOWN_SCHEMA_IDS.map((id) => (
              <option key={id} value={id} />
            ))}
          </datalist>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={!inputValue.trim()}
          >
            Load
          </Button>
        </form>
        <p className="text-[11px] text-muted font-mono mt-1.5">
          Known ID: {KNOWN_SCHEMA_IDS[0]}
        </p>
      </div>

      {/* Editor */}
      {loadedSchemaId ? (
        <div className="animate-fade-up">
          <SchemaEditor key={loadedSchemaId} schemaId={loadedSchemaId} />
        </div>
      ) : (
        <p className="text-xs text-muted font-mono">
          Enter a schema ID above and click Load to begin editing.
        </p>
      )}
    </div>
  );
}
