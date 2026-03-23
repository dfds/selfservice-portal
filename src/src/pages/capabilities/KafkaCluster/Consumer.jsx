import { Text } from "@/components/ui/Text";

export default function Consumer({ name }) {
  return (
    <div>
      <Text styledAs="label">{name}</Text>
    </div>
  );
}
