"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const purify_ts_1 = require("purify-ts");
/* This utils contains functions that convert values and functions
 * to the EitherAsync type allowing them to be chained and mapped.
 */
/**
 * Takes an Either value and converts it an EitherAsync value.
 * @param either the value to wrap.
 */
exports.wrapEither = (either) => purify_ts_1.EitherAsync(({ liftEither }) => __awaiter(void 0, void 0, void 0, function* () { return liftEither(either); }));
/**
 * Takes a normal value and converts it an EitherAsync value.
 * @param either the value to wrap.
 */
exports.wrapValue = (value) => purify_ts_1.EitherAsync(({ liftEither }) => __awaiter(void 0, void 0, void 0, function* () { return liftEither(purify_ts_1.Either.of(value)); }));
/**
 * Takes a function which takes a normal value and returns an Either value, and converts it a function
 * that takes a normal value and returns an EitherAsync value.
 * @param either the value to wrap.
 */
exports.wrapEitherFunction = (fun) => (t) => purify_ts_1.EitherAsync(({ liftEither }) => __awaiter(void 0, void 0, void 0, function* () { return liftEither(fun(t)); }));
/**
 * Takes a function from T to B, and converts it a function
 * that takes an T and returns a EitherAsync<A, B>.
 * @param either the value to wrap.
 */
exports.wrapFunction = (fun) => (t) => purify_ts_1.EitherAsync(({ liftEither }) => __awaiter(void 0, void 0, void 0, function* () { return liftEither(purify_ts_1.Either.of(fun(t))); }));
/**
 * Takes an Either wrapped in a Promise and converts it to an
 * EitherAsync.
 * @param either the value to wrap.
 */
exports.wrapPromise = (promise) => purify_ts_1.EitherAsync(({ fromPromise }) => __awaiter(void 0, void 0, void 0, function* () { return fromPromise(promise); }));
/**
 * Takes a function from T to Promise<Either> and converts it to a function
 * from T to EitherAsync.
 * @param either the value to wrap.
 */
exports.wrapPromiseFunction = (fun) => (t) => purify_ts_1.EitherAsync(({ fromPromise }) => __awaiter(void 0, void 0, void 0, function* () { return fromPromise(fun(t)); }));
//# sourceMappingURL=EitherAsyncUtils.js.map