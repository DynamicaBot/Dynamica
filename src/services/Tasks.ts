import { Service } from 'typedi';
import cron from 'node-cron';
import Logger from './Logger';

@Service()
export default class Tasks {
  private tasks: Array<cron.ScheduledTask> = [];

  constructor(private readonly logger: Logger) {}

  public stop() {
    this.logger.info('Stopping tasks...');
    this.tasks.forEach((task) => task.stop());
    this.logger.info('Tasks stopped.');
  }

  public addTask(task: cron.ScheduledTask) {
    this.tasks.push(task);
  }
}
