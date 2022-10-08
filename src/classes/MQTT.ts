import signaleLogger from '@/utils/logger';
import mqtt from 'mqtt';

export class MQTT {
  private static instance: MQTT | undefined = undefined;
  private client: mqtt.MqttClient;
  private static logger = signaleLogger.scope('MQTT');
  private logger = signaleLogger.scope('MQTT');
  private constructor() {
    this.client = mqtt.connect(process.env.MQTT_URL, {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASS,
    });
    this.client.on('connect', () => {
      this.logger.info('Connected');
    });
    this.client.on('error', (error) => {
      this.logger.error('Error', error);
    });
  }

  public static getInstance(): MQTT | undefined {
    if (!MQTT.instance && process.env.MQTT_URL) {
      MQTT.instance = new MQTT();
    }
    return MQTT.instance;
  }

  public publish(topic: string, message: any) {
    return new Promise<void>((res, rej) =>
      this.client.publish(topic, JSON.stringify(message), (err) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      })
    );
  }

  public subscribe(topic: string) {
    return new Promise<void>((res, rej) =>
      this.client.subscribe(topic, (err) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      })
    );
  }

  public unsubscribe(topic: string) {
    return new Promise<void>((res, rej) =>
      this.client.unsubscribe(topic, (err) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      })
    );
  }

  public onMessage(callback: (topic: string, message: string) => void) {
    this.client.on('message', (topic, message) => {
      callback(topic, JSON.parse(message.toString()));
    });
  }
}
