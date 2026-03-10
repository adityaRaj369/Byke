package com.byke.controller;

import com.byke.model.entity.Rider;
import com.byke.model.enums.BookingStatus;
import com.byke.model.enums.RiderStatus;
import com.byke.model.enums.UserRole;
import com.byke.service.BookingService;
import com.byke.service.PaymentService;
import com.byke.service.RiderService;
import com.byke.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final RiderService riderService;
    private final UserService userService;
    private final BookingService bookingService;
    private final PaymentService paymentService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", userService.getTotalUserCount());
            stats.put("totalRiders", userService.getUserCountByRole(UserRole.RIDER));
            stats.put("activeRiders", riderService.getRiderCountByStatus(RiderStatus.ACTIVE));
            stats.put("pendingRiders", riderService.getRiderCountByStatus(RiderStatus.PENDING));
            stats.put("todayBookings", bookingService.getTotalBookingsToday());
            stats.put("activeBookings", bookingService.getBookingCountByStatus(BookingStatus.IN_PROGRESS));
            stats.put("todayRevenue", paymentService.getTotalRevenueToday());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/riders/pending")
    public ResponseEntity<?> getPendingRiders() {
        try {
            List<Rider> riders = riderService.getPendingRiders();
            return ResponseEntity.ok(riders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/riders/{riderId}/approve")
    public ResponseEntity<?> approveRider(@PathVariable Long riderId) {
        try {
            Rider rider = riderService.approveRider(riderId);
            return ResponseEntity.ok(rider);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/riders/{riderId}/reject")
    public ResponseEntity<?> rejectRider(@PathVariable Long riderId, @RequestParam String reason) {
        try {
            Rider rider = riderService.rejectRider(riderId, reason);
            return ResponseEntity.ok(rider);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/riders/active")
    public ResponseEntity<?> getActiveRiders() {
        try {
            List<Rider> riders = riderService.getActiveRiders();
            return ResponseEntity.ok(riders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/bookings/active")
    public ResponseEntity<?> getActiveBookings() {
        try {
            return ResponseEntity.ok(bookingService.getActiveBookings());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
