package com.project.anonymousplatform.repository;
import com.project.anonymousplatform.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemRepository extends JpaRepository<Problem, Long> {


}