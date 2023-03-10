import { httpServer } from "../server.js";

process.on('message', message => {
    if(message.action === 'start'){
        const connectedServer = httpServer.listen(message.port, () => {
            console.log(`Server connected on port: ${connectedServer.address().port} using fork`)
        })
        connectedServer.on('error', error => {
            console.log(`Server error : ${error}`)
        })
    }
})