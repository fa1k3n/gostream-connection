
export class DeserializationError extends Error {
    constructor(message: string) {
        super(message); 
        this.name = "DeserializationError"; 
        Object.setPrototypeOf(this, DeserializationError.prototype);
    }
}