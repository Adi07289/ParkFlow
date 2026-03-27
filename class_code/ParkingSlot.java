package parkflow;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents a Parking Slot in the ParkFlow system.
 * Each slot can be assigned to vehicles for parking sessions.
 */
public class ParkingSlot {

    // ---- Attributes ----
    private String id;
    private String slotNumber;
    private SlotType slotType;
    private SlotStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ---- Associations ----
    private List<ParkingSession> parkingSessions; // 1 ParkingSlot -> 0..* ParkingSession

    // ---- Constructors ----
    public ParkingSlot() {
        this.status = SlotStatus.AVAILABLE;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.parkingSessions = new ArrayList<>();
    }

    public ParkingSlot(String id, String slotNumber, SlotType slotType) {
        this();
        this.id = id;
        this.slotNumber = slotNumber;
        this.slotType = slotType;
    }

    // ---- Operations (from Class Diagram) ----

    /**
     * Creates a new parking slot with the given number and type.
     */
    public ParkingSlot createSlot(String number, SlotType type) {
        this.slotNumber = number;
        this.slotType = type;
        this.status = SlotStatus.AVAILABLE;
        this.createdAt = LocalDateTime.now();
        return this;
    }

    /**
     * Updates the slot's status.
     */
    public ParkingSlot updateSlot(String id, SlotStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
        return this;
    }

    /**
     * Auto-assigns an available slot based on vehicle type.
     */
    public ParkingSlot autoAssign(VehicleType vehicleType) {
        // Find an available slot matching the vehicle type
        // EV vehicles get EV slots, HANDICAP_ACCESSIBLE get handicap slots, etc.
        this.status = SlotStatus.OCCUPIED;
        this.updatedAt = LocalDateTime.now();
        return this;
    }

    /**
     * Sets the slot to maintenance mode (takes it offline).
     */
    public void setMaintenance(String id) {
        this.status = SlotStatus.MAINTENANCE;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Returns a map of slot availability grouped by type.
     */
    public Map<SlotType, Integer> getAvailabilityMap() {
        Map<SlotType, Integer> availability = new HashMap<>();
        availability.put(SlotType.REGULAR, 0);
        availability.put(SlotType.COMPACT, 0);
        availability.put(SlotType.EV, 0);
        availability.put(SlotType.HANDICAP_ACCESSIBLE, 0);
        return availability;
    }

    // ---- Getters and Setters ----

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public SlotType getSlotType() {
        return slotType;
    }

    public void setSlotType(SlotType slotType) {
        this.slotType = slotType;
    }

    public SlotStatus getStatus() {
        return status;
    }

    public void setStatus(SlotStatus status) {
        this.status = status;
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

    public List<ParkingSession> getParkingSessions() {
        return parkingSessions;
    }

    public void addParkingSession(ParkingSession session) {
        this.parkingSessions.add(session);
    }

    @Override
    public String toString() {
        return "ParkingSlot{id='" + id + "', slotNumber='" + slotNumber + "', slotType=" + slotType + ", status=" + status + "}";
    }
}
