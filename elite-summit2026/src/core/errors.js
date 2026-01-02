export class AppError extends Error {
    constructor(message, code = "APP_ERROR", details = null) {
        super(message);
        this.name = "AppError";
        this.code = code;
        this.details = details;
    }
}

export class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, "VALIDATION_ERROR", details);
        this.name = "ValidationError";
    }
}

export class NetworkError extends AppError {
    constructor(message, details = null) {
        super(message, "NETWORK_ERROR", details);
        this.name = "NetworkError";
    }
}
