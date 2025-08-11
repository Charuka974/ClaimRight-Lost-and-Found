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
@Table(name = "found_items")
public class FoundItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;
    private String generalDescription; // vague info
    private String imageUrl; // optional
    private LocalDateTime dateFound;
    private String locationFound;
    private String privateIdentifierHint; // e.g., "Has a sticker on the back"

    @ManyToOne
    private User finder;

    private LocalDateTime postedAt;

    @ManyToMany
    @JoinTable(
            name = "found_item_categories",
            joinColumns = @JoinColumn(name = "found_item_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories;

    @Column(nullable = false)
    private Boolean isClaimed = false; // default false

    @PrePersist
    protected void onCreate() {
        postedAt = LocalDateTime.now();
    }
}
