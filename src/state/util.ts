import { ProtocolVersion } from '../enums'
import { GoStreamState } from '.'


export function Create(): GoStreamState {
	return {
		info: {
			apiVersion: ProtocolVersion.V1,
		},
	}
}