// **************** Kafka Config ****************

import { Kafka } from 'kafkajs';

// -> Init
const kafka = new Kafka({
    clientId: 'newmind-ecommerce-project',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'ecommerce-group' });

export const connectKafka = async () => {
  await producer.connect();
  await consumer.connect();
};
