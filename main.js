let restaurantData = [];

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        restaurantData = data.map(r => {
            const distance = getDistance(
                r.latitude,
                r.longitude,
                r.station_latitude,
                r.station_longitude
            );
            const walkMinutes = Math.round(distance / 80);
            return { ...r, distance, walkMinutes };
        });

        renderList(restaurantData);
    });

function renderList(data) {
    const list = document.getElementById('restaurant-list');
    list.innerHTML = '';

    data.forEach(r => {
        const div = document.createElement('div');
        div.className = 'restaurant';
        div.innerHTML = `
      <h2>${r.name}</h2>
      <img src="${r.image}" alt="${r.name}">
      <p><strong>カテゴリ:</strong> ${r.category}</p>
      <details>
        <summary>店舗の説明を見る</summary>
        <p>${r.description}</p>
      </details>
      <p><span class="distance">駅から徒歩 約${r.walkMinutes}分</span>（最寄: ${r.nearest_station}）</p>
      <a href="https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}" target="_blank">Google Mapで見る</a>
    `;
        list.appendChild(div);
    });
}

document.getElementById('sortButton').addEventListener('click', () => {
    const sorted = [...restaurantData].sort((a, b) => b.distance - a.distance);
    renderList(sorted);
});

document.getElementById('categorySelect').addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    if (selectedCategory === 'all') {
        renderList(restaurantData);
    } else {
        const filtered = restaurantData.filter(r => r.category === selectedCategory);
        renderList(filtered);
    }
});

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const rad = deg => deg * Math.PI / 180;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
