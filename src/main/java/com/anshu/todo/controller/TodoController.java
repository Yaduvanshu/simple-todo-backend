package com.anshu.todo.controller;

import com.anshu.todo.model.Todo;
import com.anshu.todo.service.TodoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    /**
     * Get all todos, with optional filtering by completed status.
     * GET /api/todos
     * GET /api/todos?completed=true
     */
    @GetMapping
    public ResponseEntity<List<Todo>> getAllTodos(@RequestParam(required = false) Boolean completed) {
        if (completed != null) {
            return ResponseEntity.ok(todoService.getTodosByCompletedStatus(completed));
        }
        return ResponseEntity.ok(todoService.getAllTodos());
    }

    /**
     * Search todos by keyword in title or description.
     * GET /api/todos/search?keyword={keyword}
     * GET /api/todos/search?query={query}
     * GET /api/todos/search?q={q}
     */
    @GetMapping("/search")
    public ResponseEntity<List<Todo>> searchTodos(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String q) {
        String searchTerm = keyword != null ? keyword : (query != null ? query : q);
        return ResponseEntity.ok(todoService.searchTodos(searchTerm));
    }

    /**
     * Get a specific todo by ID.
     * GET /api/todos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Todo> getTodoById(@PathVariable Long id) {
        return todoService.getTodoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new todo.
     * POST /api/todos
     */
    @PostMapping
    public ResponseEntity<Todo> createTodo(@RequestBody Todo todo) {
        if (todo.getTitle() == null || todo.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Todo created = todoService.createTodo(todo);
        return ResponseEntity.created(URI.create("/api/todos/" + created.getId())).body(created);
    }

    /**
     * Update an existing todo by ID.
     * PUT /api/todos/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todo) {
        return todoService.updateTodo(id, todo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Toggle completed status of a todo.
     * PATCH /api/todos/{id}/toggle
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Todo> toggleTodoStatus(@PathVariable Long id) {
        return todoService.toggleTodoStatus(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a todo by ID.
     * DELETE /api/todos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        boolean deleted = todoService.deleteTodo(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
