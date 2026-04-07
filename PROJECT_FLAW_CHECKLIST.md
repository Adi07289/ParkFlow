# ParkFlow Flaw Checklist

Use this file as the live remediation tracker while we fix the project.

Status legend:
- `[ ]` Not started
- `[~]` In progress
- `[x]` Fixed
- `[!]` Needs product decision

## Critical

- [x] Authentication is effectively disabled
  Area: Auth / Platform security
  Severity: Critical
  Problem: Frontend creates a fake anonymous user, dashboard access is open, backend does not actually enforce auth, and the auth middleware calls `next()` before validating the token.
  Impact: The platform is publicly accessible even though it presents itself as authenticated.
  Fix notes: Replaced fake anonymous auth, added backend `/api` protection with auth exemptions only for login/register OTP endpoints, fixed the broken middleware flow, and restored protected-route enforcement in the frontend.

- [x] OTPs are exposed directly to the frontend
  Area: Auth / Security
  Severity: Critical
  Problem: The backend returns OTP values in API responses and the login/register screens render them to the user.
  Impact: OTP verification is no longer a real security control.
  Fix notes: Removed OTP values from auth responses, removed OTP rendering from login/register, and updated the OTP hook to stop storing displayable codes.

- [x] Subscription and loyalty are not connected to parking sessions
  Area: Data model / Billing / Subscriptions
  Severity: Critical
  Problem: `Subscription` belongs to `User`, but `ParkingSession` has no `userId`, and parking entry does not accept or persist user ownership.
  Impact: Discounts, loyalty points, and paid plans cannot be applied to real parking activity in a trustworthy way.
  Fix notes: Added nullable `userId` ownership to `ParkingSession`, introduced the `User -> ParkingSession[]` relation in Prisma, created a safe migration that preserves anonymous walk-in sessions, and updated parking entry so an operator can optionally attach a real ParkFlow user at session creation time.

- [x] Subscription discount and loyalty accrual logic exist but are not used by parking flows
  Area: Billing / Subscriptions
  Severity: Critical
  Problem: `applyDiscount` and loyalty accrual methods exist in the service layer, but parking entry/exit does not call them.
  Impact: Users can subscribe without receiving the promised pricing or rewards.
  Fix notes: Parking exit now calculates the base parking charge, applies subscription discount for owned sessions, persists the discounted final amount, and awards loyalty points after successful completion. Anonymous sessions still use the original standard pricing path unchanged.

- [x] Swap marketplace does not transfer any real entitlement
  Area: Swaps / Sessions
  Severity: Critical
  Problem: Claiming a swap only updates swap status metadata. It does not reassign session ownership, slot rights, or any operational parking state.
  Impact: Users can "claim" swaps that do not actually do anything.
  Fix notes: Swap claims now run against owned active sessions only and transfer `ParkingSession.userId` to the claiming user inside the same transaction that marks the listing claimed, so the entitlement actually moves.

## High

- [x] Subscription flow requires a raw `userId` that normal frontend flows do not expose
  Area: Subscriptions / Users
  Severity: High
  Problem: The subscription page requires manual `userId` lookup, but the main UI does not surface that identifier where users would need it.
  Impact: The subscription workflow is blocked for normal operators.
  Fix notes: Added user discovery to the subscriptions screen, supported direct navigation with a selected user, and removed the requirement to know an unseen ID before starting the flow.

- [x] Users page is not connected from main navigation
  Area: Navigation / Users
  Severity: High
  Problem: The users screen exists but is not available from the primary nav.
  Impact: Even the only partial path for discovering user records is hidden.
  Fix notes: Added `Users` to the main navigation so operators can reach the user-management flow directly.

- [x] Users page does not display user IDs
  Area: Users / Admin operations
  Severity: High
  Problem: The users page shows email and dates but not the `id` needed by subscriptions and other admin operations.
  Impact: Cross-feature workflows depend on identifiers the UI does not reveal.
  Fix notes: Users now show their IDs, support copy-to-clipboard, and include a direct handoff into the subscriptions screen.

