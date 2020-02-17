import { EitherAsync, Either } from "purify-ts";
/**
 * Takes an Either value and converts it an EitherAsync value.
 * @param either the value to wrap.
 */
export declare const wrapEither: <A, B>(either: Either<A, B>) => EitherAsync<A, B>;
/**
 * Takes a normal value and converts it an EitherAsync value.
 * @param either the value to wrap.
 */
export declare const wrapValue: <A, B>(value: B) => EitherAsync<A, B>;
/**
 * Takes a function which takes a normal value and returns an Either value, and converts it a function
 * that takes a normal value and returns an EitherAsync value.
 * @param either the value to wrap.
 */
export declare const wrapEitherFunction: <A, B, T>(fun: (_: T) => Either<A, B>) => (t: T) => EitherAsync<A, B>;
/**
 * Takes a function from T to B, and converts it a function
 * that takes an T and returns a EitherAsync<A, B>.
 * @param either the value to wrap.
 */
export declare const wrapFunction: <A, B, T>(fun: (_: T) => B) => (t: T) => EitherAsync<A, B>;
/**
 * Takes an Either wrapped in a Promise and converts it to an
 * EitherAsync.
 * @param either the value to wrap.
 */
export declare const wrapPromise: <A, B>(promise: Promise<Either<A, B>>) => EitherAsync<A, B>;
/**
 * Takes a function from T to Promise<Either> and converts it to a function
 * from T to EitherAsync.
 * @param either the value to wrap.
 */
export declare const wrapPromiseFunction: <A, B, T>(fun: (_: T) => Promise<Either<A, B>>) => (t: T) => EitherAsync<A, B>;
