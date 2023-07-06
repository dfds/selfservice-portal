import { ListItem, ListText, ListIcon } from "@dfds-ui/react-components";
import { ArrowForward } from "@dfds-ui/icons/system";

function Link({title, url}) {
  const Anchor = props => {
    return <a target="_blank" href={url} {...props} />;
  };

  return <ListItem condensed divider as={Anchor} clickable>
    <ListText>{title}</ListText>
    <ListIcon icon={ArrowForward} />
  </ListItem>
}

export default function QuickLinks() {
  return <div>
    <Link title={"AWS Login"} url="https://dfds.awsapps.com/start" />
    <Link title={"Azure DevOps"} url="https://dev.azure.com/dfds" />
    <Link title={"GitHub"} url="https://github.com/dfds" />
    <Link title={"Snyk"} url="https://app.snyk.io/login/sso" />
    <Link title={"1Password"} url="https://dfds.1password.com/signin" />
    <Link title={"Mural"} url="https://app.mural.co/t/dfds9874/home" />
    <Link title={"React Frontend Components"} url="https://ui-components-three.vercel.app" />
  </div>
}
