package parkflow;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a Parking Session in the ParkFlow system.
 * Tracks a vehicle's parking lifecycle from entry to exit.
 */
public class ParkingSession {

    // ---- Attributes ----
    private String id;
    private String vehicleId;
    private String slotId;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private SessionStatus status;
    private BillingType billingType;
    private BigDecimal billingAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ---- Associations ----
    private Vehicle vehicle;       // Many ParkingSession -> 1 Vehicle
    private ParkingSlot slot;      // Many ParkingSession -> 1 ParkingSlot

    // ---- Constructors ----
    public ParkingSession() {
        this.status = SessionStatus.ACTIVE;
        this.entryTime = LocalDateTime.now();
        this.billingAmount = BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public ParkingSession(String id, Vehicle vehicle, ParkingSlot slot, BillingType billingType) {
        this();
        this.id = id;
        this.vehicle = vehicle;
        this.vehicleId = vehicle.getId();
        this.slot = slot;
        this.slotId = slot.getId();
        this.billingType = billingType;
    }

    // ---- Operations (from Class Diagram) ----

    /**
     * Registers a vehicle entry and creates a new ACTIVE session.
     */
    public ParkingSession registerEntry(Vehicle vehicle, ParkingSlot slot, BillingType billingType) {
        this.vehicle = vehicle;
        this.vehicleId = vehicle.getId();
        this.slot = slot;
        this.slotId = slot.getId();
        this.billingType = billingType;
        this.status = SessionStatus.ACTIVE;
        this.entryTime = LocalDateTime.now();
        return this;
    }

    /**
     * Registers a vehicle exit, calculates billing, and completes the session.
     */
    public ParkingSession registerExit(String plate) {
        this.exitTime = LocalDateTime.now();
        this.status = SessionStatus.COMPLETED;
        // Billing amount would be calculated by BillingService
        this.updatedAt = LocalDateTime.now();
        return this;
    }

    /**
     * Extends the session by changing the billing type (e.g., HOURLY to DAY_PASS).
     */
    public ParkingSession extendSession(String id, BillingType newBillingType) {
        this.billingType = newBillingType;
        this.updatedAt = LocalDateTime.now();
        return this;
    }

    /**
     * Force ends an active session (Admin only).
     */
    public ParkingSession forceEndSession(String id) {
        this.exitTime = LocalDateTime.now();
        this.status = SessionStatus.COMPLETED;
        this.updatedAt = LocalDateTime.now();
        return this;
    }

    /**
     * Retrieves all currently active parking sessions.
     */
    public List<ParkingSession> getActiveSessions() {
        // Query database for all sessions with ACTIVE status
        return new ArrayList<>();
    }

    // ---- Getters and Setters ----

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getSlotId() {
        return slotId;
    }

    public void setSlotId(String slotId) {
        this.slotId = slotId;
    }

    public LocalDateTime getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }

    public LocalDateTime getExitTime() {
        return exitTime;
    }

    public void setExitTime(LocalDateTime exitTime) {
        this.exitTime = exitTime;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public BillingType getBillingType() {
        return billingType;
    }

    public void setBillingType(BillingType billingType) {
        this.billingType = billingType;
    }

    public BigDecimal getBillingAmount() {
        return billingAmount;
    }

    public void setBillingAmount(BigDecimal billingAmount) {
        this.billingAmount = billingAmount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public ParkingSlot getSlot() {
        return slot;
    }

    public void setSlot(ParkingSlot slot) {
        this.slot = slot;
    }

    @Override
    public String toString() {
        return "ParkingSession{id='" + id + "', vehicleId='" + vehicleId + "', slotId='" + slotId +
               "', status=" + status + ", billingType=" + billingType + ", billingAmount=" + billingAmount + "}";
    }
}
