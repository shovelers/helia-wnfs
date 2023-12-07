/* eslint-disable import/export */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { enumeration, encodeMessage, decodeMessage, message } from 'protons-runtime';
export var Message;
(function (Message) {
    let Wantlist;
    (function (Wantlist) {
        let WantType;
        (function (WantType) {
            WantType["Block"] = "Block";
            WantType["Have"] = "Have";
        })(WantType = Wantlist.WantType || (Wantlist.WantType = {}));
        let __WantTypeValues;
        (function (__WantTypeValues) {
            __WantTypeValues[__WantTypeValues["Block"] = 0] = "Block";
            __WantTypeValues[__WantTypeValues["Have"] = 1] = "Have";
        })(__WantTypeValues || (__WantTypeValues = {}));
        (function (WantType) {
            WantType.codec = () => {
                return enumeration(__WantTypeValues);
            };
        })(WantType = Wantlist.WantType || (Wantlist.WantType = {}));
        let Entry;
        (function (Entry) {
            let _codec;
            Entry.codec = () => {
                if (_codec == null) {
                    _codec = message((obj, w, opts = {}) => {
                        if (opts.lengthDelimited !== false) {
                            w.fork();
                        }
                        if ((obj.block != null && obj.block.byteLength > 0)) {
                            w.uint32(10);
                            w.bytes(obj.block);
                        }
                        if ((obj.priority != null && obj.priority !== 0)) {
                            w.uint32(16);
                            w.int32(obj.priority);
                        }
                        if ((obj.cancel != null && obj.cancel !== false)) {
                            w.uint32(24);
                            w.bool(obj.cancel);
                        }
                        if (obj.wantType != null && __WantTypeValues[obj.wantType] !== 0) {
                            w.uint32(32);
                            Message.Wantlist.WantType.codec().encode(obj.wantType, w);
                        }
                        if ((obj.sendDontHave != null && obj.sendDontHave !== false)) {
                            w.uint32(40);
                            w.bool(obj.sendDontHave);
                        }
                        if (opts.lengthDelimited !== false) {
                            w.ldelim();
                        }
                    }, (reader, length) => {
                        const obj = {
                            block: new Uint8Array(0),
                            priority: 0,
                            cancel: false,
                            wantType: WantType.Block,
                            sendDontHave: false
                        };
                        const end = length == null ? reader.len : reader.pos + length;
                        while (reader.pos < end) {
                            const tag = reader.uint32();
                            switch (tag >>> 3) {
                                case 1:
                                    obj.block = reader.bytes();
                                    break;
                                case 2:
                                    obj.priority = reader.int32();
                                    break;
                                case 3:
                                    obj.cancel = reader.bool();
                                    break;
                                case 4:
                                    obj.wantType = Message.Wantlist.WantType.codec().decode(reader);
                                    break;
                                case 5:
                                    obj.sendDontHave = reader.bool();
                                    break;
                                default:
                                    reader.skipType(tag & 7);
                                    break;
                            }
                        }
                        return obj;
                    });
                }
                return _codec;
            };
            Entry.encode = (obj) => {
                return encodeMessage(obj, Entry.codec());
            };
            Entry.decode = (buf) => {
                return decodeMessage(buf, Entry.codec());
            };
        })(Entry = Wantlist.Entry || (Wantlist.Entry = {}));
        let _codec;
        Wantlist.codec = () => {
            if (_codec == null) {
                _codec = message((obj, w, opts = {}) => {
                    if (opts.lengthDelimited !== false) {
                        w.fork();
                    }
                    if (obj.entries != null) {
                        for (const value of obj.entries) {
                            w.uint32(10);
                            Message.Wantlist.Entry.codec().encode(value, w);
                        }
                    }
                    if ((obj.full != null && obj.full !== false)) {
                        w.uint32(16);
                        w.bool(obj.full);
                    }
                    if (opts.lengthDelimited !== false) {
                        w.ldelim();
                    }
                }, (reader, length) => {
                    const obj = {
                        entries: [],
                        full: false
                    };
                    const end = length == null ? reader.len : reader.pos + length;
                    while (reader.pos < end) {
                        const tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                obj.entries.push(Message.Wantlist.Entry.codec().decode(reader, reader.uint32()));
                                break;
                            case 2:
                                obj.full = reader.bool();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return obj;
                });
            }
            return _codec;
        };
        Wantlist.encode = (obj) => {
            return encodeMessage(obj, Wantlist.codec());
        };
        Wantlist.decode = (buf) => {
            return decodeMessage(buf, Wantlist.codec());
        };
    })(Wantlist = Message.Wantlist || (Message.Wantlist = {}));
    let Block;
    (function (Block) {
        let _codec;
        Block.codec = () => {
            if (_codec == null) {
                _codec = message((obj, w, opts = {}) => {
                    if (opts.lengthDelimited !== false) {
                        w.fork();
                    }
                    if ((obj.prefix != null && obj.prefix.byteLength > 0)) {
                        w.uint32(10);
                        w.bytes(obj.prefix);
                    }
                    if ((obj.data != null && obj.data.byteLength > 0)) {
                        w.uint32(18);
                        w.bytes(obj.data);
                    }
                    if (opts.lengthDelimited !== false) {
                        w.ldelim();
                    }
                }, (reader, length) => {
                    const obj = {
                        prefix: new Uint8Array(0),
                        data: new Uint8Array(0)
                    };
                    const end = length == null ? reader.len : reader.pos + length;
                    while (reader.pos < end) {
                        const tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                obj.prefix = reader.bytes();
                                break;
                            case 2:
                                obj.data = reader.bytes();
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return obj;
                });
            }
            return _codec;
        };
        Block.encode = (obj) => {
            return encodeMessage(obj, Block.codec());
        };
        Block.decode = (buf) => {
            return decodeMessage(buf, Block.codec());
        };
    })(Block = Message.Block || (Message.Block = {}));
    let BlockPresenceType;
    (function (BlockPresenceType) {
        BlockPresenceType["Have"] = "Have";
        BlockPresenceType["DontHave"] = "DontHave";
    })(BlockPresenceType = Message.BlockPresenceType || (Message.BlockPresenceType = {}));
    let __BlockPresenceTypeValues;
    (function (__BlockPresenceTypeValues) {
        __BlockPresenceTypeValues[__BlockPresenceTypeValues["Have"] = 0] = "Have";
        __BlockPresenceTypeValues[__BlockPresenceTypeValues["DontHave"] = 1] = "DontHave";
    })(__BlockPresenceTypeValues || (__BlockPresenceTypeValues = {}));
    (function (BlockPresenceType) {
        BlockPresenceType.codec = () => {
            return enumeration(__BlockPresenceTypeValues);
        };
    })(BlockPresenceType = Message.BlockPresenceType || (Message.BlockPresenceType = {}));
    let BlockPresence;
    (function (BlockPresence) {
        let _codec;
        BlockPresence.codec = () => {
            if (_codec == null) {
                _codec = message((obj, w, opts = {}) => {
                    if (opts.lengthDelimited !== false) {
                        w.fork();
                    }
                    if ((obj.cid != null && obj.cid.byteLength > 0)) {
                        w.uint32(10);
                        w.bytes(obj.cid);
                    }
                    if (obj.type != null && __BlockPresenceTypeValues[obj.type] !== 0) {
                        w.uint32(16);
                        Message.BlockPresenceType.codec().encode(obj.type, w);
                    }
                    if (opts.lengthDelimited !== false) {
                        w.ldelim();
                    }
                }, (reader, length) => {
                    const obj = {
                        cid: new Uint8Array(0),
                        type: BlockPresenceType.Have
                    };
                    const end = length == null ? reader.len : reader.pos + length;
                    while (reader.pos < end) {
                        const tag = reader.uint32();
                        switch (tag >>> 3) {
                            case 1:
                                obj.cid = reader.bytes();
                                break;
                            case 2:
                                obj.type = Message.BlockPresenceType.codec().decode(reader);
                                break;
                            default:
                                reader.skipType(tag & 7);
                                break;
                        }
                    }
                    return obj;
                });
            }
            return _codec;
        };
        BlockPresence.encode = (obj) => {
            return encodeMessage(obj, BlockPresence.codec());
        };
        BlockPresence.decode = (buf) => {
            return decodeMessage(buf, BlockPresence.codec());
        };
    })(BlockPresence = Message.BlockPresence || (Message.BlockPresence = {}));
    let _codec;
    Message.codec = () => {
        if (_codec == null) {
            _codec = message((obj, w, opts = {}) => {
                if (opts.lengthDelimited !== false) {
                    w.fork();
                }
                if (obj.wantlist != null) {
                    w.uint32(10);
                    Message.Wantlist.codec().encode(obj.wantlist, w);
                }
                if (obj.blocks != null) {
                    for (const value of obj.blocks) {
                        w.uint32(18);
                        w.bytes(value);
                    }
                }
                if (obj.payload != null) {
                    for (const value of obj.payload) {
                        w.uint32(26);
                        Message.Block.codec().encode(value, w);
                    }
                }
                if (obj.blockPresences != null) {
                    for (const value of obj.blockPresences) {
                        w.uint32(34);
                        Message.BlockPresence.codec().encode(value, w);
                    }
                }
                if ((obj.pendingBytes != null && obj.pendingBytes !== 0)) {
                    w.uint32(40);
                    w.int32(obj.pendingBytes);
                }
                if (opts.lengthDelimited !== false) {
                    w.ldelim();
                }
            }, (reader, length) => {
                const obj = {
                    blocks: [],
                    payload: [],
                    blockPresences: [],
                    pendingBytes: 0
                };
                const end = length == null ? reader.len : reader.pos + length;
                while (reader.pos < end) {
                    const tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 1:
                            obj.wantlist = Message.Wantlist.codec().decode(reader, reader.uint32());
                            break;
                        case 2:
                            obj.blocks.push(reader.bytes());
                            break;
                        case 3:
                            obj.payload.push(Message.Block.codec().decode(reader, reader.uint32()));
                            break;
                        case 4:
                            obj.blockPresences.push(Message.BlockPresence.codec().decode(reader, reader.uint32()));
                            break;
                        case 5:
                            obj.pendingBytes = reader.int32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                    }
                }
                return obj;
            });
        }
        return _codec;
    };
    Message.encode = (obj) => {
        return encodeMessage(obj, Message.codec());
    };
    Message.decode = (buf) => {
        return decodeMessage(buf, Message.codec());
    };
})(Message || (Message = {}));
//# sourceMappingURL=message.js.map