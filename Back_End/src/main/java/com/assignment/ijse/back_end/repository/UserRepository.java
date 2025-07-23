package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    List<User> findUserByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String username, String email);

    @Transactional
    @Modifying
    @Query(value = "UPDATE users SET is_active = false WHERE user_id = ?1", nativeQuery = true)
    void deactivateUserById(int userId);

    @Transactional
    @Modifying
    @Query(value = "UPDATE users SET is_active = true WHERE user_id = ?1", nativeQuery = true)
    void activateUserById(int userId);

    // Optional: find by email or username
    Optional<User> findByEmail(String email);

//    User findByUsername(String username);

    Optional<User> findByUsername(String username);
}
