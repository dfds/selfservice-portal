import awsLogo from "./aws-logo.svg";

export function InlineAwsCountSummary({ data }) {
    return (
      <>
        <span data-tip="Hover me!" data-for="aws-count-summary">
          <img src={awsLogo} alt="AWS icon" style={{ height: "1rem" }} />
          <span> {data}</span>
        </span>
      </>
    );
  }
  