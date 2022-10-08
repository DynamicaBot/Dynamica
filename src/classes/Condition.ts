import { CacheType, ChatInputCommandInteraction } from 'discord.js';

type ConditionFunction = (
  interaction: ChatInputCommandInteraction<CacheType>
) => Promise<void>;

export default class Condition {
  private condition: ConditionFunction;

  constructor(condition: ConditionFunction) {
    this.condition = condition;
  }

  async check(
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    await this.condition(interaction);
  }
}
