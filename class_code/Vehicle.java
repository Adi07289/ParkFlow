package parkflow;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a Vehicle registered in the ParkFlow system.
 * Associated with parking sessions.
 */
public class Vehicle {

    // ---- Attributes ----
    private String id;
    private String numberPlate;
    private VehicleType vehicleType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ---- Associations ----
    private List<ParkingSession> parkingSessions; // 1 Vehicle -> 0..* ParkingSession

    // ---- Constructors ----
    public Vehicle() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.parkingSessions = new ArrayList<>();
    }

    public Vehicle(String id, String numberPlate, VehicleType vehicleType) {
        this();
        this.id = id;
        this.numberPlate = numberPlate;
        this.vehicleType = vehicleType;
    }

    // ---- Operations (from Class Diagram) ----

    /**
     * Searches for a vehicle by its number plate.
     */
    public Vehicle searchByPlate(String plate) {
        // Search vehicle in database by plate number
        return this;
    }

    /**
     * Quick search for vehicles matching a query string.
     */
    public List<Vehicle> quickSearch(String query) {
        // Search vehicles matching partial plate or type
        return new ArrayList<>();
    }

    // ---- Getters and Setters ----

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNumberPlate() {
        return numberPlate;
    }

    public void setNumberPlate(String numberPlate) {
        this.numberPlate = numberPlate;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
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
        return "Vehicle{id='" + id + "', numberPlate='" + numberPlate + "', vehicleType=" + vehicleType + "}";
    }
}
