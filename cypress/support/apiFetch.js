// cypress/support/apiFetch.js
export function apiFetch(method, url, body, { expectJson = true, headers = {} } = {}) {
  return cy.window().then((win) => {
    const h = new win.Headers();
    if (body) h.set('content-type', 'application/json');
    // force lowercase keys to match Cypress' header normalization
    Object.entries(headers).forEach(([k, v]) => h.set(k.toLowerCase(), v));

    // build absolute URL so we're explicit
    const fullUrl = url.startsWith('http')
      ? url
      : `${Cypress.config('baseUrl')}${url}`;

    return win.fetch(fullUrl, {
      method,
      headers: h,
      body: body ? JSON.stringify(body) : undefined,
    });
  })
  .then((res) => {
    const ct = res.headers.get('content-type') || '';
    const shouldParse = expectJson && res.status !== 204 && ct.includes('application/json');
    if (!shouldParse) return { status: res.status, body: null, headers: res.headers };
    return res.json().then((json) => ({ status: res.status, body: json, headers: res.headers }));
  });
}
