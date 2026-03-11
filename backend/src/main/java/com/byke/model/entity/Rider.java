package com.byke.model.entity;

import com.byke.model.enums.RiderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "riders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Rider {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    private LocalDate dateOfBirth;
    private String gender;
    private String homeAddress;
    
    private String vehicleType;
    private String vehicleMake;
    private String vehicleModel;
    private Integer vehicleYear;
    private String vehicleRegistrationNumber;
    private String vehicleColor;
    
    private String drivingLicenseUrl;
    private String aadharCardUrl;
    private String panCardUrl;
    private String vehicleRcUrl;
    private String vehicleInsuranceUrl;
    private String vehiclePucUrl;
    private String vehiclePhotoUrl;
    private String selfieWithVehicleUrl;
    
    private String bankAccountNumber;
    private String bankIfscCode;
    private String bankAccountHolderName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RiderStatus status = RiderStatus.PENDING;
    
    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;
    @Builder.Default
    private Boolean subscriptionActive = false;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer totalRides = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Double averageRating = 0.0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer totalRatings = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer cancellationCount = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Double acceptanceRate = 100.0;
    
    private Double currentLatitude;
    private Double currentLongitude;
    private LocalDateTime lastLocationUpdate;
    
    private String rejectionReason;
    private String suspensionReason;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
