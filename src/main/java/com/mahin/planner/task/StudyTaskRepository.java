package com.mahin.planner.task;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface StudyTaskRepository extends MongoRepository<StudyTask, String> {
    List<StudyTask> findByDateBetweenOrderByDateAscStartTimeAsc(LocalDate start, LocalDate end);
}

