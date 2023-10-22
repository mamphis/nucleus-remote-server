export type ApiLocalDrive = ApiLocalDriveSpace & {
    driveDescription: string;
    driveType: string;
    driveFileSystem: string;
};

type ApiLocalDriveSpace = {
    clientId: string;
    driveLetter: string;
    driveSize: number;
    driveFreeSpace: number;
}

export type ApiLocalDriveHistoryEntry = ApiLocalDriveSpace & {
    timestamp: string;
}

export type ApiLocalDriveHistory = ApiLocalDriveHistoryEntry[];

export type ApiLocalDriveResponse = {
    drives: ApiLocalDrive[];
    history: ApiLocalDriveHistory;
}