package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.Claim;
import com.assignment.ijse.back_end.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

}
