package com.project.anonymousplatform.controller;

import com.project.anonymousplatform.entity.Response;
import com.project.anonymousplatform.service.ResponseService;

import org.springframework.web.bind.annotation.*;

import java.util.List;




@RestController
@RequestMapping("/responses")
public class ResponseController {

    private final ResponseService responseService;

    public ResponseController(ResponseService responseService) {
        this.responseService = responseService;
    }

    @PostMapping
    public Response createResponse(@RequestBody Response response) {
        return responseService.createResponse(response);
    }

    @GetMapping
    public List<Response> getAllResponses() {
        return responseService.getAllResponses();
    }

    @GetMapping("/problem/{problemId}")
    public List<Response> getResponsesByProblem(@PathVariable Long problemId) {
        return responseService.getResponsesByProblem(problemId);
    }
}