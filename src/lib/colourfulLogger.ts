import chalk from "chalk";

export const error = (args: any) => console.error(chalk.red("ERROR"), args);
export const warn = (args: any) => console.warn(chalk.yellow("WARN"), args);
export const log = (args: any) => console.log(args);
export const info = (args: any) => console.info(chalk.blue("INFO"), args);
export const debug = (args: any) => console.debug(chalk.white("DEBUG"), args);