- [x] EV queue join requires raw `vehicleId` with no clear discovery path
  Area: EV charging / Vehicles
  Severity: High
  Problem: Operators must enter a vehicle ID to join the EV queue, but the EV screen does not help them select a valid vehicle from active parking data.
  Impact: Queue join is blocked or requires database knowledge.
  Fix notes: Added EV vehicle search by number plate, surfaced matching vehicle IDs, and let operators add a selected EV to the queue without hidden database knowledge.

- [x] EV charging completion requires raw `sessionId` with no clear discovery path
  Area: EV charging / Sessions
  Severity: High
  Problem: Operators must enter a session ID to mark charging complete, but the EV screen and current-session views do not expose that ID in an operational workflow.
  Impact: Charging completion is difficult to execute from the UI.
  Fix notes: Added active EV session discovery on the EV screen, surfaced session IDs directly, and provided a one-click handoff into the completion action.

- [x] EV queue notification does not verify slot availability before notifying
  Area: EV charging / Queue logic
  Severity: High
  Problem: The system can notify the next vehicle in queue without confirming that an EV slot has actually become available.
  Impact: Users can be told a charger is available when it is not.
  Fix notes: Backend notification now verifies that at least one EV charging slot is actually available before moving the next queued vehicle into the notified state.

- [x] Billing explanations in UI contradict actual backend billing rules
  Area: Billing / Parking exit
  Severity: High
  Problem: UI copy says day pass is charged at entry and no exit charge applies, while backend calculates billing on exit. UI estimates also use different prices from backend slabs.
  Impact: Operators and users receive conflicting pricing information.
  Fix notes: Updated billing copy to reflect exit-time billing, aligned exit estimates with backend slabs and rates, and removed misleading receipt savings messaging.

- [x] Notification read state is not persistent
  Area: Notifications
  Severity: High
  Problem: Backend always regenerates notifications as unread, and mark-read endpoints do not persist anything.
  Impact: The same alerts keep coming back as unread after refresh.
  Fix notes: Added persistent notification read state using Redis-backed IDs so unread counts and read markers survive refetches.

- [x] Analytics dashboard includes hardcoded or fabricated metrics
  Area: Analytics
  Severity: High
  Problem: Some displayed analytics are made up, such as fixed growth text and estimated peak occupancy.
  Impact: The dashboard can mislead operators with non-real values.
  Fix notes: Removed hardcoded revenue growth copy and replaced slot peak occupancy estimation with a value derived from actual occupied-time data.

## Medium

- [x] Swap listing flow accepts arbitrary `userId` without proving ownership
  Area: Swaps / Authorization / Data integrity
  Severity: Medium
  Problem: Listing creation trusts the submitted `userId` instead of deriving it from authenticated ownership.
  Impact: A user can create listings on behalf of someone else at the API layer.
  Fix notes: Swap listing, claiming, cancellation, and history now use authenticated identity instead of raw request IDs, and listing creation validates that the session is currently owned by the signed-in user.

- [x] Swap pricing can use `billingAmount = 0` for active sessions
  Area: Swaps / Billing
  Severity: Medium
  Problem: Active sessions often have no finalized billing amount yet, so swap listings can be created with meaningless original pricing.
  Impact: Savings and prices in the marketplace are unreliable.
  Fix notes: Active swap listings now derive original price from a live billing estimate, and if the session is user-owned the estimate also passes through the subscription discount logic before validating the listing price.

- [x] Swap marketplace has no frontend for listing, cancellation, or personal history
  Area: Swaps / UX completeness
  Severity: Medium
  Problem: The UI only supports browsing and claiming, even though the API exposes more actions.
  Impact: The feature is incomplete from a user workflow standpoint.
  Fix notes: The swaps page now shows the signed-in identity, lists the user’s eligible owned sessions, supports inline listing creation, shows personal swap activity/history, and allows cancellation of active seller listings.

- [x] Vehicle search history shows `$` instead of `₹`
  Area: Vehicle search / Billing display
  Severity: Medium
  Problem: Parking history in vehicle search uses the wrong currency symbol.
  Impact: Inconsistent financial display and reduced operator trust.
  Fix notes: Updated parking history currency rendering to use rupees consistently.

