import { SymmetricalCommand } from "../GoStreamCommandBase"
import { GoStreamState } from "../../state"
import { TransitionStyle } from "../../enums"

export class TransitionStyleCommand extends SymmetricalCommand<{ style: TransitionStyle }> {
    public static readonly rawName = 'transitionIndex'

    constructor(style?: TransitionStyle) {
        super({ style })
    }

    public static deserialize(value: (string | number)[]): TransitionStyleCommand {
        return new TransitionStyleCommand(value[0] as number)
    }

    public serialize(): (number | string) [] {
        return [this.properties.style]
    }

    public applyToState(state: GoStreamState): string | string[] {
        state.mixeffect.transitionStyle = this.properties.style
        return `mixeffect.transitionStyle`
    }
}