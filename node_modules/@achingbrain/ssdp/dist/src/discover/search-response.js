import { resolveService } from '../commands/resolve-service.js';
export function searchResponse(ssdp, message) {
    resolveService(ssdp, message.USN, message.ST, message.LOCATION, message.ttl())
        .catch(err => {
        ssdp.emit('error', err);
    });
}
//# sourceMappingURL=search-response.js.map