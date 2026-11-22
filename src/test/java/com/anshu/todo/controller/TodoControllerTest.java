package com.anshu.todo.controller;

import com.anshu.todo.model.Todo;
import com.anshu.todo.service.TodoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TodoControllerTest {

    private MockMvc mockMvc;
    private TodoService todoService;

    @BeforeEach
    void setUp() {
        todoService = Mockito.mock(TodoService.class);
        TodoController todoController = new TodoController(todoService);
        mockMvc = MockMvcBuilders.standaloneSetup(todoController).build();
    }

    @Test
    void testGetAllTodos() throws Exception {
        Todo todo1 = new Todo(1L, "Task 1", "Desc 1", false);
        Todo todo2 = new Todo(2L, "Task 2", "Desc 2", true);
        when(todoService.getAllTodos()).thenReturn(Arrays.asList(todo1, todo2));

        mockMvc.perform(get("/api/todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Task 1"))
                .andExpect(jsonPath("$[1].title").value("Task 2"));
    }

    @Test
    void testGetTodosFilteredByCompleted() throws Exception {
        Todo todo = new Todo(2L, "Task 2", "Desc 2", true);
        when(todoService.getTodosByCompletedStatus(true)).thenReturn(List.of(todo));

        mockMvc.perform(get("/api/todos").param("completed", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].completed").value(true));
    }

    @Test
    void testGetTodoByIdFound() throws Exception {
        Todo todo = new Todo(1L, "Task 1", "Desc 1", false);
        when(todoService.getTodoById(1L)).thenReturn(Optional.of(todo));

        mockMvc.perform(get("/api/todos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Task 1"));
    }

    @Test
    void testGetTodoByIdNotFound() throws Exception {
        when(todoService.getTodoById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/todos/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateTodoSuccess() throws Exception {
        Todo created = new Todo(1L, "New Task", "New Description", false);
        when(todoService.createTodo(any(Todo.class))).thenReturn(created);

        String jsonPayload = """
                {
                    "title": "New Task",
                    "description": "New Description",
                    "completed": false
                }
                """;

        mockMvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/todos/1"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("New Task"));
    }

    @Test
    void testCreateTodoBadRequestWhenTitleEmpty() throws Exception {
        String jsonPayload = """
                {
                    "title": "  ",
                    "description": "Description only"
                }
                """;

        mockMvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateTodoFound() throws Exception {
        Todo updated = new Todo(1L, "Updated Title", "Updated Desc", true);
        when(todoService.updateTodo(eq(1L), any(Todo.class))).thenReturn(Optional.of(updated));

        String jsonPayload = """
                {
                    "title": "Updated Title",
                    "description": "Updated Desc",
                    "completed": true
                }
                """;

        mockMvc.perform(put("/api/todos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.completed").value(true));
    }

    @Test
    void testUpdateTodoNotFound() throws Exception {
        when(todoService.updateTodo(eq(99L), any(Todo.class))).thenReturn(Optional.empty());

        String jsonPayload = """
                {
                    "title": "Updated Title"
                }
                """;

        mockMvc.perform(put("/api/todos/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isNotFound());
    }

    @Test
    void testToggleTodoStatusFound() throws Exception {
        Todo toggled = new Todo(1L, "Task 1", "Desc 1", true);
        when(todoService.toggleTodoStatus(1L)).thenReturn(Optional.of(toggled));

        mockMvc.perform(patch("/api/todos/1/toggle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true));
    }

    @Test
    void testToggleTodoStatusNotFound() throws Exception {
        when(todoService.toggleTodoStatus(99L)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/api/todos/99/toggle"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDeleteTodoFound() throws Exception {
        when(todoService.deleteTodo(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/todos/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testDeleteTodoNotFound() throws Exception {
        when(todoService.deleteTodo(99L)).thenReturn(false);

        mockMvc.perform(delete("/api/todos/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testSearchTodosWithKeyword() throws Exception {
        Todo todo1 = new Todo(1L, "Learn Docker", "Understand images and containers", true);
        when(todoService.searchTodos("docker")).thenReturn(List.of(todo1));

        mockMvc.perform(get("/api/todos/search").param("keyword", "docker"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Learn Docker"));
    }

    @Test
    void testSearchTodosWithQueryParam() throws Exception {
        Todo todo1 = new Todo(2L, "CI/CD Pipeline", "GitHub Actions workflow", false);
        when(todoService.searchTodos("pipeline")).thenReturn(List.of(todo1));

        mockMvc.perform(get("/api/todos/search").param("query", "pipeline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("CI/CD Pipeline"));
    }

    @Test
    void testSearchTodosEmptyKeyword() throws Exception {
        Todo todo1 = new Todo(1L, "Task 1", "Desc 1", false);
        Todo todo2 = new Todo(2L, "Task 2", "Desc 2", true);
        when(todoService.searchTodos(null)).thenReturn(List.of(todo1, todo2));

        mockMvc.perform(get("/api/todos/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
