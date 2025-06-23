import { BasicWritableCommand } from "../GoStreamCommandBase"

export class CutCommand extends BasicWritableCommand<null> {
	public static readonly rawName = 'cutTransition'

	constructor() {
		super(null)
	}

	public serialize(): (string | number)[] {
		// No values needed for Cut
        return null 
	}
}