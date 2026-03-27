export function appendFormValue(searchParams, key, value) {
  if (Array.isArray(value)) {
    value.forEach(item => appendFormValue(searchParams, key, item));
    return;
  }
  if (value === undefined || value === null) {
    return;
  }
  searchParams.append(key, String(value));
}

export function appendBrowserFormValue(form, key, value) {
  if (Array.isArray(value)) {
    value.forEach(item => appendBrowserFormValue(form, key, item));
    return;
  }
  if (value === undefined || value === null) {
    return;
  }
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = key;
  input.value = String(value);
  form.appendChild(input);
}

export function submitBrowserForm(url, entries) {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = url;
  form.style.display = 'none';
  entries.forEach(([key, value]) => appendBrowserFormValue(form, key, value));
  document.body.appendChild(form);
  form.submit();
}

export function isNetworkRequestError(error) {
  const message = error?.message || '';
  return error instanceof TypeError || /networkerror|failed to fetch|load failed/i.test(message);
}

export function createDirectoryUserFormState(bootstrap) {
  return {
    id: bootstrap?.user?.id ? String(bootstrap.user.id) : '',
    name: bootstrap?.user?.name || '',
    fullName: bootstrap?.user?.fullName || '',
    email: bootstrap?.user?.email || '',
    social: bootstrap?.user?.social || '',
    phoneNumber: bootstrap?.user?.phoneNumber || '',
    phoneExtension: bootstrap?.user?.phoneExtension || '',
    countryId: bootstrap?.user?.countryId ? String(bootstrap.user.countryId) : '',
    timezoneId: bootstrap?.user?.timezoneId ? String(bootstrap.user.timezoneId) : '',
    type: bootstrap?.user?.type || bootstrap?.types?.[0]?.value || '',
    companyId: bootstrap?.user?.companyId ? String(bootstrap.user.companyId) : bootstrap?.selectedCompanyId ? String(bootstrap.selectedCompanyId) : '',
    password: ''
  };
}
