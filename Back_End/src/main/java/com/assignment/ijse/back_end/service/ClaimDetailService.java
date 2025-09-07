package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.ClaimViewDTO;

import java.util.List;

public interface ClaimDetailService {

    public List<ClaimViewDTO> getClaimsForUser(Long userId);

}
