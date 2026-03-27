import java.time.Instant;
import java.util.List;

/**
 * Domain model representing digital signage feed data for parking facility displays.
 * This is the Java representation of the Contextual Digital Signage API response.
 */
public class SignageData {

    // --- Enums ---
    public enum AreaStatus {
        FULL, LOW, AVAILABLE, MAINTENANCE
    }

    public enum FacilityStatus {
        FULL, LOW, AVAILABLE
    }

    // --- Inner classes ---

    /**
     * Availability breakdown by slot type within an area.
     */
    public static class SlotTypeAvailability {
        private String slotType;
        private int available;
        private int total;

        public SlotTypeAvailability() {}

        public SlotTypeAvailability(String slotType, int available, int total) {
            this.slotType = slotType;
            this.available = available;
            this.total = total;
        }

        public String getSlotType() { return slotType; }
        public void setSlotType(String slotType) { this.slotType = slotType; }
        public int getAvailable() { return available; }
        public void setAvailable(int available) { this.available = available; }
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }
    }

    /**
     * Per-area / per-level availability data for signage displays.
     */
    public static class AreaAvailability {
        private String areaId;
        private String areaLabel;
        private int totalSlots;
        private int availableSlots;
        private int occupiedSlots;
        private int maintenanceSlots;
        private AreaStatus status;
        private String displayMessage;
        private List<SlotTypeAvailability> availabilityByType;

        public AreaAvailability() {}

        // Getters and Setters
        public String getAreaId() { return areaId; }
        public void setAreaId(String areaId) { this.areaId = areaId; }
        public String getAreaLabel() { return areaLabel; }
        public void setAreaLabel(String areaLabel) { this.areaLabel = areaLabel; }
        public int getTotalSlots() { return totalSlots; }
        public void setTotalSlots(int totalSlots) { this.totalSlots = totalSlots; }
        public int getAvailableSlots() { return availableSlots; }
        public void setAvailableSlots(int availableSlots) { this.availableSlots = availableSlots; }
        public int getOccupiedSlots() { return occupiedSlots; }
        public void setOccupiedSlots(int occupiedSlots) { this.occupiedSlots = occupiedSlots; }
        public int getMaintenanceSlots() { return maintenanceSlots; }
        public void setMaintenanceSlots(int maintenanceSlots) { this.maintenanceSlots = maintenanceSlots; }
        public AreaStatus getStatus() { return status; }
        public void setStatus(AreaStatus status) { this.status = status; }
        public String getDisplayMessage() { return displayMessage; }
        public void setDisplayMessage(String displayMessage) { this.displayMessage = displayMessage; }
        public List<SlotTypeAvailability> getAvailabilityByType() { return availabilityByType; }
        public void setAvailabilityByType(List<SlotTypeAvailability> availabilityByType) { this.availabilityByType = availabilityByType; }
    }

    /**
     * Directional message for entrance signage displays.
     */
    public static class DirectionalMessage {
        private Instant timestamp;
        private String primaryMessage;
        private String secondaryMessage;
        private String suggestedArea;
        private int spotsAvailable;

        public DirectionalMessage() {}

        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
        public String getPrimaryMessage() { return primaryMessage; }
        public void setPrimaryMessage(String primaryMessage) { this.primaryMessage = primaryMessage; }
        public String getSecondaryMessage() { return secondaryMessage; }
        public void setSecondaryMessage(String secondaryMessage) { this.secondaryMessage = secondaryMessage; }
        public String getSuggestedArea() { return suggestedArea; }
        public void setSuggestedArea(String suggestedArea) { this.suggestedArea = suggestedArea; }
        public int getSpotsAvailable() { return spotsAvailable; }
        public void setSpotsAvailable(int spotsAvailable) { this.spotsAvailable = spotsAvailable; }
    }

    // --- Main fields ---
    private String facilityName;
    private Instant timestamp;
    private long refreshIntervalMs;
    private int totalCapacity;
    private int totalAvailable;
    private int totalOccupied;
    private FacilityStatus overallStatus;
    private List<AreaAvailability> areas;

    public SignageData() {}

    // Getters and Setters
    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public long getRefreshIntervalMs() { return refreshIntervalMs; }
    public void setRefreshIntervalMs(long refreshIntervalMs) { this.refreshIntervalMs = refreshIntervalMs; }
    public int getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(int totalCapacity) { this.totalCapacity = totalCapacity; }
    public int getTotalAvailable() { return totalAvailable; }
    public void setTotalAvailable(int totalAvailable) { this.totalAvailable = totalAvailable; }
    public int getTotalOccupied() { return totalOccupied; }
    public void setTotalOccupied(int totalOccupied) { this.totalOccupied = totalOccupied; }
    public FacilityStatus getOverallStatus() { return overallStatus; }
    public void setOverallStatus(FacilityStatus overallStatus) { this.overallStatus = overallStatus; }
    public List<AreaAvailability> getAreas() { return areas; }
    public void setAreas(List<AreaAvailability> areas) { this.areas = areas; }
}
