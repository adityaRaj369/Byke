package com.byke.service;

import com.byke.model.entity.Payment;
import com.byke.model.entity.Rider;
import com.byke.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.model.Subscription;
import com.stripe.param.SubscriptionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RiderService riderService;

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Value("${stripe.subscription-price-id}")
    private String subscriptionPriceId;

    @Value("${app.subscription.amount}")
    private Double subscriptionAmount;

    @Transactional
    public Payment createSubscription(Long riderId, String stripeCustomerId) {
        Rider rider = riderService.getRiderById(riderId);
        
        try {
            Stripe.apiKey = stripeApiKey;

            SubscriptionCreateParams params = SubscriptionCreateParams.builder()
                    .setCustomer(stripeCustomerId)
                    .addItem(SubscriptionCreateParams.Item.builder()
                            .setPrice(subscriptionPriceId)
                            .build())
                    .build();

            Subscription subscription = Subscription.create(params);

            LocalDateTime periodStart = LocalDateTime.ofInstant(
                    java.time.Instant.ofEpochSecond(subscription.getCurrentPeriodStart()),
                    ZoneId.systemDefault());
            
            LocalDateTime periodEnd = LocalDateTime.ofInstant(
                    java.time.Instant.ofEpochSecond(subscription.getCurrentPeriodEnd()),
                    ZoneId.systemDefault());

            Payment payment = Payment.builder()
                    .rider(rider)
                    .amount(subscriptionAmount)
                    .paymentMethod("STRIPE")
                    .transactionId(subscription.getId())
                    .stripeSubscriptionId(subscription.getId())
                    .stripeCustomerId(stripeCustomerId)
                    .status("ACTIVE")
                    .periodStart(periodStart)
                    .periodEnd(periodEnd)
                    .build();

            Payment savedPayment = paymentRepository.save(payment);

            riderService.activateSubscription(riderId, periodStart, periodEnd);

            log.info("Subscription created for rider {}: {}", riderId, subscription.getId());
            return savedPayment;

        } catch (Exception e) {
            log.error("Failed to create subscription for rider {}: {}", riderId, e.getMessage());
            throw new RuntimeException("Failed to create subscription: " + e.getMessage());
        }
    }

    public List<Payment> getRiderPayments(Long riderId) {
        return paymentRepository.findByRiderId(riderId);
    }

    public List<Payment> getFailedPayments() {
        return paymentRepository.findByStatus("FAILED");
    }

    @Transactional
    public void handleSubscriptionRenewal(String stripeSubscriptionId, String status) {
        Payment payment = paymentRepository.findAll().stream()
                .filter(p -> stripeSubscriptionId.equals(p.getStripeSubscriptionId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Payment not found for subscription"));

        if ("active".equals(status)) {
            LocalDateTime newPeriodEnd = payment.getPeriodEnd().plusMonths(1);
            
            Payment newPayment = Payment.builder()
                    .rider(payment.getRider())
                    .amount(subscriptionAmount)
                    .paymentMethod("STRIPE")
                    .transactionId(stripeSubscriptionId)
                    .stripeSubscriptionId(stripeSubscriptionId)
                    .stripeCustomerId(payment.getStripeCustomerId())
                    .status("ACTIVE")
                    .periodStart(payment.getPeriodEnd())
                    .periodEnd(newPeriodEnd)
                    .build();

            paymentRepository.save(newPayment);

            riderService.activateSubscription(
                    payment.getRider().getId(),
                    payment.getPeriodEnd(),
                    newPeriodEnd);

            log.info("Subscription renewed for rider {}", payment.getRider().getId());
        } else {
            payment.setStatus("FAILED");
            payment.setFailureReason("Renewal failed");
            paymentRepository.save(payment);

            riderService.deactivateSubscription(payment.getRider().getId());

            log.warn("Subscription renewal failed for rider {}", payment.getRider().getId());
        }
    }

    public long getTotalRevenueToday() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        
        return paymentRepository.findByCreatedAtBetween(startOfDay, endOfDay).stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .mapToLong(p -> p.getAmount().longValue())
                .sum();
    }
}
