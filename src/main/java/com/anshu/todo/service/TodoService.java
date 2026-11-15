package com.anshu.todo.service;

import com.anshu.todo.model.Todo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class TodoService {

    // In-memory list to store todos (no database used)
    private final List<Todo> todos = new CopyOnWriteArrayList<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    public List<Todo> getAllTodos() {
        return new ArrayList<>(todos);
    }

    public Optional<Todo> getTodoById(Long id) {
        return todos.stream()
                .filter(todo -> todo.getId().equals(id))
                .findFirst();
    }

    public List<Todo> getTodosByCompletedStatus(boolean completed) {
        return todos.stream()
                .filter(todo -> todo.isCompleted() == completed)
                .collect(Collectors.toList());
    }

    public Todo createTodo(Todo todo) {
        long nextId = idCounter.getAndIncrement();
        todo.setId(nextId);
        LocalDateTime now = LocalDateTime.now();
        todo.setCreatedAt(now);
        todo.setUpdatedAt(now);
        todos.add(todo);
        return todo;
    }

    public Optional<Todo> updateTodo(Long id, Todo updatedTodo) {
        return getTodoById(id).map(existingTodo -> {
            if (updatedTodo.getTitle() != null) {
                existingTodo.setTitle(updatedTodo.getTitle());
            }
            if (updatedTodo.getDescription() != null) {
                existingTodo.setDescription(updatedTodo.getDescription());
            }
            existingTodo.setCompleted(updatedTodo.isCompleted());
            existingTodo.setUpdatedAt(LocalDateTime.now());
            return existingTodo;
        });
    }

    public Optional<Todo> toggleTodoStatus(Long id) {
        return getTodoById(id).map(existingTodo -> {
            existingTodo.setCompleted(!existingTodo.isCompleted());
            existingTodo.setUpdatedAt(LocalDateTime.now());
            return existingTodo;
        });
    }

    public boolean deleteTodo(Long id) {
        return todos.removeIf(todo -> todo.getId().equals(id));
    }

    public void clearAllTodos() {
        todos.clear();
    }
}
