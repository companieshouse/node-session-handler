import { EitherAsync, Either } from "purify-ts";

export const liftEitherToAsyncEither = <A, B>(either: Either<A, B>) =>
    EitherAsync<A, B>(async ({ liftEither }) => liftEither<B>(either));

export const liftToAsyncEither = <A, B>(value: B) =>
    EitherAsync<A, B>(async ({ liftEither }) => liftEither<B>(Either.of(value)));

export const liftEitherFunctionToAsyncEither = <A, B, T>(fun: (_: T) => Either<A, B>) => (t: T) =>
    EitherAsync<A, B>(async ({ liftEither }) => liftEither<B>(fun(t)));

export const liftFunctionToAsyncEither = <A, B, T>(fun: (_: T) => B) => (t: T) =>
    EitherAsync<A, B>(async ({ liftEither }) => liftEither<B>(Either.of(fun(t))));

export const eitherPromiseToEitherAsync = <A, B>(promise: Promise<Either<A, B>>) =>
    EitherAsync<A, B>(async ({ fromPromise }) => fromPromise(promise));

export const eitherPromiseFunctionToEitherAsync = <A, B, T>(fun: (_: T) => Promise<Either<A, B>>) => (t: T) =>
    EitherAsync<A, B>(async ({ fromPromise }) => fromPromise(fun(t)));