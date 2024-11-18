import { Router } from "express"
import { getAllEmployees, getOneEmployee, returnOneEmployee, createEmployee, updateEmployee, deleteEmployee } from "../controllers/employee.controllers.js";
import { authenticate } from "../auth/authenticate.js";

const employeeRouter = Router();

employeeRouter.get("/", (request, response) => getAllEmployees(request, response));
employeeRouter.get("/:id", (request, response, next) => getOneEmployee(request, response, next), (request, response) => returnOneEmployee(request, response));
employeeRouter.post("/", (request, response, next) => authenticate(request, response, next), (request, response) => createEmployee(request, response));
employeeRouter.patch("/:id", (request, response, next) => authenticate(request, response, next), (request, response, next) => getOneEmployee(request, response, next), (request, response) => updateEmployee(request, response));
employeeRouter.delete("/:id", (request, response, next) => authenticate(request, response, next), (request, response) => deleteEmployee(request, response));


export default employeeRouter;
