import { GoStreamState } from "../../state"
import { SymmetricalCommand } from "../GoStreamCommandBase"

export class PvwIndexCommand extends SymmetricalCommand<{pvwIndex: number}> {
    public static readonly rawName = 'pvwIndex'

    constructor(pvwIndex?: number) {
        super({pvwIndex})
    }

    public static deserialize(value: (string | number)[]): PvwIndexCommand {
        return new PvwIndexCommand(value[0] as number)
    }

    public serialize(): (number | string) [] {
        return [this.properties.pvwIndex]
    }

    public applyToState(state: GoStreamState): string | string[] {
        state.mixeffect.pvwIndex = this.properties.pvwIndex
        return `mixeffect.pvwIndex`
    }
}