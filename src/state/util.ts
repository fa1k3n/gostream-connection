import { LiveStatus, ProtocolVersion, TransitionStyle } from '../enums'
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
		},
		streaming: {
			streamInfo: [
				{ enable: false, status: LiveStatus.Off, platform: '' }, 
				{ enable: false, status: LiveStatus.Off, platform: ''}, 
				{ enable: false, status: LiveStatus.Off, platform: ''},
			]
		}
	}
}