// **************** This is my container for my dependency injections with 'inversify' ****************

import "reflect-metadata";
import { Container } from "inversify";
import { IPaymentService } from "../services/IPaymentService";
import { PaymentService } from "../services/PaymentService";
import { PaymentController } from "../controllers/PaymentController";
import { IPaymentRepository } from "../repositories/IPaymentRepository";
import { PaymentRepository } from "../repositories/PaymentRepository";
import { PaymentServiceKafka } from "./kafka";

const container = new Container();

// ▼ My dependency injection settings here ▼

container.bind<IPaymentRepository>("IPaymentRepository").to(PaymentRepository);

container.bind<IPaymentService>("IPaymentService").to(PaymentService);

container.bind<PaymentController>(PaymentController).toSelf();

container
  .bind<PaymentServiceKafka>("PaymentServiceKafka")
  .to(PaymentServiceKafka)
  .inSingletonScope();

export { container };
