(async () => {
  const id = new URLSearchParams(location.search).get('id'); const message = document.querySelector('#message');
  if (!id || !/^\d+$/.test(id)) { message.className = 'error'; message.textContent = 'A valid event id is required.'; return; }
  try {
    const { data } = await API.getEvent(id); const event = data.event;
    document.title = `${event.title} | Harbour Hope`; document.querySelector('#content').hidden = false; message.hidden = true;
    document.querySelector('#title').textContent = event.title; document.querySelector('#description').textContent = event.full_desc || event.short_desc || '';
    document.querySelector('#hero').src = event.hero_image_url || ''; document.querySelector('#hero').alt = event.title;
    document.querySelector('#status').textContent = event.lifecycle_status; document.querySelector('#when').textContent = `${formatDate(event.start_time)} - ${formatDate(event.end_time)}`;
    document.querySelector('#where').textContent = `${event.venue}, ${event.city}`; document.querySelector('#goal').textContent = `$${Number(event.goal_amount || 0).toLocaleString()}`;
    const register = document.querySelector('#register'); register.href = `/register.html?id=${event.id}`; if (event.status !== 'active' || event.lifecycle_status === 'past') { register.textContent = 'Registration unavailable'; register.classList.add('secondary'); register.removeAttribute('href'); }
    const list = document.querySelector('#registrations'); list.innerHTML = data.registrations.map((item) => `<li><strong>${escapeHTML(item.full_name)}</strong> purchased ${item.tickets} ticket${item.tickets === 1 ? '' : 's'}<br><span class="muted">${formatDate(item.registration_date)}</span></li>`).join('') || '<li class="muted">No registrations yet.</li>';
  } catch (error) { message.className = 'error'; message.textContent = error.message; }
})();
