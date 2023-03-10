import bCrypt from 'bcrypt';
import {fork} from 'child_process'
import cluster from 'cluster';
import { cpus } from 'os';

export function createHash(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10))
}

export function isValidPassword(user, password){
    return bCrypt.compareSync(password, user.password)
}
// Run App on Cluster
export function runCluster(port, app){
    console.log(`PID Master ${process.pid}`)
    if (cluster.isPrimary) {
        for(let i = 0; i < cpus().length; i++){
            cluster.fork()
        }
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`)
            cluster.fork()
        })
    } else {
        const connectedServer = app.listen(port, () => {
            console.log(`Server on port ${port} - PID ${process.pid} - ${new Date().toLocaleString()}`)
        })
        console.log(`Worker ${process.pid} started`);
        connectedServer.on('error', error => {`Server error : ${error}`})
    }
}
// Run app on Fork
export function runFork(port, app){
    const forked = fork('./src/helpers/serverFork.js')
    const message = {action : 'start', port: port}
    forked.send(message)
}