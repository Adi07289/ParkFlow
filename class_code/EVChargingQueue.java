import java.time.Instant;

/**
 * Represents an entry in the EV Charging Queue.
 * Vehicles join this queue when all EV charging slots are occupied.
 */
public class EVChargingQueue {

    public enum QueueStatus {
        WAITING, NOTIFIED, EXPIRED, FULFILLED
    }

    private String id;
    private String vehicleId;
    private Instant requestedAt;
    private Instant notifiedAt;
    private QueueStatus status;
    private int priority;
    private Instant createdAt;
    private Instant updatedAt;

    // Relationships
    private Vehicle vehicle;

    public EVChargingQueue() {
        this.status = QueueStatus.WAITING;
        this.priority = 0;
        this.requestedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }
    public Instant getRequestedAt() { return requestedAt; }
    public void setRequestedAt(Instant requestedAt) { this.requestedAt = requestedAt; }
    public Instant getNotifiedAt() { return notifiedAt; }
    public void setNotifiedAt(Instant notifiedAt) { this.notifiedAt = notifiedAt; }
    public QueueStatus getStatus() { return status; }
    public void setStatus(QueueStatus status) { this.status = status; }
    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }
}
