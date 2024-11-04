import { CommandConfig } from "@/types/reader";

export class CommandBuilder {
    static buildPollingCommand(): Uint8Array {
        return new Uint8Array([
            0x00,  // Length
            0x00,  // System Code (lower)
            0xff,  // System Code (upper)
            0x00,  // Request Code
            0x00,  // Timeout
        ]);
    }

    static buildReadCommand(config: CommandConfig): Uint8Array {
        const { idm, serviceCode, blockCount } = config;
        const blockListElements = new Array(blockCount).fill(0)
            .map((_, i) => [0x80, i])
            .flat();

        const command = new Uint8Array(14 + blockListElements.length);
        let offset = 0;

        // Command length
        command[offset++] = command.length;
        // Command code (Read Without Encryption)
        command[offset++] = 0x06;
        // Copy IDm
        command.set(idm, offset);
        offset += 8;
        // Number of services
        command[offset++] = 0x01;
        // Service code (little endian)
        command[offset++] = serviceCode & 0xff;
        command[offset++] = (serviceCode >> 8) & 0xff;
        // Number of blocks
        command[offset++] = blockCount;
        // Block list
        command.set(new Uint8Array(blockListElements), offset);

        return command;
    }
}