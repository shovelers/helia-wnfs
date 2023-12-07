export const broadcastAdvert = (ssdp, advert, notifcationSubType) => {
    ssdp.emit('ssdp:send-message', 'NOTIFY * HTTP/1.1', {
        NT: advert.usn,
        NTS: notifcationSubType,
        USN: `${ssdp.udn}::${advert.usn}`,
        'CACHE-CONTROL': `max-age=${Math.round(advert.ttl / 1000)}`,
        SERVER: ssdp.signature,
        LOCATION: advert.location
    });
};
//# sourceMappingURL=broadcast-advert.js.map