import { Service } from 'typedi';
import type Help from './Help';

@Service()
export default class Helps {
  public helps: Record<string, Help> = {};

  public register(help: Help): void {
    this.helps[help.name] = help;
  }

  public get(name: string): Help | undefined {
    return this.helps[name];
  }

  public get count(): number {
    return Object.keys(this.helps).length;
  }

  public get all(): Help[] {
    return Object.values(this.helps);
  }

  public get names(): string[] {
    return Object.keys(this.helps);
  }
}
