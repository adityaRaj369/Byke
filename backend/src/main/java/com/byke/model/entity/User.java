package com.byke.model.entity;

import com.byke.model.enums.AccountStatus;
import com.byke.model.enums.UserRole;
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
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String mobileNumber;
    
    @Column(nullable = false)
    private String fullName;
    
    private String profilePhotoUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;
    
    private String homeAddress;
    private String workAddress;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer totalBookings = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Double averageRatingGiven = 0.0;
    
    @Column(nullable = false)
    @Builder.Default
    private Double averageRatingReceived = 0.0;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean notificationsEnabled = true;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
