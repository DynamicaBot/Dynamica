import { CommandInteraction } from 'discord.js';

type CheckResult = { success: boolean; message?: string };

type ConditionFunction = (
  interaction: CommandInteraction
) => Promise<CheckResult>;

export default class Condition {
  private condition: ConditionFunction;

  constructor(condition: ConditionFunction) {
    this.condition = condition;
  }

  async check(interaction: CommandInteraction): Promise<CheckResult> {
    return this.condition(interaction);
  }
}
