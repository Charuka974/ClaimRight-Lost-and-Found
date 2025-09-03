package com.assignment.ijse.back_end.exceptions;

import com.assignment.ijse.back_end.util.APIResponse;
import io.jsonwebtoken.ExpiredJwtException;
import org.apache.http.auth.InvalidCredentialsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<APIResponse<String>>
    handleGenericException(Exception ex){
        return new ResponseEntity<>(new APIResponse<>(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ex.getMessage(),
                null)
                ,HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ResourceNotFound.class)
    public ResponseEntity<APIResponse<String>>
    handleResourceNotFound(ResourceNotFound e){
        return new ResponseEntity<>(new APIResponse<>(
                HttpStatus.NOT_FOUND.value(),
                e.getMessage(),
                null),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse<Object>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        return new ResponseEntity<>(new APIResponse<>(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                errors),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public APIResponse handleUsernameNotFoundException(UsernameNotFoundException ex) {
        return new APIResponse(
                404,
                "User not found",
                ex.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public APIResponse handleBadCredentialsException(BadCredentialsException ex) {
        return new APIResponse(
                401,
                "Invalid credentials",
                "Invalid username or password");
    }

    @ExceptionHandler(ExpiredJwtException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public APIResponse handleExpiredJwtException(ExpiredJwtException ex) {
        return new APIResponse(
                401,
                "Token expired",
                "Your session has expired, please log in again");
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public APIResponse handleRuntimeException(RuntimeException ex) {
        return new APIResponse(
                500,
                "Internal Server Error",
                ex.getMessage());
    }

//    @ExceptionHandler(StorageException.class)
//    public ResponseEntity<String> handleStorageException(StorageException ex) {
//        // You can customize the response body as needed
//        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                .body("Storage error: " + ex.getMessage());
//    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<APIResponse<Object>> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new APIResponse<>(400, "Incorrect email or password", null));
    }

}
