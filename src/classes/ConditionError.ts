export default class ConditionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConditionError';
  }
}
