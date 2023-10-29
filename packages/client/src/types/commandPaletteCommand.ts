

type CommandType = 'command' | 'navigation';

export type Command = {
    name: string;
    description: string;
    action: () => void;
    type: CommandType;
};