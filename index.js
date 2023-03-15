'use strict';
const MONITOR_IP = '8.8.8.8';       // IP to ping
const DELAY = 5000;                 // milliseconds
const HOSTS = [MONITOR_IP];
const PACKET_COUNT = "50";
const DELAY_BETWEEN_PACKETS = "0.1";

const ping = require('ping');
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
let wasDown = false;

const logFormat = winston.format.printf(
  ({ timestamp, status }) => {
    return `${timestamp}: ${status}`;
  }
);

let logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
  transports: [
    new DailyRotateFile({
      maxFiles: 10,
      dirname: "logs/",
      filename: "%DATE%.log",
      datePattern: "YYYY-MM-DD",
    }),
    new winston.transports.Console(),
  ],
});

const log = status => {
  logger.log({level: 'info', status});
}

const pingMe = hosts => () => {
  hosts.forEach((host) => {
    ping.promise.probe(
      host,
      {
        timeout: 10,
        extra: ["-c", PACKET_COUNT, "-i", DELAY_BETWEEN_PACKETS]
      })
      .then((res) => {
        log(`Host: ${res.host} | Alive: ${res.alive} | Latency: ${res.avg} ms | Packet loss: ${res.packetLoss}%`);
      })
  })
}

log(`Pinging ${HOSTS}!`);
setInterval(pingMe(HOSTS), DELAY);
