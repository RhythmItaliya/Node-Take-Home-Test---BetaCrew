const net = require('net');
const fs = require('fs');

const HOST = '127.0.0.1';
const PORT = 3000;

const client = new net.Socket();
const receivedSequences = new Set();
const outputData = [];

const connectToServer = () => {
    client.connect(PORT, HOST, () => {
        console.log(`Connected to server at ${HOST}:${PORT}`);
        const request = Buffer.alloc(2);
        request.writeUInt8(1, 0);
        request.writeUInt8(0, 1);
        console.log(`Sending request to server: ${request.toString('hex')}`);
        client.write(request);
    });
};

const parseData = (data) => {
    const packetSize = 17;
    const packets = [];
    console.log(`Parsing data of length: ${data.length}`);
    for (let offset = 0; offset < data.length; offset += packetSize) {
        if (offset + packetSize <= data.length) {
            const symbol = data.toString('utf-8', offset, offset + 4).trim();
            const buySellIndicator = String.fromCharCode(data.readUInt8(offset + 4));
            const quantity = data.readUInt32BE(offset + 5);
            const price = data.readUInt32BE(offset + 9);
            const sequence = data.readUInt32BE(offset + 13);
            packets.push({
                symbol,
                buySellIndicator,
                quantity,
                price,
                sequence
            });
            receivedSequences.add(sequence);
            console.log(`Received and parsed packet: ${JSON.stringify(packets[packets.length - 1])}`);
        } else {
            console.log(`Incomplete packet at offset: ${offset}. Data length: ${data.length}`);
        }
    }
    return packets;
};

client.on('data', (data) => {
    console.log(`Received data from server (length: ${data.length}):`, data);
    const parsedPackets = parseData(data);
    parsedPackets.forEach((packet) => {
        outputData.push(packet);
    });
});

client.on('close', () => {
    console.log('Connection closed. Checking for missing sequences...');
    const expectedSequences = Array.from(receivedSequences).sort((a, b) => a - b); // Sort received sequences
    console.log(`Received sequences: ${expectedSequences}`);

    const missingSequences = [];
    for (let seq = 1; seq <= (expectedSequences[expectedSequences.length - 1] || 0); seq++) {
        if (!receivedSequences.has(seq)) {
            missingSequences.push(seq);
        }
    }

    console.log('Missing sequences:', missingSequences);
    if (missingSequences.length > 0) {
        console.log('Requesting missing sequences...');
        missingSequences.forEach((seq) => {
            const request = Buffer.alloc(2);
            request.writeUInt8(2, 0);
            request.writeUInt8(seq, 1);
            console.log(`Sending request to resend packet with sequence: ${seq}`);
            client.write(request);
        });
    }

    fs.writeFileSync('output.json', JSON.stringify(outputData, null, 2));
    console.log('Output data written to output.json');
});

connectToServer();