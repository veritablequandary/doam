const pino = require('pino');

const transports = [
  {
    target: 'pino-pretty',
    options: { destination: 1 },
  },
];

// I use Axiom (axiom.co) for structured JSON log ingestion and monitoring in my production apps.
// If the dataset and token variables are present in the environment, logs will be sent to Axiom
// IN ADDITION to being pretty-printed to STDOUT - if not, only STDOUT pretty printed logs will be used.
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
