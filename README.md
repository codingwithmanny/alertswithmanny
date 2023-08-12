# Alerts With Manny

A way to be notified when a contract public value has met a specific criteria.

---

## Requirements

- [Node.js](https://nodejs.org/en/) >= 18.16.1
- [Upstash.com QStash Account](https://upstash.com)
- [Resend.com Account](https://resend.com)
- [ngrok.com Account](https://ngrok.com)

---

## Installation & Setup

Install the dependencies:

```bash
# FROM: ./

pnpm install;
```

Set environment variables:

```bash
# FROM: ./

cp .env.example .env;
```

---

## Usage


## Step 1 - Ngrok Forwarding 

Setup an ngrok forwarding address to expose your localhost:3000 to the internet.

```bash
./ngrok http 3000

# [Expected Output]:
# Session Status                online
# Account                       yourUsername (Plan: Free)
# Update                        update available (version 3.3.3, Ctrl-U to update)
# Version                       3.1.0
# Latency                       33ms
# Web Interface                 http://127.0.0.1:4040
# Forwarding                    https://COPY_THIS_FULL_ADDRESS.ngrok-free.app -> http://
# 
# Connections                   ttl     opn     rt1     rt5     p50     p90
#                               46      0       0.00    0.00    5.13    5.99
```

## Step 2 - Start Local Hardhat Node

Start a local hardhat node with the following command:

```bash
# FROM: ./

pnpm dev --filter contracts;
```

## Step 3 - Deploy Contracts

Deploy the contracts to your local hardhat node.

In a new Terminal window:

```bash
# FROM: ./

# default is set to localhost
cd apps/contracts;
pnpm run deploy;

# [Expected Output]:
# [Set address as the HEARTBEAT_CONTRACT_ADDRESS in your .env file]
# HeartBeat Contract deployed to 0x5FbDB2315678afecb367f032d93F642f64180aa3
# [Take note of dAPIFeed Contract for web app]
# DAPIFeed Contract deployed to 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

## Step 4 - Run HeartBeat Server

This will randomly set a new value for the HeartBeat contract every 5 seconds.

In a new Terminal window:

```bash
# FROM: ./

pnpm dev --filter heartbeat;
```

## Step 5 - Run Database Migrations & Generate Types

This will create the necessary tables in sqlite locally and generate the necessary types.

```bash
# FROM: ./

pnpm db:migrate -- --name init;
pnpm db:generate
```

## Step 6 - Run Web App

This will start the web app on localhost:3000 and make it accessible via your ngrok forwarding address.

```bash
# FROM: ./

pnpm dev --filter web;

# [Expected Output]:
# ...
# web:dev: - ready started server on 0.0.0.0:3000, url: http://localhost:3000
# ...
```





