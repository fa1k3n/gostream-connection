import { BasicSetCommand } from "../GoStreamCommandBase"

export class CutCommand extends BasicSetCommand<null> {
	public static readonly rawName = 'cutTransition'

	constructor() {
		super(null)
	}

	public serialize(): (string | number)[] {
        return [] 
	}
}