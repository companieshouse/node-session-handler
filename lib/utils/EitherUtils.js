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
exports.liftEitherToAsyncEither = (either) => purify_ts_1.EitherAsync(({ liftEither }) => __awaiter(void 0, void 0, void 0, function* () { return liftEither(either); }));
exports.liftToAsyncEither = (value) => purify_ts_1.EitherAsync(({ liftEither }) => __awaiter(void 0, void 0, void 0, function* () { return liftEither(purify_ts_1.Either.of(value)); }));
exports.liftEitherFunctionToAsyncEither = (fun) => (t) => purify_ts_1.EitherAsync(({ liftEither }) => __awaiter(void 0, void 0, void 0, function* () { return liftEither(fun(t)); }));
exports.liftFunctionToAsyncEither = (fun) => (t) => purify_ts_1.EitherAsync(({ liftEither }) => __awaiter(void 0, void 0, void 0, function* () { return liftEither(purify_ts_1.Either.of(fun(t))); }));
exports.eitherPromiseToEitherAsync = (promise) => purify_ts_1.EitherAsync(({ fromPromise }) => __awaiter(void 0, void 0, void 0, function* () { return fromPromise(promise); }));
exports.eitherPromiseFunctionToEitherAsync = (fun) => (t) => purify_ts_1.EitherAsync(({ fromPromise }) => __awaiter(void 0, void 0, void 0, function* () { return fromPromise(fun(t)); }));
//# sourceMappingURL=EitherUtils.js.map