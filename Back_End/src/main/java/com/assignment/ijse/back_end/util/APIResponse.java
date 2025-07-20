package com.assignment.ijse.back_end.util;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class APIResponse<T>{
    private int status;
    private String message;
    private T data;

}
