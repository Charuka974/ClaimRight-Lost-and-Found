package com.assignment.ijse.back_end.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    private String username;
    private String email;
    private String password;
    private String role; // "USER", "ADMIN"
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
