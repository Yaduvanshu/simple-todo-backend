package com.anshu.todo.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class RootControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        RootController rootController = new RootController();
        mockMvc = MockMvcBuilders.standaloneSetup(rootController).build();
    }

    @Test
    void testRootEndpoint() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"))
                .andExpect(jsonPath("$.message").value("Todo API is running smoothly"))
                .andExpect(jsonPath("$.endpoints.todos").value("/api/todos"));
    }

    @Test
    void testRootEndpointHtml() throws Exception {
        mockMvc.perform(get("/").accept(MediaType.TEXT_HTML))
                .andExpect(status().isOk())
                .andExpect(view().name("index"))
                .andExpect(model().attributeExists("todos"))
                .andExpect(model().attributeExists("totalCount"))
                .andExpect(model().attributeExists("completedCount"))
                .andExpect(model().attributeExists("pendingCount"));
    }

    @Test
    void testApiEndpoint() throws Exception {
        mockMvc.perform(get("/api"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"));
    }
}
