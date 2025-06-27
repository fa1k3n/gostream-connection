import { LiveStatus } from "../enums";

export interface StreamInfo {
  enable: boolean;
  status: LiveStatus;
  platform: string;
}

export interface Streaming {
  streamInfo: StreamInfo[];
}
