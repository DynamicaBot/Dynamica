import signale from 'signale';

const logger = new signale.Signale({
  disabled: false,
  interactive: false,
});

export default logger;
