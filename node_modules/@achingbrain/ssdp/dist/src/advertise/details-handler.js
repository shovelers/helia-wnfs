export function detailsHandler(createDetails, request, response) {
    createDetails()
        .then(details => {
        response.writeHead(200, { 'Content-Type': 'text/xml' });
        response.end(details);
    })
        .catch(error => {
        response.writeHead(500);
        response.end(error);
    });
}
//# sourceMappingURL=details-handler.js.map