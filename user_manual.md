# ParkFlow – Smart Parking Management System: User Manual

## 1. Introduction
Welcome to the **ParkFlow User Manual**. This document provides a comprehensive guide to navigating and utilizing the Smart Parking Management System. It is designed for administrators, parking attendants, and managers to understand the purpose, layout, and functionality of every module within the application.

---

## 2. Public and Authentication Modules

### 2.1 Landing Page
![Landing Page](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/parkflow_home_1774618629938.png)
- **Purpose**: Acts as the entry point for the ParkFlow application, providing a high-level overview of features (automated entry, real-time analytics, EV charging) and access to authentication.
- **Key Components**: Top navigation bar, feature highlights, call-to-action buttons.
- **User Actions**: Click "Sign In" or "Get Started" to proceed to the registration and authentication workflow.

### 2.2 Login Screen
![Login Screen](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/02_login_1774620734107.png)
- **Purpose**: Secures the administrative dashboard by requiring users to authenticate using an email and OTP workflow.
- **Key Components**: Email input field, OTP verification step, and submission button.
- **User Actions**: Enter registered email address, receive the OTP, and input it to access the system. New users can navigate to the registration flow.

### 2.3 Registration Screen
![Registration Screen](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/03_register_1774620885971.png)
- **Purpose**: Allows new users to create an account within the ParkFlow ecosystem.
- **Key Components**: Email input form, Name input, OTP verification framework.
- **User Actions**: Provide valid email address and name, verify identity via OTP, and finalize registration.

---

## 3. Dashboard Hub
The Dashboard serves as the central command center, aggregating crucial operational data and providing rapid access to nested sub-modules via a tabbed interface.

### 3.1 Dashboard – Overview Tab
![Dashboard Overview](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/04_dashboard_overview_1774621172978.png)
- **Purpose**: Delivers a high-level, real-time snapshot of parking operations.
- **Key Components**: Metric cards displaying Total Slots, Occupancy Rate, Slots under Maintenance, and Today's Revenue.
- **User Actions**: Quickly assess system health, parking capacity, and financial performance at a glance.

### 3.2 Dashboard – Vehicle Search Tab
![Vehicle Search](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/05_dashboard_search_1774621321126.png)
- **Purpose**: Enables operators to quickly locate specific vehicles within the parking facility.
- **Key Components**: Search bar for license plates, and a dynamically updating results list.
- **User Actions**: Enter a vehicle number plate to view its current status, associated entry time, and assigned slot.

### 3.3 Dashboard – Current Sessions Tab
![Current Sessions](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/06_dashboard_sessions_png_1774621498416.png)
- **Purpose**: Provides a comprehensive list of all vehicles currently utilizing the parking facility.
- **Key Components**: Data table detailing Session ID, Vehicle Plate, Slot Number, and Session duration.
- **User Actions**: Monitor active vehicles and easily process an exit by identifying the specific active session.

### 3.4 Dashboard – Past Sessions Tab
![Past Sessions](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/07_dashboard_past_1774621598662.png)
- **Purpose**: Acts as an activity log for historical data analysis and dispute resolution.
- **Key Components**: Historical data table showing completed sessions, entry/exit timestamps, total duration, and transaction amounts.
- **User Actions**: Audit previous transactions and review operational history.

### 3.5 Dashboard – Billing & Rates Tab
![Billing & Rates](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/08_dashboard_billing_1774622017898.png)
- **Purpose**: Displays the current pricing structure across different parking modalities.
- **Key Components**: Read-only display cards detailing configurations for "Hourly Parking" and "Day Pass Parking".
- **User Actions**: Reference current billing rules that dictate cost calculations during vehicle exits.

---

## 4. Core Operational Modules

### 4.1 Parking Management – Vehicle Entry
![Vehicle Entry](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/09_parking_entry_1774622281946.png)
- **Purpose**: Facilitates the check-in process for arriving vehicles.
- **Key Components**: Intake form requiring Vehicle Number Plate, Vehicle Type, Billing Type preference, and Slot Assignment Mode (automatic).
- **User Actions**: Enter vehicle details, select the appropriate billing configuration, and register the entry to initiate a session.

### 4.2 Parking Management – Vehicle Exit
![Vehicle Exit Processing](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/10_parking_exit_1774622524564.png)
- **Purpose**: Processes departing vehicles, calculates final bills, and frees up parking slots.
- **Key Components**: Lookup search bar, exit processing wizard, and automated receipt generation area.
- **User Actions**: Search for a departing vehicle by plate or slot, review the resulting duration and billing, and execute the final "Process Vehicle Exit" action.

### 4.3 Users Management
![Users Management](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/11_users_1774622610357.png)
- **Purpose**: Allows system administrators to manage platform access and registered customer profiles.
- **Key Components**: User creation form and a directory listing of all registered users with action buttons (edit/delete).
- **User Actions**: Add new user accounts using their email address, view existing accounts, or remove obsolete records.

### 4.4 Alerts & Safety System
![Alerts System](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/12_alerts_1774622665012.png)
- **Purpose**: Monitors the facility for anomalies, security concerns, or system errors.
- **Key Components**: Alert severity summaries (Active, Resolved, Critical, High Priority) and a prioritized list of specific incident reports.
- **User Actions**: Run manual security scans, review incoming high-priority notifications (e.g., suspicious activity), and resolve alerts once addressed.

---

## 5. Analytics & Specialized Features

### 5.1 Analytics Dashboard
![Analytics Dashboard](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/13_analytics_1774622724240.png)
- **Purpose**: Transforms operational data into actionable business intelligence.
- **Key Components**: Revenue distribution metrics, an hourly Peak Utilization heatmap chart, and Slot Efficiency readouts.
- **User Actions**: Analyze financial trends, identify peak operational hours to optimize staffing, and assess overall facility utilization metrics.

### 5.2 EV Charging Management
![EV Charging Management](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/14_ev_charging_1774622965723.png)
- **Purpose**: Manages workflows exclusive to Electric Vehicle infrastructure.
- **Key Components**: Charging queue tracker, waitlist management inputs, and Idle EV tracking metrics.
- **User Actions**: Add vehicles to the charging queue, notify the next driver when a charger opens up, and manage sessions to monitor idle fees.

### 5.3 Slot Maintenance
![Slot Maintenance](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/15_maintenance_1774622904870.png)
- **Purpose**: Maintains the physical configuration state of the parking matrix.
- **Key Components**: Top-level slot capacity summary, and an inventory table detailing specific slot IDs, type (Regular/EV), and operational status.
- **User Actions**: Track individual slot availability, bulk add new parking bays, or remove individual slots from service.

### 5.4 Subscriptions & Loyalty
![Subscriptions & Loyalty](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/16_subscriptions_1774622933946.png)
- **Purpose**: Administers customer retention programs.
- **Key Components**: User subscription lookup tool and a catalog of tier definitions (Basic, Premium, Enterprise).
- **User Actions**: Search for a specific user to view/modify their tier, and verify the billing discounts and priority access rights associated with each tier.

### 5.5 Slot Swap Marketplace
![Slot Swap Marketplace](file:///Users/adityasharma/.gemini/antigravity/brain/36dbe9ad-9040-4248-b295-2010049704e0/17_swaps_1774622948699.png)
- **Purpose**: Provides a secondary market interface to manage reservation exchanges between users.
- **Key Components**: User ID identity verification form, marketplace metrics (Available Swaps, Avg. Savings), and active listing feeds.
- **User Actions**: Browse pending swap requests, verify user identity to authorize a transaction, and execute reservations exchanges.

---
*End of Document*
