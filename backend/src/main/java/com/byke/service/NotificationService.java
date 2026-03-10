package com.byke.service;

import com.byke.model.entity.Booking;
import com.byke.model.entity.Notification;
import com.byke.model.entity.User;
import com.byke.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Notification createNotification(Long userId, String title, String message, 
                                           String type, Long bookingId) {
        User user = userService.getUserById(userId);
        
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .build();

        if (bookingId != null) {
            Booking booking = new Booking();
            booking.setId(bookingId);
            notification.setBooking(booking);
        }

        Notification savedNotification = notificationRepository.save(notification);
        
        messagingTemplate.convertAndSend("/topic/user/" + userId + "/notifications", savedNotification);
        
        log.info("Notification created for user {}: {}", userId, title);
        return savedNotification;
    }

    public void notifyUser(Long userId, String title, String message) {
        createNotification(userId, title, message, "BOOKING", null);
    }

    public void notifyRider(Long riderId, String title, String message) {
        createNotification(riderId, title, message, "BOOKING", null);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
        
        log.info("Marked {} notifications as read for user {}", unreadNotifications.size(), userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
