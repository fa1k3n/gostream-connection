import { GoStreamState } from "../../state";
import { GoStreamCommand } from "../GoStreamCommandBase";

export class PgmIndexCommand extends GoStreamCommand<{ pgmIndex: number }> {
  public static readonly rawName = "pgmIndex";

  constructor(pgmIndex?: number) {
    super({ pgmIndex });
  }

  public static deserialize(value: (string | number)[]): PgmIndexCommand {
    return new PgmIndexCommand(value[0] as number);
  }

  public serialize(): (number | string)[] {
    return [this.properties.pgmIndex];
  }

  public applyToState(state: GoStreamState): string | string[] {
    state.mixeffect.pgmIndex = this.properties.pgmIndex;
    return `mixeffect.pgmIndex`;
  }
}
