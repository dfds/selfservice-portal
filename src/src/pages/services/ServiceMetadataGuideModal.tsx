import React, { useState } from "react";
import { BookOpen, Boxes, Check, Copy, Network } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Banner, BannerParagraph } from "@/components/ui/banner";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Code } from "@/components/ui/Code";
import { TabGroup } from "@/components/ui/TabGroup";

const WORKLOAD_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: billing-api
  annotations:
    # Free-form description — shown on the workload's detail view
    dfds.cloud/description: |
      REST API for billing operations: invoicing,
      payment processing and reconciliation.

    # Reference links — repeat with any <label> you like
    dfds.cloud/link.runbook: "https://wiki.dfds.cloud/runbooks/billing-api"
    dfds.cloud/link.dashboard: "https://grafana.dfds.cloud/d/billing-api"
    dfds.cloud/link.docs: "https://wiki.dfds.cloud/billing-api"

    # Repository (fallback when no GitOps source is detected)
    dfds.cloud/repo: "https://github.com/dfds/billing-service"

    # API-doc probing hints (optional)
    dfds.cloud/openapi-path: "/api/v2/spec"   # probe an extra path
    # dfds.cloud/openapi-probe: "false"       # or opt out entirely
`;

const INGRESS_YAML = `apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: billing-api
  annotations:
    # Probe a specific path instead of the route's mount prefix
    dfds.cloud/reachability-path: "/healthz"

    # Override the HTTP method (default GET)
    dfds.cloud/reachability-method: "GET"

    # Which status codes count as "reachable" (default 200).
    # Single codes, ranges and Nxx classes, comma-separated.
    dfds.cloud/reachability-expect: "200,301-302"

    # Or opt the exposed host out of probing entirely
    # dfds.cloud/reachability-probe: "false"
spec:
  entryPoints: [websecure]
  routes:
    - match: Host(\`billing.dfds.cloud\`)
      kind: Rule
      services:
        - name: billing-api
          port: 80
`;

function CodeBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => {
        /* clipboard unavailable — no-op */
      },
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onCopy}
        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-[4px] border border-divider bg-surface px-2 py-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors"
        aria-label="Copy example"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto rounded-[6px] border border-divider bg-surface-muted p-3 font-mono text-[0.75rem] leading-[1.55] text-primary">
        {text}
      </pre>
    </div>
  );
}

type ResourceTab = "workload" | "ingress";

const TABS: { id: ResourceTab; label: string; icon: React.ReactNode }[] = [
  { id: "workload", label: "Workload", icon: <Boxes size={14} /> },
  { id: "ingress", label: "Ingress", icon: <Network size={14} /> },
];

function WorkloadTab() {
  return (
    <>
      <Banner variant="info" className="mt-2">
        <BannerParagraph>
          These go on the workload itself (the <Code>Deployment</Code> /{" "}
          <Code>StatefulSet</Code>) under <Code>metadata.annotations</Code>. All
          keys use the <Code>dfds.cloud/</Code> prefix. Every field is optional.
        </BannerParagraph>
      </Banner>

      <div className="mt-4">
        <SectionLabel className="mb-1.5 block">What you can add</SectionLabel>
        <Accordion type="multiple" defaultValue={["description"]}>
          <AccordionItem value="description">
            <AccordionTrigger>Description</AccordionTrigger>
            <AccordionContent>
              <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-2">
                A short, human description of what the workload does. Shown on
                the workload's detail panel and its full details page.
              </p>
              <CodeBlock
                text={`dfds.cloud/description: "Handles billing and invoicing"`}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="links">
            <AccordionTrigger>Reference links</AccordionTrigger>
            <AccordionContent>
              <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-2">
                Point people at runbooks, dashboards, docs — anything useful.
                Add one annotation per link; the text after <Code>link.</Code>{" "}
                becomes the label. Links are shown sorted by label.
              </p>
              <CodeBlock
                text={`dfds.cloud/link.runbook: "https://wiki.dfds.cloud/runbooks/my-app"
dfds.cloud/link.dashboard: "https://grafana.dfds.cloud/d/my-app"`}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="repo">
            <AccordionTrigger>Repository</AccordionTrigger>
            <AccordionContent>
              <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-2">
                Link the source repo. The catalogue already auto-detects the
                repo from GitOps sources (Argo CD / Flux) where it can — this is
                a fallback/complement for workloads it can't attribute. Also
                accepts <Code>git-origin</Code>. Surfaces as the{" "}
                <strong>Repo</strong> link.
              </p>
              <CodeBlock
                text={`dfds.cloud/repo: "https://github.com/dfds/my-service"`}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="apidocs">
            <AccordionTrigger>API docs (OpenAPI / Swagger)</AccordionTrigger>
            <AccordionContent>
              <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-2">
                The catalogue probes common paths automatically (
                <Code>/swagger</Code>, <Code>/openapi.json</Code>,{" "}
                <Code>/v3/api-docs</Code>, …) and shows hits in the{" "}
                <strong>Docs</strong> column. Add an extra path, or opt out
                entirely:
              </p>
              <CodeBlock
                text={`dfds.cloud/openapi-path: "/api/v2/spec"   # probe an extra path
dfds.cloud/openapi-probe: "false"         # skip probing this workload`}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-5">
        <SectionLabel className="mb-1.5 block">Full example</SectionLabel>
        <CodeBlock text={WORKLOAD_YAML} />
      </div>
    </>
  );
}

