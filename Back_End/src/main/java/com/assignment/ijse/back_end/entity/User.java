package com.assignment.ijse.back_end.entity;

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
    private UserRole role; // "USER", "ADMIN"

    private String phoneNumber;
    private LocalDateTime createdAt;
    private String profilePictureUrl;
    private boolean isActive;

    @OneToMany(mappedBy = "user")
    private List<Item> items;

    @OneToMany(mappedBy = "claimant")
    private List<Claim> claims;

    @OneToMany(mappedBy = "verifier")
    private List<ClaimVerification> verifications;

}
