import { GoStreamCommand } from "../GoStreamCommandBase"
import { ProtocolVersion } from "../../enums"
import { GoStreamState } from "../../state"

export class VersionCommand extends GoStreamCommand<{ version: ProtocolVersion }> {
    public static readonly rawName = 'version'

	constructor(version?: ProtocolVersion) {
		super({ version })
	}

	public static deserialize(value: (string | number)[]): VersionCommand {
		return new VersionCommand(value[0] as ProtocolVersion)
	}

    public serialize(): (string | number)[] {
        // No values needed for Version
        return null 
    }

    public applyToState(state: GoStreamState): string | string[] {
        state.info.apiVersion = this.properties.version
        return `info.apiVersion`
    }
}