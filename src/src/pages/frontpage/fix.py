import re

path = '/home/frisch/dfds/selfservice-setup/src/selfservice-portal/src/src/pages/frontpage/MyCapabilities.jsx'
content = open(path).read()

# 1. avgCostText: return "No data" instead of null
content = content.replace(
    'if (!costs || costs.length === 0) return null;',
    'if (!costs || costs.length === 0) return "No data";'
)

# 2. Replace conditional {cost && ...} block and reorder: cost centre first, then cost always shown
old = (
    '        {/* Cost */}\n'
    '        {cost && (\n'
    '          <span className="font-mono text-[10px] text-muted">{cost}</span>\n'
    '        )}\n'
    '\n'
    '        {/* Cost centre */}\n'
    '        {costCentre && (\n'
    '          <span className="font-mono text-[10px] text-muted">{costCentre}</span>\n'
    '        )}'
)

new = (
    '        {/* Cost centre */}\n'
    '        {costCentre && (\n'
    '          <span className="font-mono text-[10px] text-muted">{costCentre}</span>\n'
    '        )}\n'
    '\n'
    '        {/* Cost - always shown, "No data" when unavailable */}\n'
    '        <span className="font-mono text-[10px] text-muted ml-auto">{cost}</span>'
)

if old in content:
    content = content.replace(old, new)
    print("Cost block replaced")
else:
    print("WARNING: cost block not found, no replacement made")

open(path, 'w').write(content)
print("done")
