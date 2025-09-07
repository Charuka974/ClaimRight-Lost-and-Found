package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.Claim;
import com.assignment.ijse.back_end.entity.Proof;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProofRepository extends JpaRepository<Proof, Long> {

    List<Proof> findByClaim(Claim claim);

}
