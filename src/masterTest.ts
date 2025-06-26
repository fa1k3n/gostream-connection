import { GoStreamStateUtil } from "./state";
import { GoStream } from "./gostream"
const device = new GoStream()

const wrappedState = {
    state: GoStreamStateUtil.Create()
}
device.on('connected', () => {
    console.log("Connected");
})

device.on('receivedCommands', () => {
})

device.on('stateChanged', (newState, allChangedPaths) => {
    console.log("State changed")
    wrappedState.state = newState
    allChangedPaths.forEach((path) => {
        console.log("\t" + path)
    })
    console.log("\n" + JSON.stringify(wrappedState.state, null, 2))
})

device.connect('192.168.255.130', 19010)

//device.init()

device.streamInfo(0, { enable: false, platform: "Facebook" })

//device.version()
//device.cut()

//device.setTransitionStyle(TransitionStyle.MIX)
//device.previewTransition(true)
