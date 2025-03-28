#!/bin/bash

# Kill the existing Next.js process if it exists
pkill -f "next dev"

# Wait for the process to be killed
sleep 2

# Start the Next.js development server
npm run dev 