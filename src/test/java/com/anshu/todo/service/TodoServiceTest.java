package com.anshu.todo.service;

import com.anshu.todo.model.Todo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class TodoServiceTest {

    private TodoService todoService;

    @BeforeEach
    void setUp() {
        todoService = new TodoService();
        todoService.clearAllTodos();
    }

    @Test
    void testInitialDummyData() {
        TodoService freshService = new TodoService();
        List<Todo> initialTodos = freshService.getAllTodos();
        assertEquals(3, initialTodos.size());
        assertEquals("Learn Docker & Containerization", initialTodos.get(0).getTitle());
        assertTrue(initialTodos.get(0).isCompleted());
    }

    @Test
    void testCreateTodo() {
        Todo todo = new Todo();
        todo.setTitle("Buy Groceries");
        todo.setDescription("Milk, Eggs, Bread");
        todo.setCompleted(false);

        Todo created = todoService.createTodo(todo);

        assertNotNull(created.getId());
        assertEquals("Buy Groceries", created.getTitle());
        assertEquals("Milk, Eggs, Bread", created.getDescription());
        assertFalse(created.isCompleted());
        assertNotNull(created.getCreatedAt());
        assertNotNull(created.getUpdatedAt());
    }

    @Test
    void testGetAllTodos() {
        Todo t1 = new Todo(null, "Task 1", "Desc 1", false);
        Todo t2 = new Todo(null, "Task 2", "Desc 2", true);

        todoService.createTodo(t1);
        todoService.createTodo(t2);

        List<Todo> allTodos = todoService.getAllTodos();
        assertEquals(2, allTodos.size());
    }

    @Test
    void testGetTodoById() {
        Todo t1 = new Todo(null, "Task 1", "Desc 1", false);
        Todo created = todoService.createTodo(t1);

        Optional<Todo> found = todoService.getTodoById(created.getId());
        assertTrue(found.isPresent());
        assertEquals("Task 1", found.get().getTitle());

        Optional<Todo> notFound = todoService.getTodoById(999L);
        assertFalse(notFound.isPresent());
    }

    @Test
    void testGetTodosByCompletedStatus() {
        Todo t1 = new Todo(null, "Task 1", "Desc 1", false);
        Todo t2 = new Todo(null, "Task 2", "Desc 2", true);
        Todo t3 = new Todo(null, "Task 3", "Desc 3", true);

        todoService.createTodo(t1);
        todoService.createTodo(t2);
        todoService.createTodo(t3);

        List<Todo> completed = todoService.getTodosByCompletedStatus(true);
        assertEquals(2, completed.size());

        List<Todo> pending = todoService.getTodosByCompletedStatus(false);
        assertEquals(1, pending.size());
    }

    @Test
    void testUpdateTodo() {
        Todo t1 = new Todo(null, "Original Title", "Original Desc", false);
        Todo created = todoService.createTodo(t1);

        Todo updatePayload = new Todo();
        updatePayload.setTitle("Updated Title");
        updatePayload.setDescription("Updated Desc");
        updatePayload.setCompleted(true);

        Optional<Todo> updated = todoService.updateTodo(created.getId(), updatePayload);
        assertTrue(updated.isPresent());
        assertEquals("Updated Title", updated.get().getTitle());
        assertEquals("Updated Desc", updated.get().getDescription());
        assertTrue(updated.get().isCompleted());

        Optional<Todo> updateNotFound = todoService.updateTodo(999L, updatePayload);
        assertFalse(updateNotFound.isPresent());
    }

    @Test
    void testToggleTodoStatus() {
        Todo t1 = new Todo(null, "Task 1", "Desc 1", false);
        Todo created = todoService.createTodo(t1);

        Optional<Todo> toggled = todoService.toggleTodoStatus(created.getId());
        assertTrue(toggled.isPresent());
        assertTrue(toggled.get().isCompleted());

        Optional<Todo> toggledAgain = todoService.toggleTodoStatus(created.getId());
        assertTrue(toggledAgain.isPresent());
        assertFalse(toggledAgain.get().isCompleted());
    }

    @Test
    void testDeleteTodo() {
        Todo t1 = new Todo(null, "Task 1", "Desc 1", false);
        Todo created = todoService.createTodo(t1);

        boolean deleted = todoService.deleteTodo(created.getId());
        assertTrue(deleted);
        assertEquals(0, todoService.getAllTodos().size());

        boolean deleteAgain = todoService.deleteTodo(created.getId());
        assertFalse(deleteAgain);
    }
}
