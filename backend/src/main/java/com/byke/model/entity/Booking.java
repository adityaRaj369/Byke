package com.byke.model.entity;

import com.byke.model.enums.BookingStatus;
import com.byke.model.enums.ServiceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "rider_id")
    private Rider rider;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType serviceType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;
    
    @Column(nullable = false)
    private String pickupAddress;
    
    @Column(nullable = false)
    private Double pickupLatitude;
    
    @Column(nullable = false)
    private Double pickupLongitude;
    
    private String dropAddress;
    private Double dropLatitude;
    private Double dropLongitude;
    
    @Column(length = 2000)
    private String errandDescription;
    
    @Column(length = 1000)
    private String errandItemsList;
    
    private Double estimatedBudget;
    
    private String parcelDescription;
    private String parcelWeight;
    private String recipientName;
    private String recipientPhone;
    
    private Double estimatedDistance;
    private Integer estimatedDuration;
    private Double estimatedFare;
    private Double finalFare;
    
    @Column(length = 4)
    private String verificationOtp;
    
    private Double userEnteredAmount;
    
    private Integer biddingWindowSeconds = 45;
    private LocalDateTime biddingStartTime;
    private LocalDateTime biddingEndTime;
    
    private LocalDateTime acceptedAt;
    private LocalDateTime riderArrivedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    
    private String vehicleType;
    
    private String cancellationReason;
    private String cancellationReasonDetail;
    
    private Integer userRating;
    private String userReview;
    private Integer riderRating;
    private String riderReview;
    
    @Column(length = 5000)
    private String routePolyline;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Explicit getters and setters to fix Lombok issues
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Rider getRider() { return rider; }
    public void setRider(Rider rider) { this.rider = rider; }
    
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    
    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }
    
    public Double getPickupLatitude() { return pickupLatitude; }
    public void setPickupLatitude(Double pickupLatitude) { this.pickupLatitude = pickupLatitude; }
    
    public Double getPickupLongitude() { return pickupLongitude; }
    public void setPickupLongitude(Double pickupLongitude) { this.pickupLongitude = pickupLongitude; }
    
    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
    
    public String getDropAddress() { return dropAddress; }
    public void setDropAddress(String dropAddress) { this.dropAddress = dropAddress; }
    
    public Double getDropLatitude() { return dropLatitude; }
    public void setDropLatitude(Double dropLatitude) { this.dropLatitude = dropLatitude; }
    
    public Double getDropLongitude() { return dropLongitude; }
    public void setDropLongitude(Double dropLongitude) { this.dropLongitude = dropLongitude; }
    
    public Double getEstimatedFare() { return estimatedFare; }
    public void setEstimatedFare(Double estimatedFare) { this.estimatedFare = estimatedFare; }
    
    public Double getFinalFare() { return finalFare; }
    public void setFinalFare(Double finalFare) { this.finalFare = finalFare; }
    
    public Double getUserEnteredAmount() { return userEnteredAmount; }
    public void setUserEnteredAmount(Double userEnteredAmount) { this.userEnteredAmount = userEnteredAmount; }
    
    public String getVerificationOtp() { return verificationOtp; }
    public void setVerificationOtp(String verificationOtp) { this.verificationOtp = verificationOtp; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }
    
    public LocalDateTime getRiderArrivedAt() { return riderArrivedAt; }
    public void setRiderArrivedAt(LocalDateTime riderArrivedAt) { this.riderArrivedAt = riderArrivedAt; }
    
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
}
