(async () => {
  const message = document.querySelector('#message');
  try {
    const { data } = await API.listEvents();
    message.hidden = true;
    document.querySelector('#events').innerHTML = data.map((event) => `
      <article class="card"><img src="${escapeHTML(event.hero_image_url || '')}" alt=""><div class="card-body">
      <span class="status">${escapeHTML(event.category_name)}</span><h3>${escapeHTML(event.title)}</h3>
      <p class="muted">${escapeHTML(event.city)} · ${formatDate(event.start_time)}</p><p>${escapeHTML(event.short_desc || '')}</p>
      <a class="button" href="/event.html?id=${event.id}">View details</a></div></article>`).join('') || '<p class="muted">No upcoming events are currently available.</p>';
  } catch (error) { message.className = 'error'; message.textContent = error.message; }
})();
