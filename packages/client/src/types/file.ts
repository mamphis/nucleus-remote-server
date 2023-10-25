import type { ApiUser } from "./user";

export type ApiFile = {
    id: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    uploadedBy?: ApiUser;
    createdAt: string;
}