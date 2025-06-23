import { ProtocolVersion, TransitionStyle } from '../enums'
import { GoStreamState } from '.'


export function Create(): GoStreamState {
	return {
		info: {
			apiVersion: ProtocolVersion.V1,
		},
		mixeffect: {
			pgmIndex: 0,
			pvwIndex: 0,
			transitionStyle: TransitionStyle.MIX,
			transitionPreview: false,
		}
	}
}