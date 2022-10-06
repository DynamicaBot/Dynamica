export default class Help {
  short: string;

  long?: string;

  constructor(short: string, long?: string) {
    this.short = short;
    if (long) {
      this.long = long;
    }
  }
}
