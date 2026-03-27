export async function fetchJson(url) {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
  if (response.status === 401) {
    throw new Error('You need to sign in again.');
  }
  if (response.status === 403) {
    throw new Error('You do not have access to this page.');
  }
  if (!response.ok) {
    throw new Error((await response.text()) || `Unable to load ${url}`);
  }
  return response.json();
}

export async function postForm(url, entries) {
  const body = new URLSearchParams();
  entries.forEach(([key, value]) => appendFormValue(body, key, value));

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: body.toString()
  });

  if (response.status === 401) {
    throw new Error('You need to sign in again.');
  }
  if (response.status === 403) {
    throw new Error('You do not have access to this action.');
  }
  if (!response.ok) {
    throw new Error((await response.text()) || 'Unable to save.');
  }

  return response;
}

export async function postMultipart(url, entries, options = {}) {
  const body = new FormData();
  entries.forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => body.append(key, item));
      return;
    }
    if (value !== undefined && value !== null) {
      body.append(key, value);
    }
  });

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: options.headers,
    body
  });

  if (response.status === 401) {
    throw new Error('You need to sign in again.');
  }
  if (response.status === 403) {
    throw new Error('You do not have access to this action.');
  }
  if (!response.ok) {
    throw new Error((await response.text()) || 'Unable to save.');
  }

  return response;
}

function appendFormValue(searchParams, key, value) {
  if (Array.isArray(value)) {
    value.forEach(item => appendFormValue(searchParams, key, item));
    return;
  }
  if (value === undefined || value === null) {
    return;
  }
  searchParams.append(key, String(value));
}
