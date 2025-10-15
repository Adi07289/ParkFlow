#!/bin/bash

# Script to seed parking slots from B1 to B5, each with 15 slots

API_URL="http://localhost:8001/api/slots/bulk"

# Generate JSON data for all slots
generate_slots_json() {
  echo '['
  
  local first=true
  
  for floor in B1 B2 B3 B4 B5; do
    for i in {1..15}; do
      # Add comma before each entry except the first
      if [ "$first" = true ]; then
        first=false
      else
        echo ","
      fi
      
      # Format slot number with leading zero
      slot_number="${floor}-$(printf "%02d" $i)"
      
      # Determine slot type based on position
      if [ $i -le 2 ]; then
        slot_type="HANDICAP_ACCESSIBLE"
      elif [ $i -le 4 ]; then
        slot_type="EV"
      elif [ $i -le 8 ]; then
        slot_type="COMPACT"
      else
        slot_type="REGULAR"
      fi
      
      # Output JSON object (without trailing comma)
      printf '  {"slotNumber": "%s", "slotType": "%s"}' "$slot_number" "$slot_type"
    done
  done
  
  echo
  echo ']'
}

# Create the slots
echo "Creating parking slots from B1 to B5..."
echo "Each floor will have:"
echo "  - Slots 01-02: HANDICAP_ACCESSIBLE"
echo "  - Slots 03-04: EV"
echo "  - Slots 05-08: COMPACT"
echo "  - Slots 09-15: REGULAR"
echo ""

# Generate JSON and send request
json_data=$(generate_slots_json)

# Send the request
response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$json_data")

# Check response
if echo "$response" | grep -q '"success":true'; then
  count=$(echo "$response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
  echo "✅ Successfully created $count parking slots!"
  echo ""
  echo "Summary:"
  for floor in B1 B2 B3 B4 B5; do
    echo "  $floor: 15 slots ($floor-01 to $floor-15)"
  done
else
  echo "❌ Failed to create slots"
  echo "Response: $response"
fi