- [x] Exit flow shows estimated billing that does not match backend pricing
  Area: Parking exit / Billing display
  Severity: Medium
  Problem: Exit form and receipt savings logic use placeholder prices that do not match backend billing slabs.
  Impact: Users can see misleading cost previews before exit is processed.
  Fix notes: Updated the exit-form estimate logic to match backend hourly slabs and day-pass pricing, and removed placeholder savings assumptions from the receipt view.

- [x] Receipt and result flows still behave like demos in places
  Area: Parking entry / Exit UX
  Severity: Medium
  Problem: Printing is implemented as alert popups and some receipt logic still contains placeholder assumptions.
  Impact: The flow feels unfinished and can mislead operators about production readiness.
  Fix notes: Replaced alert-based receipt printing with browser print, and removed demo-style placeholder billing language from the exit result view.

## Cross-Cutting Product Gaps

- [x] Define the true user model for ParkFlow
  Area: Product architecture
  Severity: High
  Problem: The system mixes operators, subscribers, vehicle owners, and anonymous sessions without a single clear ownership model.
  Impact: Features like subscriptions, swaps, alerts, and billing cannot integrate cleanly.
  Fix notes: ParkFlow now treats parking sessions as optionally owned by a ParkFlow user. Walk-in parking still works with no owner, while subscriptions, loyalty, and swaps attach only to owned sessions. This gives the system a consistent operational model without breaking anonymous parking.

- [x] Replace raw-ID admin workflows with selection-based UI flows
  Area: UX architecture
  Severity: High
  Problem: Multiple features depend on hidden internal IDs instead of searchable, human-usable selectors.
  Impact: Operators are forced into brittle flows and hidden dependencies.
  Fix notes: Replaced the major hidden-ID flows with discoverable selectors or surfaced IDs in context, including subscriptions, users, EV queue/join/complete flows, parking-owner linking, and authenticated swap actions.

- [x] Align feature copy with actual business logic
  Area: Product consistency
  Severity: Medium
  Problem: Several screens describe behavior that the backend does not implement.
  Impact: Trust drops because the product says one thing and does another.
  Fix notes: Updated billing and receipt language to match exit-time billing, removed fabricated analytics copy, and clarified owner/subscription behavior in parking and swap flows so the UI now reflects the backend rules being enforced.

## Working Section

Current focus:
- Core logical flaw remediation completed
- Current step: final system verification and any follow-up QA the user wants

Recently fixed:
- Authentication is effectively disabled
- OTPs are exposed directly to the frontend
- Subscription flow requires a raw `userId` that normal frontend flows do not expose
- Users page is not connected from main navigation
- Users page does not display user IDs
- EV queue join requires raw `vehicleId` with no clear discovery path
- EV charging completion requires raw `sessionId` with no clear discovery path
- EV queue notification does not verify slot availability before notifying
- Billing explanations in UI contradict actual backend billing rules
- Vehicle search history shows `$` instead of `₹`
- Exit flow shows estimated billing that does not match backend pricing
- Receipt and result flows still behave like demos in places
- Notification read state is not persistent
- Analytics dashboard includes hardcoded or fabricated metrics
- Subscription and loyalty are not connected to parking sessions
- Subscription discount and loyalty accrual logic exist but are not used by parking flows
- Swap marketplace does not transfer any real entitlement
- Swap listing flow accepts arbitrary `userId` without proving ownership
- Swap pricing can use `billingAmount = 0` for active sessions
- Swap marketplace has no frontend for listing, cancellation, or personal history
- Define the true user model for ParkFlow
- Replace raw-ID admin workflows with selection-based UI flows
- Align feature copy with actual business logic

Blocked / needs decision:
- None yet

Verification completed:
- Backend type-check passed with `npx tsc -p tsconfig.build.json --noEmit`
- Backend production build passed with `npm run build`
- Focused frontend lint passed for the touched parking and swap files
- Frontend production build passed with `npm run build`
