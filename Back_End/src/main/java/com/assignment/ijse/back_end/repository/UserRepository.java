package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findUserByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String username, String email);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.isActive = false WHERE u.userId = :userId")
    void deactivateUserById(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.isActive = true WHERE u.userId = :userId")
    void activateUserById(@Param("userId") Long userId);



    // Optional: find by email or username
    Optional<User> findByEmail(String email);

//    User findByUsername(String username);

    Optional<User> findByUsername(String username);
}
