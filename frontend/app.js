
const form = document.getElementById("employee-form");

const employeeList = document.getElementById("employee-list");

const message = document.getElementById("message");


// Get all employees
async function loadEmployees() {

    try {

        const response = await fetch("/api/employees");

        if (!response.ok) {
            throw new Error("Unable to load employees");
        }

        const employees = await response.json();

        employeeList.innerHTML = "";

        employees.forEach(employee => {

            const div = document.createElement("div");

            div.className = "employee";

            const details = document.createElement("span");

            details.textContent =
                `${employee.name} - ${employee.role} (ID: ${employee.id})`;

            const button = document.createElement("button");

            button.textContent = "Delete";

            button.className = "delete";

            button.onclick = () => deleteEmployee(employee.id);

            div.appendChild(details);

            div.appendChild(button);

            employeeList.appendChild(div);

        });

        if (employees.length === 0) {
            employeeList.textContent = "No employees found.";
        }

    } catch (error) {

        employeeList.textContent = "Unable to load employees.";

        message.textContent = error.message;

    }

}


// Add employee
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;

    const role = document.getElementById("role").value;

    const employee = {
        name: name,
        role: role
    };

    try {

        const response = await fetch("/api/employees", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(employee)

        });

        if (!response.ok) {
            throw new Error("Unable to add employee");
        }

        message.textContent = "Employee added successfully!";

        form.reset();

        loadEmployees();

    } catch (error) {

        message.textContent = error.message;

    }

});


// Delete employee
async function deleteEmployee(id) {

    try {

        const response = await fetch(`/api/employees/${id}`, {

            method: "DELETE"

        });

        if (!response.ok) {
            throw new Error("Unable to delete employee");
        }

        message.textContent = "Employee deleted successfully!";

        loadEmployees();

    } catch (error) {

        message.textContent = error.message;

    }

}


// Load employees when page opens
loadEmployees();
