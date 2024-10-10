/**
 * TCP Client for BetaCrew Mock Exchange.
 * 
 * This client connects to the BetaCrew mock exchange server to request and 
 * receive stock ticker data. It handles incoming packets, processes the data, 
 * and saves the results in a JSON file. The client utilizes TCP for communication
 * and implements error handling and logging mechanisms to ensure stability.
 */

const net = require('net');
const fs = require('fs');

const HOST = '127.0.0.1';
const PORT = 3000;

/**
 * Creates the payload for requesting all packets from the server.
 * 
 * @returns {Buffer} - The binary payload to be sent to the server.
 */
function createStreamAllPacketsPayload() {
    const payload = Buffer.alloc(2);
    payload.writeUInt8(1, 0);
    return payload;
}

/**
 * Handles the data received from the server.
 * 
 * This function processes the incoming data packets and extracts relevant information.
 * 
 * @param {Buffer} data - The data received from the server.
 * @returns {Array} - An array of packet objects containing extracted information.
 */
function handleData(data) {
    const packets = [];
    let i = 0;
    while (i < data.length) {
        const symbol = data.toString('ascii', i, i + 4).trim();
        const buySell = data.toString('ascii', i + 4, i + 5);
        const quantity = data.readInt32BE(i + 5);
        const price = data.readInt32BE(i + 9);
        const sequence = data.readInt32BE(i + 13);

        packets.push({ symbol, buySell, quantity, price, sequence });
        i += 17;
    }
    return packets;
}

/**
 * Saves the received packets to a JSON file.
 * 
 * @param {Array} packets - The array of packet objects to be saved.
 */
function savePacketsToFile(packets) {
    const fileName = 'output.json';
    fs.writeFileSync(fileName, JSON.stringify(packets, null, 2));
    console.log(`Data saved to ${fileName}`);
}

/**
 * Creates a TCP client and connects to the BetaCrew server.
 * 
 * This function initiates the connection to the server and sends a request to 
 * stream all packets upon successful connection.
 */
const client = net.createConnection({ host: HOST, port: PORT }, () => {
    console.log('Connected to the server');
    client.write(createStreamAllPacketsPayload());
});

/**
 * Event listener for incoming data from the server.
 * 
 * Processes the received data to extract packets, saves them to a file, and closes 
 * the connection.
 */
client.on('data', (data) => {
    const packets = handleData(data);
    savePacketsToFile(packets);
    client.end();
});

/**
 * Event listener for errors during the connection.
 * 
 * Logs any errors that occur during the connection process.
 */
client.on('error', (err) => {
    console.error(`Error: ${err.message}`);
});

/**
 * Event listener for when the connection is closed.
 * 
 * Logs a message indicating that the connection has ended.
 */
client.on('end', () => {
    console.log('Disconnected from server');
});