function IngressTab() {
  return (
    <>
      <Banner variant="info" className="mt-2">
        <BannerParagraph>
          These go on the <Code>Ingress</Code> or Traefik{" "}
          <Code>IngressRoute</Code> that exposes your service, under{" "}
          <Code>metadata.annotations</Code>. When several routes expose the same
          host, the catalogue reads them from the route with the shortest path
          prefix (the base mount).
        </BannerParagraph>
      </Banner>

      <div className="mt-4">
        <SectionLabel className="mb-1.5 block">
          Reachability checks
        </SectionLabel>
        <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-3">
          The catalogue actively probes the external hosts your service is
          exposed at and shows a verdict in the <strong>Reachable</strong>{" "}
          column (reachable / unreachable / unknown). By default it issues a{" "}
          <Code>GET</Code> to the route's mount path and expects a{" "}
          <Code>200</Code>. Tune that per exposed host with these annotations:
        </p>
        <Accordion type="multiple" defaultValue={["expect"]}>
          <AccordionItem value="path">
            <AccordionTrigger>Probe path</AccordionTrigger>
            <AccordionContent>
              <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-2">
                Probe a specific path instead of the route's mount prefix — for
                example a dedicated health endpoint.
              </p>
              <CodeBlock text={`dfds.cloud/reachability-path: "/healthz"`} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="method">
            <AccordionTrigger>HTTP method</AccordionTrigger>
            <AccordionContent>
              <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-2">
                Override the request method. Defaults to <Code>GET</Code>; use{" "}
                <Code>HEAD</Code> for endpoints that don't answer GET.
              </p>
              <CodeBlock text={`dfds.cloud/reachability-method: "HEAD"`} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="expect">
            <AccordionTrigger>Expected status</AccordionTrigger>
            <AccordionContent>
              <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-2">
                Which HTTP status codes count as reachable (default{" "}
                <Code>200</Code>). Accepts single codes, inclusive ranges and{" "}
                <Code>Nxx</Code> class shorthands, comma-separated — e.g. an
                endpoint that redirects or requires auth:
              </p>
              <CodeBlock
                text={`dfds.cloud/reachability-expect: "2xx,301-302"
dfds.cloud/reachability-expect: "200,401"`}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="optout">
            <AccordionTrigger>Opt out</AccordionTrigger>
            <AccordionContent>
              <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-2">
                Skip reachability probing for the exposed host entirely — no
                verdict is recorded and the <strong>Reachable</strong> column
                stays empty.
              </p>
              <CodeBlock text={`dfds.cloud/reachability-probe: "false"`} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-5">
        <SectionLabel className="mb-1.5 block">Full example</SectionLabel>
        <CodeBlock text={INGRESS_YAML} />
      </div>
    </>
  );
}

export function ServiceMetadataGuideModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<ResourceTab>("workload");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(48rem,calc(0.95*var(--ssu-vw)))] max-h-[calc(0.85*var(--ssu-vh))] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono uppercase text-sm tracking-[0.08em]">
            <BookOpen size={16} />
            Enrich your services
          </DialogTitle>
          <DialogDescription>
            Add extra context to your workloads with a few Kubernetes
            annotations. The catalogue reads them from available Kubernetes
            clusters on its next scan and surfaces them here on the Services
            page. Annotations live on different resources depending on what you
            want to add — pick a tab below.
          </DialogDescription>
        </DialogHeader>

        <TabGroup
          tabs={TABS}
          value={tab}
          onChange={setTab}
          variant="underline"
          className="mt-2"
        />

        {tab === "workload" ? <WorkloadTab /> : <IngressTab />}

        <Banner variant="warning" className="mt-4">
          <BannerParagraph>
            Changes appear after the next catalogue scan, not instantly — check
            the "last updated" time at the top of the Services page.
          </BannerParagraph>
        </Banner>
      </DialogContent>
    </Dialog>
  );
}
