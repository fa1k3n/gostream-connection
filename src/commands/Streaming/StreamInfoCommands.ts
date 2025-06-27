import { LiveStatus } from "../../enums";
import { GoStreamState } from "../../state";
import { GoStreamCommand } from "../GoStreamCommandBase";
import { DeserializationError } from "../../error";

export class StreamOutputCommand extends GoStreamCommand<{ enable: boolean }> {
  public static readonly rawName = "streamOutput";

  public readonly streamIndex: number;

  constructor(streamIndex: number, enable?: boolean) {
    super({ enable });
    this.streamIndex = streamIndex;
  }

  public static deserialize(value: (string | number)[]): StreamOutputCommand {
    const streamIndex: number = value[0] as number;
    if (streamIndex < 0 || streamIndex > 3)
      throw new DeserializationError(
        "streamOutput received with value out of range: " + value[0],
      );
    return new StreamOutputCommand(streamIndex, value[1] === 1);
  }

  public serialize(): (number | string)[] {
    if (this.properties.enable !== undefined)
      return [this.streamIndex, this.properties.enable ? 1 : 0];
    return [this.streamIndex];
  }

  public applyToState(state: GoStreamState): string | string[] {
    state.streaming.streamInfo[this.streamIndex].enable =
      this.properties.enable;
    return `streaming.streamInfo.` + this.streamIndex + ".enable";
  }
}

export class StreamPlatformCommand extends GoStreamCommand<{
  platform: string;
}> {
  public static readonly rawName = "streamPlatform";

  public readonly streamIndex: number;

  constructor(streamIndex: number, platform?: string) {
    super({ platform });
    this.streamIndex = streamIndex;
  }

  public static deserialize(value: (string | number)[]): StreamPlatformCommand {
    return new StreamPlatformCommand(value[0] as number, value[1] as string);
  }

  public serialize(): (number | string)[] {
    return [this.streamIndex, this.properties.platform];
  }

  public applyToState(state: GoStreamState): string | string[] {
    state.streaming.streamInfo[this.streamIndex].platform =
      this.properties.platform;
    return `streaming.streamInfo.` + this.streamIndex + ".platform";
  }
}

export class LiveInfoCommand extends GoStreamCommand<{ status: LiveStatus }> {
  public static readonly rawName = "liveInfo";

  public readonly streamIndex: number;

  constructor(streamIndex: number, status?: LiveStatus) {
    super({ status });
    this.streamIndex = streamIndex;
  }

  public static deserialize(value: (string | number)[]): LiveInfoCommand {
    return new LiveInfoCommand(value[0] as number, value[1] as LiveStatus);
  }

  public serialize(): (number | string)[] {
    return [this.streamIndex, this.properties.status];
  }

  public applyToState(state: GoStreamState): string | string[] {
    state.streaming.streamInfo[this.streamIndex].status =
      this.properties.status;
    return `streaming.streamInfo.` + this.streamIndex + ".status";
  }
}
