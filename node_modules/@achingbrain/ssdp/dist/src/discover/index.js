export function discover(ssdp, serviceType) {
    serviceType = serviceType ?? 'ssdp:all';
    ssdp.emit('ssdp:send-message', 'M-SEARCH * HTTP/1.1', {
        ST: serviceType,
        MAN: 'ssdp:discover',
        MX: 0
    });
}
//# sourceMappingURL=index.js.map