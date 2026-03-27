package parkflow;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Represents a Pricing Configuration in the ParkFlow system.
 * Defines billing rates for different vehicle and billing types.
 */
public class PricingConfig {

    // ---- Attributes ----
    private String id;
    private VehicleType vehicleType;
    private BillingType billingType;
    private BigDecimal hourlyRate;
    private BigDecimal dayPassRate;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ---- Constructors ----
    public PricingConfig() {
        this.isActive = true;
        this.hourlyRate = BigDecimal.ZERO;
        this.dayPassRate = BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public PricingConfig(String id, VehicleType vehicleType, BillingType billingType,
                         BigDecimal hourlyRate, BigDecimal dayPassRate) {
        this();
        this.id = id;
        this.vehicleType = vehicleType;
        this.billingType = billingType;
        this.hourlyRate = hourlyRate;
        this.dayPassRate = dayPassRate;
    }

    // ---- Operations (from Class Diagram) ----

    /**
     * Retrieves the active billing configuration.
     */
    public PricingConfig getBillingConfig() {
        // Fetch active pricing config from database
        return this;
    }

    /**
     * Calculates the billing amount based on entry time, exit time, and billing type.
     */
    public BigDecimal calculateBilling(LocalDateTime entryTime, LocalDateTime exitTime, BillingType type) {
        if (type == BillingType.DAY_PASS) {
            return this.dayPassRate;
        }

        // HOURLY billing: calculate hours and multiply by hourly rate
        Duration duration = Duration.between(entryTime, exitTime);
        long hours = duration.toHours();
        if (duration.toMinutes() % 60 > 0) {
            hours++; // Round up to next hour
        }
        if (hours < 1) {
            hours = 1; // Minimum 1 hour charge
        }

        return this.hourlyRate.multiply(BigDecimal.valueOf(hours));
    }

    // ---- Getters and Setters ----

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
    }

    public BillingType getBillingType() {
        return billingType;
    }

    public void setBillingType(BillingType billingType) {
        this.billingType = billingType;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public BigDecimal getDayPassRate() {
        return dayPassRate;
    }

    public void setDayPassRate(BigDecimal dayPassRate) {
        this.dayPassRate = dayPassRate;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
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

    @Override
    public String toString() {
        return "PricingConfig{id='" + id + "', vehicleType=" + vehicleType + ", billingType=" + billingType +
               ", hourlyRate=" + hourlyRate + ", dayPassRate=" + dayPassRate + ", isActive=" + isActive + "}";
    }
}
