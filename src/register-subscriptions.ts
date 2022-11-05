import { Container } from 'typedi';
import deployCommands from './scripts/deploy';
import removeCommands from './scripts/remove';
import MQTT from './services/MQTT';

export default function registerSubscriptions() {
  const mqtt = Container.get(MQTT);

  mqtt.subscribe('dynamica/commands/reload', async () => {
    await removeCommands();
    await deployCommands();
  });

  mqtt.subscribe('dynamica/commands/remove', async () => {
    await removeCommands();
  });

  mqtt.subscribe('dynamica/commands/deploy', async () => {
    await deployCommands();
  });
}
