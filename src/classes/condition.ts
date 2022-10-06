import { CacheType, ChatInputCommandInteraction } from 'discord.js';

type CheckResult = { success: boolean; message?: string };

type ConditionFunction = (
  interaction: ChatInputCommandInteraction<CacheType>
) => Promise<CheckResult>;

export default class Condition {
  private condition: ConditionFunction;

  constructor(condition: ConditionFunction) {
    this.condition = condition;
  }

  async check(
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<CheckResult> {
    return this.condition(interaction);
  }
}
