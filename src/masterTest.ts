import { GoStreamStateUtil } from "./state";
import { GoStream } from "./gostream"

let device = new GoStream()

let wrappedState = {
    state: GoStreamStateUtil.Create()
}
device.on('connected', () => {
    console.log("Connected");
})

device.on('receivedCommands', (cmds) => {
})

device.on('stateChanged', (newState, allChangedPaths) => {
    console.log("State changed")
    wrappedState.state = newState
    allChangedPaths.forEach((path) => {
		const versionMatch = path.match(/info.apiVersion/)
        if(versionMatch)
            console.log("\t" + path + ": " + wrappedState.state.info.apiVersion)
    })
})

device.connect('192.168.255.130', 19010)

device.version()
device.cut()
