import { isErrorResponse, type ErrorResponse } from "@/lib/request";
import type { AuthUser } from "@/types/user";
import { defineStore } from "pinia";
import { ref } from "vue";
import { settingsStore } from "./settings";

type UserResponse = {
    token: string;
    user: AuthUser;
};

type LoginResponse = UserResponse | ErrorResponse;

const userStore = defineStore('user', () => {
    const isLoggedIn = ref(false);
    const { baseApiUrl } = settingsStore();

    const token = ref<string>('');
    const user = ref<AuthUser>();

    const login = async (username: string, password: string): Promise<LoginResponse> => {
        const response = await fetch(`${baseApiUrl}login`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            if (isErrorResponse(errorResponse)) {
                return errorResponse;
            }

            return {
                type: 'Unknown',
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
    const logout = () => {
        token.value = '';
        isLoggedIn.value = false;
        user.value = undefined;
    }

    const verify = async (onetimePassword: string, password: string) => {
        const response = await fetch(`${baseApiUrl}verify`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ onetimePassword, password }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            if (isErrorResponse(errorResponse)) {
                return errorResponse;
            }

            return {
                type: 'Unknown',
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
        logout,
        verify,
        token,
        user,
    };
}, { persistance: true });

export default userStore;