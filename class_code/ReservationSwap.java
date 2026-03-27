import java.math.BigDecimal;
import java.time.Instant;

/**
 * Represents a reservation swap listing on the secondary market.
 * Users can list their parking reservations for other users to claim.
 */
public class ReservationSwap {

    private String id;
    private String originalUserId;
    private String claimedByUserId;
    private String sessionId;
    private String slotId;
    private BigDecimal originalPrice;
    private BigDecimal listingPrice;
    private ReservationSwapStatus status;
    private Instant listedAt;
    private Instant claimedAt;
    private Instant expiresAt;
    private Instant createdAt;
    private Instant updatedAt;

    public ReservationSwap() {
        this.status = ReservationSwapStatus.LISTED;
        this.listedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOriginalUserId() { return originalUserId; }
    public void setOriginalUserId(String originalUserId) { this.originalUserId = originalUserId; }
    public String getClaimedByUserId() { return claimedByUserId; }
    public void setClaimedByUserId(String claimedByUserId) { this.claimedByUserId = claimedByUserId; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }
    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }
    public BigDecimal getListingPrice() { return listingPrice; }
    public void setListingPrice(BigDecimal listingPrice) { this.listingPrice = listingPrice; }
    public ReservationSwapStatus getStatus() { return status; }
    public void setStatus(ReservationSwapStatus status) { this.status = status; }
    public Instant getListedAt() { return listedAt; }
    public void setListedAt(Instant listedAt) { this.listedAt = listedAt; }
    public Instant getClaimedAt() { return claimedAt; }
    public void setClaimedAt(Instant claimedAt) { this.claimedAt = claimedAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
