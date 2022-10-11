import Logger from '@/services/Logger';
import mqtt from 'mqtt';
import { Service } from 'typedi';

@Service()
export default class MQTT {
  private client: mqtt.MqttClient | undefined = undefined;

  private constructor(private logger: Logger) {
    if (process.env.MQTT_URL) {
      this.client = mqtt.connect(process.env.MQTT_URL, {
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASS,
      });
      this.client.on('connect', () => {
        this.logger.scope('MQTT').info('Connected');
      });
      this.client.on('error', (error) => {
        this.logger.scope('MQTT').error('Error', error);
      });
    }
  }

  public publish(topic: string, message: string | Buffer) {
    return new Promise<void>((res, rej) => {
      if (this.client) {
        this.client.publish(topic, message, { retain: true }, (err) => {
          if (err) {
            rej(err);
          } else {
            res();
          }
        });
      } else {
        res();
      }
    });
  }

  public subscribe(topic: string) {
    return new Promise<void>((res, rej) => {
      if (this.client) {
        this.client.subscribe(topic, (err) => {
          if (err) {
            rej(err);
          } else {
            res();
          }
        });
      } else {
        res();
      }
    });
  }

  public unsubscribe(topic: string) {
    return new Promise<void>((res, rej) => {
      if (this.client) {
        this.client.unsubscribe(topic, (err) => {
          if (err) {
            rej(err);
          } else {
            res();
          }
        });
      } else {
        res();
      }
    });
  }

  public onMessage(callback: (topic: string, message: string) => void) {
    if (this.client) {
      this.client.on('message', (topic, message) => {
        callback(topic, JSON.parse(message.toString()));
      });
    }
  }
}
