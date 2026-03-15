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
}
