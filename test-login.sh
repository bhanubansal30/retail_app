#!/bin/bash
# Quick test script to check server response

echo "Testing server response..."
echo ""
echo "Sending login request to http://192.168.3.19:3000/login"
echo ""

curl -X POST http://192.168.3.19:3000/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"bhanu","password":"bhanu@1234"}' \
  -s | jq '.'

echo ""
echo "Check the response above for accessToken and refreshToken fields"
