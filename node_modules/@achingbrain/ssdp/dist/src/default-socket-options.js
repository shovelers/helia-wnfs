import mergeOptions from 'merge-options';
export function defaultSocketOptions(options) {
    return mergeOptions(options ?? {}, {
        type: 'udp4',
        broadcast: {
            address: '239.255.255.250',
            port: 1900
        },
        bind: {
            address: '0.0.0.0',
            port: 1900
        },
        maxHops: 4
    });
}
//# sourceMappingURL=default-socket-options.js.map