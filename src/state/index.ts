import * as Info from './info'
import * as MixEffect from './mixeffect'
import * as GoStreamStateUtil from './util'

export {
	Info,
    GoStreamStateUtil,
}

export interface GoStreamState {
	info: Info.DeviceInfo,
    mixeffect: MixEffect.MixEffect
}

export class InvalidIdError extends Error {
	constructor(message: string, ...ids: Array<number | string>) {
		super(InvalidIdError.BuildErrorString(message, ids))
		Object.setPrototypeOf(this, new.target.prototype)
	}

	private static BuildErrorString(message: string, ids: Array<number | string>): string {
		if (ids && ids.length > 0) {
			return `${message} ${ids.join('-')} is not valid`
		} else {
			return message
		}
	}
}