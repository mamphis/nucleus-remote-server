import { MutationType, defineStore } from "pinia";
import { ref } from "vue";
import { settingsStore } from "./settings";

type User = {
    username: string;
    tenantId: string;
    permissions: string[];
}

type ErrorResponse = {
    error: string;
    message: string;
}

type UserResponse = {
    token: string;
    user: User;
};

type LoginResponse = UserResponse | ErrorResponse;

function isErrorResponse(value: unknown): value is ErrorResponse {
    return !!value &&
        typeof value === 'object' &&
        'error' in value &&
        'message' in value &&
        typeof value.error === 'string' &&
        typeof value.message === 'string';
}

const userStore = defineStore('user', () => {
    const isLoggedIn = ref(false);
    const { baseApiUrl } = settingsStore();

    const token = ref<string>('');
    const user = ref<User>();

    const login = async (username: string, password: string): Promise<LoginResponse> => {
        const response = await fetch(`${baseApiUrl}/login`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorResponse = response.json();
            if (isErrorResponse(errorResponse)) {
                return errorResponse;
            }

            return {
                error: 'Internal Server Error',
                message: JSON.stringify(errorResponse),
            };
        }

        const result = await response.json() as unknown as UserResponse;
        token.value = result.token;
        user.value = result.user;
        isLoggedIn.value = true;

        return result;
    }

    return {
        isLoggedIn,
        login,
        token,
        user,
    };
}, { persistance: true });

export default userStore;