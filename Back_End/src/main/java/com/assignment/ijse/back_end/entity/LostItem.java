package com.assignment.ijse.back_end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "lost_items")
public class LostItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName; // phone, wallet, etc.
    private String detailedDescription; // brand, model, unique marks
    private String imageUrl; // optional
    private LocalDateTime dateLost;
    private String locationLost;

    @ManyToOne
    private User owner;

    private LocalDateTime postedAt;

    @ManyToMany
    @JoinTable(
            name = "lost_item_categories",
            joinColumns = @JoinColumn(name = "lost_item_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories;

    @Column(nullable = false)
    private Boolean isClaimed = false; // default false

    @Column(nullable = false)
    private Boolean isActive = true; // default true

    @PrePersist
    protected void onCreate() {
        postedAt = LocalDateTime.now();
    }
}
