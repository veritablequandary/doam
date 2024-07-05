const pino = require('pino');

const transports = [
  {
    target: 'pino-pretty',
    options: { destination: 1 },
  },
];

if (process.env.AXIOM_DATASET && process.env.AXIOM_TOKEN) {
  transports.push({
    target: '@axiomhq/pino',
    options: {
      dataset: process.env.AXIOM_DATASET,
      token: process.env.AXIOM_TOKEN,
    },
  });
}

exports.log = pino(
  {
    name: 'DOAM',
    level: 'info',
    redact: {
      paths: ['pid', 'hostname'],
      remove: true,
    },
  },
  pino.transport({ targets: transports })
);
