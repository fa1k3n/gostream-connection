import { GoStreamState } from "../../../state";
import { GoStreamCommand } from "../../GoStreamCommandBase";

export interface PreviewProps {
  preview: boolean;
}

export class PreviewTransitionCommand extends GoStreamCommand<PreviewProps> {
  public static readonly rawName = "prev";

  constructor(preview: boolean) {
    super({ preview });
  }

  public static deserialize(
    value: (string | number)[],
  ): PreviewTransitionCommand {
    return new PreviewTransitionCommand(value[0] === 1);
  }

  public serialize(): (string | number)[] {
    return [this.properties.preview ? 1 : 0];
  }

  public applyToState(state: GoStreamState): string | string[] {
    state.mixeffect.transitionPreview = this.properties.preview;
    return `mixeffect.transitionPreview`;
  }
}
