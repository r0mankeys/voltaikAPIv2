import { Schema, model } from "mongoose";

const employeeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    employmentStartDate: {
        type: Date,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    isManager: {
        type: Boolean,
        required: true
    },
    monthlySalary: {
        type: Number,
        required: true
    }
});

const Employee = model("Employee", employeeSchema);

export default Employee;
