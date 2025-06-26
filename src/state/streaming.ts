import { LiveStatus } from "../enums"

export type StreamInfo = {
    enable: boolean
    status: LiveStatus
    platform: string
}

export interface Streaming {
    streamInfo: StreamInfo[]
}