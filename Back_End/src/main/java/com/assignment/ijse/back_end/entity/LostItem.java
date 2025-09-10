package com.assignment.ijse.back_end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
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

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
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

    @Column(nullable = true, precision = 10, scale = 2)
    private BigDecimal reward;

    @Column(nullable = false)
    private Integer priority = 0; // 0 = low, 1 = medium, 2 = high

//    @PrePersist
//    protected void onCreate() {
//        postedAt = LocalDateTime.now();
//    }

    @OneToMany(mappedBy = "lostItem")
    private List<Payment> payments;  // payments linked to this lost item (e.g. rewards or priority boosts)


}
