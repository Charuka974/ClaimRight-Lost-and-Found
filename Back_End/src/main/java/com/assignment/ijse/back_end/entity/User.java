package com.assignment.ijse.back_end.entity;

import com.assignment.ijse.back_end.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder // for custom constructors
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String username;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role; // "USER", "ADMIN", "SEMI_ADMIN"

    private String phoneNumber;

    private LocalDateTime createdAt;

    private String profilePictureUrl;
    private boolean isActive;

    @OneToMany(mappedBy = "owner")
    private List<LostItem> items;

    @OneToMany(mappedBy = "finder")
    private List<FoundItem> foundItems;

    @OneToMany(mappedBy = "claimant")
    private List<Claim> claims;

    @OneToMany(mappedBy = "verifier")
    private List<ClaimVerification> verifications;


    @OneToMany(mappedBy = "payer")
    private List<Payment> paymentsMade;  // payments this user has made

    @OneToMany(mappedBy = "receiver")
    private List<Payment> paymentsReceived;  // payments this user has received


}
