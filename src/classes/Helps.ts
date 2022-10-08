import type Help from './Help';

export default class Helps {
  public static helps: Record<string, Help> = {};

  public static register(help: Help): void {
    Helps.helps[help.name] = help;
  }

  public static get(name: string): Help | undefined {
    return Helps.helps[name];
  }

  public static get count(): number {
    return Object.keys(Helps.helps).length;
  }

  public static get all(): Help[] {
    return Object.values(Helps.helps);
  }

  public static get names(): string[] {
    return Object.keys(Helps.helps);
  }
}
