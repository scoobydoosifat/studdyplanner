package com.mahin.planner.task;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(String id) {
        super("Study task " + id + " was not found");
    }
}

