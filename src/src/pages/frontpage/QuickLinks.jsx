import { TrackedLink } from "@/components/Tracking";

function Link({ title, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between py-2 border-b border-[#eeeeee] dark:border-[#1e2d3d] no-underline first:pt-0 last:border-0 last:pb-0"
    >
      <span className="text-[13px] text-[#666666] dark:text-[#94a3b8] group-hover:text-[#0e7cc1] dark:group-hover:text-[#60a5fa] transition-colors">
        {title}
      </span>
      <span className="font-mono text-[11px] text-[#afafaf] dark:text-[#64748b] transition-transform duration-150 ease-out-expo group-hover:translate-x-[2px] group-hover:-translate-y-[2px]">
        ↗
      </span>
    </a>
  );
}

const swaggerUrl = process.env.REACT_APP_API_BASE_URL + "/swagger";

export default function QuickLinks() {
  return (
    <div>
      <Link title="AWS Login" url="https://dfds.awsapps.com/start" />
      <Link title="Azure DevOps" url="https://dev.azure.com/dfds" />
      <Link title="Finout" url="https://app.finout.io/" />
      <Link title="Grafana read stack" url="https://view.grafana.dfds.cloud/" />
      <Link title="GitHub" url="https://github.com/dfds" />
      <Link title="Snyk" url="https://app.snyk.io/login/sso" />
      <Link title="1Password" url="https://dfds.1password.com/signin" />
      <Link title="Self Service API Documentation" url={swaggerUrl} />
    </div>
  );
}
