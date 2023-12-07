import os from 'os';
export function findAllInterfaces(includeIPv4, includeIPv6) {
    const output = [];
    const networkInterfaces = os.networkInterfaces();
    Object.values(networkInterfaces).forEach(info => {
        if (info == null) {
            return;
        }
        info.forEach((iface) => {
            if (iface.internal) {
                return;
            }
            if (iface.family === 'IPv4' && includeIPv4) {
                output.push(iface);
            }
            if (iface.family === 'IPv6' && includeIPv6) {
                output.push(iface);
            }
        });
    });
    return output;
}
//# sourceMappingURL=find-all-interfaces.js.map