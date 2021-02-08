import { Options, Client } from 'tmi.js';
import { join, dirname } from 'path';
import { accessSync, constants } from 'fs';
import { config } from 'dotenv'

// Importing .env settings
let dotfile:string = null;
const paths = [
    '.env',
    join(process.cwd(), '.env'),
    join(__dirname, '.env'),
    join(dirname(__dirname), '.env')
];

paths.forEach((fileEnv:string) => {
    try {
        accessSync(fileEnv, constants.F_OK | constants.R_OK);
        dotfile = fileEnv;
        return;
    } catch (e) {
        //Nothing to do
    }
});

if (dotfile === null) {
    console.error('FATAL ERROR, ".env" FILE NOT FOUND');
    process.exit(-1);
}
config({path: dotfile});

const TWITCH_USERNAME = process.env.TWITCH_USERNAME;
const TWITCH_OAUTH = process.env.TWITCH_OAUTH;


// Define configuration options
const opts:Options = {
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH
  },
  channels: [
    process.env.TWITCH_CHANNEL
  ],
  logger: {
      info: (m:string) => console.info('INFO: %s', m),
      warn: (m:string) => console.warn('WARNING: %s', m),
      error: (m:string) => console.error('ERROR: %s', m)
  }
};


// Create a client with our options
const client = new Client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target:any, context:any, msg:any, self:any) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

  // If the command is known, let's execute it
  if (commandName === '!dice') {
    const num = rollDice();
    client.say(target, `You rolled a ${num}`);
    console.log(`* Executed ${commandName} command`);
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
}
// Function called when the "dice" command is issued
function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}
// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}