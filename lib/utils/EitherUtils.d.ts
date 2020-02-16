import { EitherAsync, Either } from "purify-ts";
export declare const liftEitherToAsyncEither: <A, B>(either: Either<A, B>) => EitherAsync<A, B>;
export declare const liftToAsyncEither: <A, B>(value: B) => EitherAsync<A, B>;
export declare const liftEitherFunctionToAsyncEither: <A, B, T>(fun: (_: T) => Either<A, B>) => (t: T) => EitherAsync<A, B>;
export declare const liftFunctionToAsyncEither: <A, B, T>(fun: (_: T) => B) => (t: T) => EitherAsync<A, B>;
export declare const eitherPromiseToEitherAsync: <A, B>(promise: Promise<Either<A, B>>) => EitherAsync<A, B>;
export declare const eitherPromiseFunctionToEitherAsync: <A, B, T>(fun: (_: T) => Promise<Either<A, B>>) => (t: T) => EitherAsync<A, B>;
