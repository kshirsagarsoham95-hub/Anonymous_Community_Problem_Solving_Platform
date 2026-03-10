package com.project.anonymousplatform.repository;

import com.project.anonymousplatform.entity.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResponseRepository extends JpaRepository<Response, Long> {

    List<Response> findByProblemId(Long problemId);

}