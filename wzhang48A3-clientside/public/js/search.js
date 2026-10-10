(async () => {
  const form = document.querySelector('#search-form'); const message = document.querySelector('#message'); const results = document.querySelector('#results');
  try { const { data } = await API.getCategories(); for (const category of data) document.querySelector('#category').insertAdjacentHTML('beforeend', `<option value="${category.slug}">${escapeHTML(category.name)}</option>`); } catch (error) { message.textContent = error.message; }
  async function search() {
    const params = new URLSearchParams(); for (const [key, value] of new FormData(form)) if (String(value).trim()) params.set(key, value);
    message.className = 'muted'; message.textContent = 'Loading results...'; results.innerHTML = '';
    try { const { data } = await API.listEvents(`?${params}`); message.textContent = `${data.length} event${data.length === 1 ? '' : 's'} found`; results.innerHTML = data.map((event) => `<article class="card"><img src="${escapeHTML(event.hero_image_url || '')}" alt=""><div class="card-body"><span class="status">${escapeHTML(event.category_name)}</span><h3>${escapeHTML(event.title)}</h3><p class="muted">${escapeHTML(event.city)} · ${formatDate(event.start_time)}</p><a class="button" href="./event.html?id=${event.id}">View details</a></div></article>`).join('') || '<p class="muted">No events match these filters.</p>'; }
    catch (error) { message.className = 'error'; message.textContent = error.message; }
  }
  form.addEventListener('submit', (event) => { event.preventDefault(); search(); });
  document.querySelector('#clear').addEventListener('click', () => { form.reset(); results.innerHTML = ''; message.className = 'muted'; message.textContent = 'Enter a filter or search all upcoming events.'; });
})();
