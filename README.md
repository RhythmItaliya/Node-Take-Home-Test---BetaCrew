# BetaCrew Mock Exchange Client

## Overview

The BetaCrew Mock Exchange Client is a Node.js application that connects to the BetaCrew exchange server to request and receive stock ticker data. This client handles incoming packets, processes the data, and saves the results in a JSON file. It is designed to simulate interactions with a stock exchange environment.

## Features

- Connects to the BetaCrew exchange server using TCP.
- Requests to stream all available packets.
- Handles the incoming data and extracts relevant stock information.
- Saves the extracted data into a JSON file (`output.json`).
- Implements error handling for robust operation.

## Requirements

- Node.js version 16.17.0 or higher

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RhythmItaliya/Node-Take-Home-Test-BetaCrew.git

2. Install dependencies:
   ```bash
   npm install

3. Run the app:
   ```bash
   npm start