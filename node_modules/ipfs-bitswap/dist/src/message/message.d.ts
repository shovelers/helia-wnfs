import type { Codec } from 'protons-runtime';
import type { Uint8ArrayList } from 'uint8arraylist';
export interface Message {
    wantlist?: Message.Wantlist;
    blocks: Uint8Array[];
    payload: Message.Block[];
    blockPresences: Message.BlockPresence[];
    pendingBytes: number;
}
export declare namespace Message {
    interface Wantlist {
        entries: Message.Wantlist.Entry[];
        full: boolean;
    }
    namespace Wantlist {
        enum WantType {
            Block = "Block",
            Have = "Have"
        }
        namespace WantType {
            const codec: () => Codec<WantType>;
        }
        interface Entry {
            block: Uint8Array;
            priority: number;
            cancel: boolean;
            wantType: Message.Wantlist.WantType;
            sendDontHave: boolean;
        }
        namespace Entry {
            const codec: () => Codec<Entry>;
            const encode: (obj: Partial<Entry>) => Uint8Array;
            const decode: (buf: Uint8Array | Uint8ArrayList) => Entry;
        }
        const codec: () => Codec<Wantlist>;
        const encode: (obj: Partial<Wantlist>) => Uint8Array;
        const decode: (buf: Uint8Array | Uint8ArrayList) => Wantlist;
    }
    interface Block {
        prefix: Uint8Array;
        data: Uint8Array;
    }
    namespace Block {
        const codec: () => Codec<Block>;
        const encode: (obj: Partial<Block>) => Uint8Array;
        const decode: (buf: Uint8Array | Uint8ArrayList) => Block;
    }
    enum BlockPresenceType {
        Have = "Have",
        DontHave = "DontHave"
    }
    namespace BlockPresenceType {
        const codec: () => Codec<BlockPresenceType>;
    }
    interface BlockPresence {
        cid: Uint8Array;
        type: Message.BlockPresenceType;
    }
    namespace BlockPresence {
        const codec: () => Codec<BlockPresence>;
        const encode: (obj: Partial<BlockPresence>) => Uint8Array;
        const decode: (buf: Uint8Array | Uint8ArrayList) => BlockPresence;
    }
    const codec: () => Codec<Message>;
    const encode: (obj: Partial<Message>) => Uint8Array;
    const decode: (buf: Uint8Array | Uint8ArrayList) => Message;
}
//# sourceMappingURL=message.d.ts.map