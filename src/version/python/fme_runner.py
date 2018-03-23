# -*- coding: utf-8 -*-
import sys
import json
import time

args = sys.argv

sys.path.append(args[1])

import fmeobjects
# initiate FMEWorkspaceRunner Class
runner = fmeobjects.FMEWorkspaceRunner()

workspace = args[2]

values = json.loads(args[3])

parameters = {}

params = runner.getPublishedParamNames(workspace)

log_name = workspace.replace('.fmw','').replace('fme_workspaces','fme_logs')+'_'+str(time.time()).replace('.','')+'.log'

try:
    for param in params:
        if param[:4] != 'priv':
            parameters[param] = values[param]

    parameters['priv_LOG_FILE'] = log_name

    runner.runWithParameters(workspace, parameters)

except fmeobjects.FMEException as ex:
    print ex.message
else:
    #Retorna o nome do log quando concluido.
    print log_name
# get rid of FMEWorkspace runner so we don't leave an FME process running
running = None
