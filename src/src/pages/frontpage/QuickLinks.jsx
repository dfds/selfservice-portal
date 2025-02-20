import { ListItem, ListText, ListIcon } from "@dfds-ui/react-components";
import { ArrowForward } from "@dfds-ui/icons/system";
import { TrackedLink } from "@/components/Tracking";

function Link({ title, url }) {
  const Anchor = (props) => {
    // eslint-disable-next-line jsx-a11y/anchor-has-content, react/jsx-no-target-blank
    return <TrackedLink trackName={`QuickLink-${title}`} target="_blank" href={url} {...props} />; // Looks like a link attribute is being mis-used, needs to be investigated further
  };

  return (
    <ListItem condensed divider as={Anchor} clickable>
      <ListText>{title}</ListText>
      <ListIcon icon={ArrowForward} />
    </ListItem>
  );
}

const swaggerUrl = process.env.REACT_APP_API_BASE_URL + "/swagger";
const chatUrl = process.env.REACT_APP_AI_CHAT_URL;

export default function QuickLinks() {
  return (
    <div>
      <Link title={"AWS Login"} url="https://dfds.awsapps.com/start" />
      <Link title={"Azure DevOps"} url="https://dev.azure.com/dfds" />
      <Link title={"Finout"} url="https://app.finout.io/" />
      <Link title={"GitHub"} url="https://github.com/dfds" />
      <Link title={"Snyk"} url="https://app.snyk.io/login/sso" />
      <Link title={"1Password"} url="https://dfds.1password.com/signin" />
      <Link title={"Mural"} url="https://app.mural.co/t/dfds9874/home" />
      <Link
        title={"React Frontend Components"}
        url="https://ui-components-three.vercel.app"
      />
      <Link title={"Swagger API Documentation"} url={swaggerUrl} />
      <Link title={"Chat Bot assistance"} url={chatUrl} />
      {/*<Link
        title={"AI Deployment in Azure"}
        url="https://wiki.dfds.cloud/en/playbooks/ai-deployment-azure/getting-started"
      />*/}
    </div>
  );
}
