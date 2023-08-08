import { Text } from "@dfds-ui/typography";

export default function Consumer({ name }) {
  return (
    <div>
      <Text styledAs="label">{name}</Text>
    </div>
  );
}
