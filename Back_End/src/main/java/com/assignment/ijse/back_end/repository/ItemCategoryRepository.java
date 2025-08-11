package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemCategoryRepository extends JpaRepository<Category, Long> {


}
