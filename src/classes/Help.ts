import { Token } from 'typedi';

export default interface Help {
  name: string;

  short: string;

  long?: string;
}

export const HelpToken = new Token<Help>('help');
