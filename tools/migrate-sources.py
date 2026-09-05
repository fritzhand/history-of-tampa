#!/usr/bin/env python3
"""
migrate-sources.py — one-off schema migration for js/data.js.

Adds the plan's required citation fields to every flat `source: { ... }`
object that lacks them:
    verificationStatus: "PENDING"   (until an audit upgrades it)
    accessType:         "FREE"
Run from the repo root:  python3 tools/migrate-sources.py [--dry-run]
"""
import re, sys
DRY = '--dry-run' in sys.argv
p = 'js/data.js'
s = open(p, encoding='utf-8').read()
pat = re.compile(r'source:\s*\{(?P<body>[^{}]*)\}', re.S)
added = 0
def fix(m):
    global added
    body = m.group('body')
    if 'verificationStatus' in body:
        return m.group(0)
    added += 1
    stripped = body.rstrip()
    # preserve the indentation of the last line for the inserted fields
    last_line = body.rstrip('\n').split('\n')[-1]
    indent = re.match(r'\s*', last_line).group(0) if '\n' in body else ' '
    sep = ',' if not stripped.endswith(',') else ''
    if '\n' in body:
        return 'source: {' + stripped + sep + '\n' + indent + 'verificationStatus: "PENDING", accessType: "FREE" }'
    return 'source: {' + stripped + sep + ' verificationStatus: "PENDING", accessType: "FREE" }'
out = pat.sub(fix, s)
print(f'source objects migrated: {added}')
if not DRY and added:
    open(p, 'w', encoding='utf-8').write(out)
    print('written', p)
