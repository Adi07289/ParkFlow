#!/bin/bash

# ParkFlow Slot Management Testing Script
echo "🚀 Testing ParkFlow Slot Management API..."
echo "=========================================="

API_BASE="http://localhost:8008/api"
FRONTEND_URL="http://localhost:3001"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to check HTTP response codes
check_response() {
    if [ $1 -ge 200 ] && [ $1 -lt 300 ]; then
        echo -e "${GREEN}✅ Success (HTTP $1)${NC}"
        return 0
    elif [ $1 -eq 404 ]; then
        echo -e "${YELLOW}⚠️  Not Found (HTTP $1)${NC}"
        return 1
    else
        echo -e "${RED}❌ Failed (HTTP $1)${NC}"
        return 1
    fi
}

echo "1. Testing Backend Health..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/../health")
check_response $response

echo ""
echo "2. Testing Single Slot Creation..."
create_response=$(curl -s -X POST "$API_BASE/slots" \
  -H "Content-Type: application/json" \
  -d '{"slotNumber": "TEST-SINGLE-001", "slotType": "REGULAR"}' \
  -w "HTTP_CODE:%{http_code}")

http_code=$(echo "$create_response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
slot_data=$(echo "$create_response" | sed 's/HTTP_CODE:[0-9]*//')
slot_id=$(echo "$slot_data" | jq -r '.data.id' 2>/dev/null)

check_response $http_code
if [ $? -eq 0 ]; then
    echo "   Created slot ID: $slot_id"
fi

echo ""
echo "3. Testing Bulk Slot Creation..."
bulk_response=$(curl -s -X POST "$API_BASE/slots/bulk" \
  -H "Content-Type: application/json" \
  -d '[
    {"slotNumber": "TEST-BULK-001", "slotType": "REGULAR"},
    {"slotNumber": "TEST-BULK-002", "slotType": "COMPACT"},
    {"slotNumber": "TEST-BULK-003", "slotType": "EV"}
  ]' \
  -w "HTTP_CODE:%{http_code}")

bulk_http_code=$(echo "$bulk_response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
check_response $bulk_http_code

echo ""
echo "4. Testing Slot Listing..."
list_response=$(curl -s -w "HTTP_CODE:%{http_code}" "$API_BASE/slots")
list_http_code=$(echo "$list_response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
list_data=$(echo "$list_response" | sed 's/HTTP_CODE:[0-9]*//')

check_response $list_http_code
if [ $? -eq 0 ]; then
    slot_count=$(echo "$list_data" | jq -r '.data.slots | length' 2>/dev/null)
    echo "   Found $slot_count slots"
fi

echo ""
echo "5. Testing Slot Deletion (Valid Slot)..."
if [ ! -z "$slot_id" ] && [ "$slot_id" != "null" ]; then
    delete_response=$(curl -s -X DELETE "$API_BASE/slots/$slot_id" \
      -w "HTTP_CODE:%{http_code}")
    
    delete_http_code=$(echo "$delete_response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    check_response $delete_http_code
else
    echo -e "${YELLOW}⚠️  Skipping - No valid slot ID from creation test${NC}"
fi

echo ""
echo "6. Testing Slot Deletion (Invalid Slot)..."
invalid_delete=$(curl -s -X DELETE "$API_BASE/slots/invalid-id-12345" \
  -w "HTTP_CODE:%{http_code}")

invalid_http_code=$(echo "$invalid_delete" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
if [ $invalid_http_code -eq 404 ]; then
    echo -e "${GREEN}✅ Correctly returned 404 for invalid slot${NC}"
else
    echo -e "${RED}❌ Expected 404, got HTTP $invalid_http_code${NC}"
fi

echo ""
echo "7. Testing Frontend Accessibility..."
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
check_response $frontend_response

echo ""
echo "8. Clean up test slots..."
echo "   Removing any remaining test slots..."

# Get all slots and filter test slots
all_slots=$(curl -s "$API_BASE/slots" | jq -r '.data.slots[]? | select(.slotNumber | startswith("TEST-")) | .id' 2>/dev/null)

if [ ! -z "$all_slots" ]; then
    echo "$all_slots" | while read test_slot_id; do
        if [ ! -z "$test_slot_id" ]; then
            cleanup_response=$(curl -s -X DELETE "$API_BASE/slots/$test_slot_id" -w "%{http_code}")
            echo "   Cleaned up slot: $test_slot_id"
        fi
    done
else
    echo "   No test slots to clean up"
fi

echo ""
echo "=========================================="
echo "🏁 Testing Complete!"
echo ""
echo "Frontend Application: $FRONTEND_URL"
echo "API Documentation: $API_BASE/../docs"
echo ""
echo "To test the frontend UI:"
echo "1. Visit $FRONTEND_URL"
echo "2. Navigate to Maintenance page"
echo "3. Test 'Add Slot', 'Bulk Add', and Delete buttons"