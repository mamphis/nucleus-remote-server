import { isErrorResponse, type ErrorResponse } from "@/lib/request";
import type { AuthUser } from "@/types/user";
import { defineStore } from "pinia";
import { ref } from "vue";
import { settingsStore } from "./settings";

type UserResponse = {
    token: string;
    refreshToken: string;
    user: AuthUser;
};

type LoginResponse = UserResponse | ErrorResponse;

const userStore = defineStore('user', () => {
    const isLoggedIn = ref(false);
    const { baseApiUrl } = settingsStore();

    const token = ref<string>('');
    const refreshToken = ref<string>('');
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
        refreshToken.value = result.refreshToken;
        user.value = result.user;
        isLoggedIn.value = true;

        return result;
    }

    const logout = () => {
        token.value = '';
        refreshToken.value = '';
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
        refreshToken.value = result.refreshToken;
        user.value = result.user;
        isLoggedIn.value = true;

        return result;
    }

    const sendResetLink = async (mail: string) => {
        await fetch(`${baseApiUrl}resetPassword`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ mail }),
        });
    }

    const refreshSession = async () => {
        const response = await fetch(`${baseApiUrl}refresh`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: refreshToken.value }),
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
        refreshToken.value = result.refreshToken;
        user.value =  result.user;
    }

    return {
        isLoggedIn,
        login,
        logout,
        verify,
        sendResetLink,
        token,
        user,
        refreshToken,
        refreshSession,
    };
}, { persistance: true, ignore: ["token"] });

export default userStore;