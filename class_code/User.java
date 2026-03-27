package parkflow;

import java.time.LocalDateTime;

/**
 * Represents a User (Operator/Admin) in the ParkFlow system.
 * Handles authentication and user management.
 */
public class User {

    // ---- Attributes ----
    private String id;
    private String email;
    private String role;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ---- Constructors ----
    public User() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
    }

    public User(String id, String email, String role) {
        this();
        this.id = id;
        this.email = email;
        this.role = role;
    }

    // ---- Operations (from Class Diagram) ----

    /**
     * Registers a new user with the given email.
     */
    public User register(String email) {
        this.email = email;
        this.role = "OPERATOR";
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
        return this;
    }

    /**
     * Logs in the user by verifying OTP.
     */
    public String login(String email, String otp) {
        // Verify OTP and generate JWT token
        return "jwt-token-placeholder";
    }

    /**
     * Logs out the user and invalidates the session.
     */
    public void logout() {
        // Invalidate JWT token / clear cookie
    }

    /**
     * Retrieves a user by their unique ID.
     */
    public User getUserById(String id) {
        // Fetch user from database by ID
        return this;
    }

    // ---- Getters and Setters ----

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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
        return "User{id='" + id + "', email='" + email + "', role='" + role + "', isActive=" + isActive + "}";
    }
}
