package com.project.anonymousplatform.service;

import com.project.anonymousplatform.entity.Response;
import com.project.anonymousplatform.repository.ResponseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResponseService {

    private final ResponseRepository responseRepository;

    public ResponseService(ResponseRepository responseRepository) {
        this.responseRepository = responseRepository;
    }

    public Response createResponse(Response response) {
        return responseRepository.save(response);
    }

    public List<Response> getAllResponses() {
        return responseRepository.findAll();
    }

    public List<Response> getResponsesByProblem(Long problemId) {
        return responseRepository.findByProblemId(problemId);
    }
}