import "dotenv/config";

const KEY = process.env.API_KEY;


export function authenticate(request, response, next) {
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
        request.authenticated = false;
    } else {
        const apiKey = authHeader.split(" ")[1];
        if (apiKey === KEY) {
            request.authenticated = true;
        } else {
            request.authenticated = false;
        }
    }
    next();
}
