package com.project.backend_api.dto;

public record LoginRequest(String usernameOrEmail, String password) {
}
