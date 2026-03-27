import java.math.BigDecimal;
import java.time.Instant;

/**
 * Represents a user's subscription for loyalty and subscription management.
 */
public class Subscription {

    private String id;
    private String userId;
    private SubscriptionTier tier;
    private SubscriptionStatus status;
    private Instant startDate;
    private Instant endDate;
    private int loyaltyPoints;
    private BigDecimal totalSpent;
    private Instant createdAt;
    private Instant updatedAt;

    // Relationships
    private User user;

    public Subscription() {
        this.status = SubscriptionStatus.ACTIVE;
        this.loyaltyPoints = 0;
        this.totalSpent = BigDecimal.ZERO;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public SubscriptionTier getTier() { return tier; }
    public void setTier(SubscriptionTier tier) { this.tier = tier; }
    public SubscriptionStatus getStatus() { return status; }
    public void setStatus(SubscriptionStatus status) { this.status = status; }
    public Instant getStartDate() { return startDate; }
    public void setStartDate(Instant startDate) { this.startDate = startDate; }
    public Instant getEndDate() { return endDate; }
    public void setEndDate(Instant endDate) { this.endDate = endDate; }
    public int getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
    public BigDecimal getTotalSpent() { return totalSpent; }
    public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // Nested enums
    public enum SubscriptionStatus {
        ACTIVE, EXPIRED, CANCELLED
    }
}
