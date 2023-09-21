import { settingsStore } from "@/stores/settings";
import userStore from "@/stores/user";
import { $t } from "./locale/locale";
import { ref, type Ref, type UnwrapNestedRefs } from "vue";
import type { UnwrapRef } from "vue";

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type GeneralErrorResponse = {
    type: string,
    error: string;
    message: string;
}

type ValidationErrorResponse = GeneralErrorResponse & {
    type: 'ValidationError';
    data: Array<{ code: string, path: string, message: string }>;
}

export type ErrorResponse = ValidationErrorResponse | GeneralErrorResponse;

function isErrorResponse(value: unknown): value is ErrorResponse {
    return !!value &&
        typeof value === 'object' &&
        'error' in value &&
        'message' in value &&
        'type' in value &&
        typeof value.error === 'string' &&
        typeof value.message === 'string' &&
        typeof value.type === 'string';
}

function assertNotErrorResponse<T>(value: unknown): asserts value is T {
    if (!value) {
        throw new Error($t('request.valueUndefined'));
    }

    if (isErrorResponse(value)) {
        throw new Error($t('request.errorResponse', value.message));
    }
}

function isValidationError(value: unknown): value is ValidationErrorResponse {
    return isErrorResponse(value) &&
        value.type === 'ValidationError' &&
        'data' in value &&
        Array.isArray(value.data);
}

const normalizeApiRoute = (apiRoute: string): string => {
    if (apiRoute.startsWith('/'))
        return apiRoute.substring(1);

    return apiRoute;
}

type SuccessResponse<T> = T & {
    toRef: () => Ref<UnwrapRef<T>>;
};

type Response<T> = (ErrorResponse | T) & {
    assertNotError: () => SuccessResponse<T>;
};

const request = async <T>(method: RequestMethod, apiRoute: string, body?: any): Promise<Response<T>> => {
    const user = userStore();
    const { baseApiUrl } = settingsStore();
    if (!user.token) {
        await user.refreshSession();
    }

    let requestInit: RequestInit = {
        headers: {
            authorization: `Bearer ${user.token}`,
        },
        method
    }

    if (!['GET', 'DELETE'].includes(method)) {
        requestInit.headers = Object.assign(requestInit.headers ?? {}, { 'content-type': 'application/json' });
        requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(new URL(normalizeApiRoute(apiRoute), baseApiUrl), requestInit);
    const makeResponse = (response: unknown) => {
        const obj = response as T | ErrorResponse ?? {};

        Object.defineProperty(obj, 'assertNotError', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: () => {
                assertNotErrorResponse<T>(response);
                Object.defineProperty(obj, 'toRef', {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: () => {
                        return ref<T>(response);
                    }
                });
                return obj;
            },
        });

        return obj as Response<T>;
    }
    if (!response.ok) {
        const errorResponse = await response.json();

        if (response.status === 401 && errorResponse.message === 'Token expired') {
            await user.refreshSession();
            return request<T>(method, apiRoute, body);
        }

        return makeResponse(errorResponse);
    }

    if (response.status === 204) {
        return makeResponse(undefined);
    }

    const result = await response.json();
    return makeResponse(result);
};

export default {
    $get: <T>(apiRoute: string) => request<T>('GET', apiRoute),
    $post: <T>(apiRoute: string, body: any) => request<T>('POST', apiRoute, body),
    $patch: <T>(apiRoute: string, body: any) => request<T>('PATCH', apiRoute, body),
    $put: <T>(apiRoute: string, body: any) => request<T>('PUT', apiRoute, body),
    $delete: (apiRoute: string) => request<undefined>('DELETE', apiRoute),
};

export {
    isErrorResponse,
    isValidationError,
    assertNotErrorResponse,
}