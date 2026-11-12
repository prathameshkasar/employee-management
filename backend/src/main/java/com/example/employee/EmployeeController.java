
package com.example.employee;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final ConcurrentHashMap<Long, Employee> employees =
            new ConcurrentHashMap<>();

    private final AtomicLong nextId = new AtomicLong(1);

    public EmployeeController() {

        addEmployee("Asha Patel", "DevOps Engineer");

        addEmployee("Rahul Sharma", "Java Developer");

    }

    // Get all employees
    @GetMapping
    public List<Employee> getEmployees() {

        return employees.values()
                .stream()
                .sorted(Comparator.comparing(Employee::id))
                .toList();

    }

    // Add a new employee
    @PostMapping
    public Employee createEmployee(@RequestBody EmployeeRequest request) {

        if (request.name() == null || request.name().isBlank()
                || request.role() == null || request.role().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Both name and role are required"
            );

        }

        return addEmployee(request.name().trim(), request.role().trim());

    }

    // Delete employee
    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable Long id) {

        if (employees.remove(id) == null) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Employee not found: " + id
            );

        }

    }

    private Employee addEmployee(String name, String role) {

        long id = nextId.getAndIncrement();

        Employee employee = new Employee(id, name, role);

        employees.put(id, employee);

        return employee;

    }

    public record EmployeeRequest(String name, String role) {

    }

}
