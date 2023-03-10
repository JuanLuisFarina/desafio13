import { httpServer } from "./src/server.js";
import config from "./src/helpers/config.js";
import { runCluster, runFork } from "./src/helpers/functions.js";

switch(config.MODO){
    case 'fork':
        runFork(config.PORT, httpServer)
        break;
    case 'cluster':
        runCluster(config.PORT, httpServer)
        break;
    default:
        runFork(config.PORT, httpServer)
        break;
}