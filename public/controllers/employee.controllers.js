import express from "express";
import Employee from "../model/model.js";
import { z } from "zod";


const employeeValidationSchema = z.object({
    name: z.string({
        message: "Employee name is required"
    }).min(3, {
        message: "Employee name must be at least 3 characters long"
    }).max(34),
    age: z.number({
        message: "Employee age is required"
    }).int().positive().min(18, {
        message: "Employee must be at least 18 years old"
    }),
    employmentStartDate: z.coerce.date({
        message: "Employment start date is required"
    }).min(new Date(), { message: "Employment start date must be at least from today" }),
    department: z.enum(["Sales", "Marketing", "HR", "Development"], {
        message: "Employee department is required and must be one of: Sales, Marketing, HR, Development"
    }),
    isManager: z.boolean({
        message: "Employee manager status is required and must be either true or false"
    }),
    monthlySalary: z.number({
        message: "Employee monthly salary is required"
    }).int().min(1000, {
        message: "Employee monthly salary must be at least 1000 USD"
    }),
});

export async function getAllEmployees(request, response) {
    try {
        const employees = await Employee.find();
        response.status(200).json(employees);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export async function getOneEmployee(request, response, next) {
    const { id } = request.params;
    try {
        const employee = await Employee.findById(id);
        if (!employee) {
            request.employee = null;
        } else {
            request.employee = employee;
        }
    } catch (error) {
        request.employee = null;
    }
    next();
}

export async function returnOneEmployee(request, response) {
    const { employee } = request;
    if (employee) {
        response.status(200).json(employee);
    } else {
        response.status(404).json({ error: "Employee not found" });
    }
}

export async function createEmployee(request, response) {
    const { name, age, employmentStartDate, department, isManager, monthlySalary } = request.body;
    const { authenticated } = request;

    if (!authenticated) {
        return response.status(401).json({ error: "Unauthorized, please provide a valid API key" });
    }

    const inputValidation = employeeValidationSchema.safeParse({
        name,
        age,
        employmentStartDate,
        department,
        isManager,
        monthlySalary
    });

    if (!inputValidation.success) {
        const errors = inputValidation.error.errors.map(err => err.message);
        return response.status(400).json({ error: "Validation Error", details: errors });
    }

    try {
        const newEmployee = new Employee({
            name,
            age,
            employmentStartDate,
            department,
            isManager,
            monthlySalary
        });
        await newEmployee.save();
        response.status(201).json(newEmployee);
    } catch (error) {
        response.status(500).json({ error: error.message || "Internal Server Error" });
    }
}

export async function updateEmployee(request, response) {
    const { authenticated } = request;
    if (!authenticated) {
        return response.status(401).json({ error: "Unauthorized, please provide a valid API key" });
    }
    const partialValidationSchema = employeeValidationSchema.partial();

    const inputValidation = partialValidationSchema.safeParse(request.body);

    if (!inputValidation.success) {
        const errors = inputValidation.error.errors.map(err => err.message);
        return response.status(400).json({ error: "Validation Error", details: errors });
    }

    const updates = inputValidation.data;

    // Update only provided fields
    Object.entries(updates).forEach(([key, value]) => {
        request.employee[key] = value;
    });

    try {
        const updatedEmployee = await request.employee.save();
        response.json(updatedEmployee);
    } catch (error) {
        response.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

export async function deleteEmployee(request, response) {
    if (!request.authenticated) {
        return response.status(401).json({ error: "Unauthorized, please provide a valid API key" });
    }
    const { id } = request.params
    try {
        const employee = await Employee.findById(id)
        if (!employee) {
            return response.status(404).json({ message: 'Employee not found' })
        } else {
            await Employee.findByIdAndDelete(id)
            response.json({ message: 'Employee removed' })
        }
    } catch (error) {
        response.status(500).json({ message: error.message })
    }
}
