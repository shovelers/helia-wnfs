export declare abstract class UnixFSError extends Error {
    readonly name: string;
    readonly code: string;
    constructor(message: string, name: string, code: string);
}
export declare class NotUnixFSError extends UnixFSError {
    constructor(message?: string);
}
export declare class InvalidPBNodeError extends UnixFSError {
    constructor(message?: string);
}
export declare class UnknownError extends UnixFSError {
    constructor(message?: string);
}
export declare class AlreadyExistsError extends UnixFSError {
    constructor(message?: string);
}
export declare class DoesNotExistError extends UnixFSError {
    constructor(message?: string);
}
export declare class NoContentError extends UnixFSError {
    constructor(message?: string);
}
export declare class NotAFileError extends UnixFSError {
    constructor(message?: string);
}
export declare class NotADirectoryError extends UnixFSError {
    constructor(message?: string);
}
export declare class InvalidParametersError extends UnixFSError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map