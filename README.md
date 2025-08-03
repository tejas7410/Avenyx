# ECommerce Fullstack Project | Microservice Architecture                                                                                                                                                                                                       
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white) ![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) 	![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

This project is an **E-commerce platform** built using a combination of **modular monolithic** and **microservices architectures**. The application is designed to **handle** key e-commerce operations such as **user management**, **product management**, **shopping cart operations**, **payment processing**, **order creation**, and **invoice generation**. The system is developed with a focus on **scalability**, **performance**, and **asynchronous communication** between services.

# Table of Contents
- [Project Overview](#coding-strategy) :mag_right:

  * [Coding Strategy](#coding-strategy) 

  * [Service Responsibilities](#service-responsibilities)

  * [Architecture Overview](#architecture-overview)

- [Project Planning and Flow on Miro](#project-planning-and-flow-on-miro) :wrench:
- [Project Demo Video](#project-demo-video) :movie_camera:
- [Getting Started](#getting-started) :rocket:
- [API Documentation Postman](#apı-documentation-postman)

# Coding Strategy

************ **Common Schema for All Services** ************

**Database Layer**
Uses Redis or MongoDB for data persistence, depending on the service requirements.

:arrow_down:
 
**Repository Layer**
Encapsulates database operations, ensuring clean and testable code.

:arrow_down:
 
**Service Layer**
Implements business logic, using a standardized ServiceMessage type to handle operations.

:arrow_down:
 
**Controller Layer**
Manages HTTP requests and responses, delegating logic to the service layer.

:arrow_down:

**Middlewares**
Global Error Handling ( Winston for logging ), Async Handler Typescript, JWT Authentication etc.

:arrow_down:
 
**Router**
Defines clear and RESTful API endpoints for client interaction.
________________________________________________________________________________________________________________________
************ **Technology** ************

Messaging:
**Apache Kafka** for event **streaming** and **asynchronous communication**. **Socket.io** for **real-time notification**.

Database:
**MongoDB** for persistent data storage.
**Redis** for **caching** and session management.

Search Engine:
**Elasticsearch** for advanced product search.

Security:
**JWT** for user authentication.

Containerization:
**Docker** for **deploying** services as containers.

Queue Management:
**Redis** Streams or **Kafka topics** for handling **real-time updates**.
________________________________________________________________________________________________________________________
  **[⬆ Back to Table of Contents](#table-of-contents)**
________________________________________________________________________________________________________________________
# Service Responsibilities
  
************ **Modular Monolith Services** ************
  
**Identity Service**

Manages user authentication and operations using JWT for security.

Handles session management through Redis caching.

Produces user-related events for downstream services.

**Product Service**

Handles product operations including creation, updates, and deletion.

Integrates Redis for caching and Elasticsearch for product search.

Produces product-related events for the Basket Service.

************ **Microservices** ************

**Basket Service**

Subscribes to Kafka topics to consume user and product events.

Updates the Redis cache to keep basket data in sync.

Manages shopping cart operations with high performance.

**Payment Service**

Processes and approves payments.

Produces payment-related events for Order and Invoice Services.

**Order Service**

Subscribes to payment events.

Stores order data asynchronously in its database.

**Invoice Service**

Subscribes to payment events.

Generates invoices and saves them in its database.

________________________________________________________________________________________________________________________
  **[⬆ Back to Table of Contents](#table-of-contents)**
________________________________________________________________________________________________________________________

# Architecture Overview

************ **Kafka Event Streaming** ************

**Identity Service and Product Service**

Produce Events:

UserCreated, UserUpdated, UserDeleted (Identity Service).

ProductCreated, ProductUpdated, ProductDeleted (Product Service).

**Basket Service**

Consumes Events from Identity and Product Services.

Updates Redis Cache accordingly to synchronize user and product data.

**Payment Service**

Produce Events:
PaymentCreated.

**Order Service and Invoice Service**

Subscribe to Payment Events.

Consume Messages to:

Create new orders in the Order Service database.

Generate invoices in the Invoice Service database.

************ **Redis Integration** ************

Identity Service:
Uses Redis for session management to ensure secure and scalable authentication.

Product Service:
Caches Product Data in Redis for enhanced read performance.
Integrated with Elasticsearch for advanced search capabilities.

Basket Service:
Core dependency on Redis for shopping cart and basket operations to handle frequent updates with high performance.

________________________________________________________________________________________________________________________
  **[⬆ Back to Table of Contents](#table-of-contents)**
________________________________________________________________________________________________________________________

# Project Planning and Flow on Miro

Public Link You Can Access: 

https://miro.com/app/board/uXjVL4Niglo=/?share_link_id=386144983852

![image](https://github.com/user-attachments/assets/6b9e7371-ff50-4694-a2b7-222bf16e05e4)


________________________________________________________________________________________________________________________
  **[⬆ Back to Table of Contents](#table-of-contents)**
________________________________________________________________________________________________________________________

# Project Demo Video

https://github.com/user-attachments/assets/a29bd0bb-b4b9-498e-be99-ddbb16c23e44

________________________________________________________________________________________________________________________
  **[⬆ Back to Table of Contents](#table-of-contents)**
________________________________________________________________________________________________________________________

# Getting Started

Follow these steps to set up and run the E-commerce application locally using Docker.

### **Prerequisites**
Ensure you have the following installed on your system:
- [Docker](https://www.docker.com/get-started)

### **Setup Instructions**

1. **Clone the Repository**
 ```bash
git clone <repository-url>
 cd <repository-name>
```


2. **Prepare Environment Variables**
 
In the root directory, ensure you have a .env file for environment-specific configurations.

Example .env file:

```bash
REDIS_HOST=redis
KAFKA_BROKER=kafka:9092
JWT_SECRET=your_jwt_secret
etc...
```

3. **Start the Services**

Run the following command to start all services defined in the docker-compose.yml file (-d for detached mode ) :

```bash
docker-compose up -d
```

4. **Verify the Setup**

Check if the containers are running :

```bash
docker ps
```

Confirm that the services are up and running:

Monolith Service: http://localhost:monolith-service-port

Basket Service: http://localhost:basket-service-port

Payment Service: http://localhost:payment-service-port

Order Service: http://localhost:order-service-port

Invoice Service: http://localhost:invoice-service-port

Kafka, Zookeper and Redis Service.

5. **Run Frontend and Get Enjoy!**
   
In frontend project run the project while your backend services are running.

6. **Stop the Services**

To stop the application, run :

```bash
docker-compose down
```
________________________________________________________________________________________________________________________
  **[⬆ Back to Table of Contents](#table-of-contents)**
________________________________________________________________________________________________________________________

# API Documentation Postman

You can find API documentation of backend here: 

https://web.postman.co/workspace/17dc098e-24ec-4687-87fc-59431f6be2f3/documentation/39362793-5a0dde56-cef1-40b4-9964-534151282795

________________________________________________________________________________________________________________________

# :incoming_envelope: Contact Information :incoming_envelope:

For any questions or further information, please don't hesitate to contact me :pray:

Email: merttopcu.dev@gmail.com

LinkedIn: https://www.linkedin.com/in/mert-topcu/

Happy Coding ❤️
