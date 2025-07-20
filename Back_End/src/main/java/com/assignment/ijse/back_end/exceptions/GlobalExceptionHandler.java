package com.assignment.ijse.back_end.exceptions;

import com.assignment.ijse.back_end.util.APIResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
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

}
