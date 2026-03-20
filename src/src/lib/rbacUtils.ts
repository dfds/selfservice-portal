export function groupPermsByNamespace(
  items: any[],
  nameField: string,
): Record<string, string[]> {
  return items.reduce<Record<string, string[]>>((acc, item) => {
    const ns = item.namespace ?? "Other";
    const name = item[nameField] ?? "";
    if (!acc[ns]) acc[ns] = [];
    acc[ns].push(name);
    return acc;
  }, {});
}
