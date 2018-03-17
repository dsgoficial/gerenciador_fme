# -*- coding: utf-8 -*-
import sys
import json

args = sys.argv

sys.path.append(args[1])

import fmeobjects
# initiate FMEWorkspaceRunner Class
runner = fmeobjects.FMEWorkspaceRunner()

workspace = args[2]

params = runner.getPublishedParamNames(workspace)

fixedParams = []

for param in params:
    if param[:4] != 'priv':
        fixedParams.append({
            'nome': param,
            'valordefault': runner.getParamDefaultValue(workspace,param).decode('latin-1').encode("utf-8"),
            'descricao': runner.getParamLabel(workspace,param).decode('latin-1').encode("utf-8"),
            'opcional': runner.getParamOptional(workspace,param),
            'tipo': runner.getParamType(workspace,param),
            'valores': runner.getParamValues(workspace,param)
        })

print json.dumps(fixedParams)
