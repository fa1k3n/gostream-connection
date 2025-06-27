import * as Info from "./info";
import * as MixEffect from "./mixeffect";
import * as GoStreamStateUtil from "./util";
import * as Streaming from "./streaming";

export { Info, Streaming, GoStreamStateUtil };

export interface GoStreamState {
  info: Info.DeviceInfo;
  mixeffect: MixEffect.MixEffect;
  streaming: Streaming.Streaming;
}

export class InvalidIdError extends Error {
  constructor(message: string, ...ids: (number | string)[]) {
    super(InvalidIdError.BuildErrorString(message, ids));
    Object.setPrototypeOf(this, new.target.prototype);
  }

  private static BuildErrorString(
    message: string,
    ids: (number | string)[],
  ): string {
    if (ids && ids.length > 0) {
      return `${message} ${ids.join("-")} is not valid`;
    } else {
      return message;
    }
  }
}
