import Logger from '@/utils/logger';
import mqtt from 'mqtt';
import { Service } from 'typedi';

@Service()
export default class MQTT {
  private client: mqtt.MqttClient;

  constructor(private logger: Logger) {
    this.client = mqtt.connect(process.env.MQTT_URL, {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASS,
    });
    this.client.on('connect', () => {
      this.logger.success('MQTT Connected');
    });
  }

  public publish(topic: string, message: string | Buffer) {
    return new Promise<void>((res, rej) => {
      this.client.publish(topic, message, { retain: true }, (err) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      });
    });
  }

  public subscribe(topic: string) {
    return new Promise<void>((res, rej) => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      });
    });
  }

  public unsubscribe(topic: string) {
    return new Promise<void>((res, rej) => {
      this.client.unsubscribe(topic, (err) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      });
    });
  }

  public onMessage(callback: (topic: string, message: string) => void) {
    this.client.on('message', (topic, message) => {
      callback(topic, JSON.parse(message.toString()));
    });
  }
}
