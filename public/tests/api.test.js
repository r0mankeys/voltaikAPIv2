import request from 'supertest';
import Employee from '../model/model.js';
import { describe, it } from 'mocha';

const allEmployees = Employee.find();

describe('GET /', () => {
   it('Responds with the home page', () => {
         request('http://localhost:8080')
            .get('/')
            .expect(200)
            .expect('Content-Type', 'text/html; charset=UTF-8'); 
   });
});

describe('GET /api/v2/employees', () => {
   it('Responds with JSON of all employees', () => {
         request('http://localhost:8080')
            .get('/api/v2/employees')
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8') 
            .then(response => {
               expect(response.body).toEqual(allEmployees);
            });
   });
});

describe('GET /api/v2/employees/:id', () => {
   describe("GET /api/v2/employees/1", () => {
      it("Responds with error message since employee with id 1 does not exist", () => {
         request('http://localhost:8080')
            .get('/api/v2/employees/1')
            .expect(404)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(response => {
               expect(response.body).toEqual({ error: "Employee not found" });
            });
      });
   }),
   describe("GET /api/v2/employees/673b4f79a64f1db7a0fb7757", () => {
      it("Responds with JSON of employee named Finch", () => {
         request('http://localhost:8080')
            .get('/api/v2/employees/673b4f79a64f1db7a0fb7757')
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(response => {
               expect(response.body.name).toBe("Finch");
            });
      })
   })
});
