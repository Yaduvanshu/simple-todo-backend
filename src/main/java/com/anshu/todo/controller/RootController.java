package com.anshu.todo.controller;

import com.anshu.todo.model.Todo;
import com.anshu.todo.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Controller
@CrossOrigin(origins = "*")
public class RootController {

    private final TodoService todoService;

    public RootController() {
        this.todoService = new TodoService();
    }

    @Autowired
    public RootController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String index(Model model) {
        List<Todo> todos = (todoService != null) ? todoService.getAllTodos() : List.of();
        model.addAttribute("todos", todos);
        long completedCount = todos.stream().filter(Todo::isCompleted).count();
        model.addAttribute("totalCount", todos.size());
        model.addAttribute("completedCount", completedCount);
        model.addAttribute("pendingCount", todos.size() - completedCount);
        return "index";
    }

    @GetMapping(value = {"/", "/api"}, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getRootStatus() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "OK");
        response.put("message", "Todo API is running smoothly");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now());
        response.put("endpoints", Map.of(
                "todos", "/api/todos",
                "search_todos", "/api/todos/search",
                "actuator_health", "/actuator/health"
        ));
        return ResponseEntity.ok(response);
    }
}
