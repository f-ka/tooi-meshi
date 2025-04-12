let restaurantData = [];
let userLocation = null;

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
            return { ...r, stationDistance: distance, walkMinutes };
        });

        // 現在地取得
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                userLocation = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
                updateUserDistances();
                renderList(restaurantData);
            }, () => {
                // 拒否された場合も表示だけ
                renderList(restaurantData);
            });
        } else {
            renderList(restaurantData);
        }
    });

function updateUserDistances() {
    restaurantData = restaurantData.map(r => {
        const dist = getDistance(
            userLocation.latitude,
            userLocation.longitude,
            r.latitude,
            r.longitude
        );
        const walk = Math.round(dist / 80);
        return { ...r, currentDistance: dist, currentWalk: walk };
    });
}

function renderList(data) {
    const list = document.getElementById('restaurant-list');
    list.innerHTML = '';

    data.forEach(r => {
        const div = document.createElement('div');
        div.className = 'restaurant' + (r.rating >= 4 ? ' recommended' : '');
        div.innerHTML = `
        ${r.rating >= 4 ? `<p class="recommend-badge">🌟 おすすめ</p>` : ''}
      <h2>${r.name}</h2>
      <img src="${r.image}" alt="${r.name}">
      <p><strong>カテゴリ:</strong> ${r.category}</p>
      <p>
        <strong>評価:</strong>
        ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}
      </p>
        <p><strong>レビュー:</strong> ${r.review}</p>
        ${r.tags && r.tags.length > 0 ? `
            <div class="tag-list">
              ${r.tags.map(tag => `<span class="tag" data-tag="${tag}">#${tag}</span>`).join(' ')}
            </div>` : ''
            }             

      <details>
        <summary>店舗の説明を見る</summary>
        <p>${r.description}</p>
      </details>
      <p><span class="distance">駅から徒歩 約${r.walkMinutes}分</span>（最寄: ${r.nearest_station}）</p>
      ${r.currentWalk ? `<p class="current-distance">現在地から徒歩 約${r.currentWalk}分</p>` : ''}
      <button class="view-detail" data-name="${r.name}" data-description="${r.description}" data-image="${r.image}">詳細を見る</button>
      <div class="map-embed">
        <iframe
            src="https://maps.google.com/maps?q=${r.latitude},${r.longitude}&z=15&output=embed"
            width="100%"
            height="200"
            frameborder="0"
            style="border:0"
            loading="lazy"
            allowfullscreen>
        </iframe>
        </div>

      <a href="https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}" target="_blank">Google Mapで見る</a>
      ${r.affiliate_url ? `<a class="affiliate-link" href="${r.affiliate_url}" target="_blank">公式ページを見る</a>` : ''}
    `;
        list.appendChild(div);
    });
}

document.getElementById('sortButton').addEventListener('click', () => {
    const sorted = [...restaurantData].sort((a, b) => b.stationDistance - a.stationDistance);
    renderList(sorted);
});

document.getElementById('sortRatingButton').addEventListener('click', () => {
    const sorted = [...restaurantData].sort((a, b) => b.rating - a.rating);
    renderList(sorted);
});

document.getElementById('categorySelect').addEventListener('change', handleSearchFilter);
document.getElementById('searchInput').addEventListener('input', handleSearchFilter);

function handleSearchFilter() {
    const selectedCategory = document.getElementById('categorySelect').value;
    const keyword = document.getElementById('searchInput').value.toLowerCase();

    const filtered = restaurantData.filter(r => {
        const inCategory = selectedCategory === 'all' || r.category === selectedCategory;
        const inText =
            r.name.toLowerCase().includes(keyword) ||
            r.description.toLowerCase().includes(keyword) ||
            r.category.toLowerCase().includes(keyword);
        return inCategory && inText;
    });

    renderList(filtered);
}

// モーダル表示処理
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('view-detail')) {
        const name = e.target.getAttribute('data-name');
        const desc = e.target.getAttribute('data-description');
        const image = e.target.getAttribute('data-image');

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
      <h2>${name}</h2>
      <img src="${image}" alt="${name}" style="max-width:100%; border-radius:8px;">
      <p>${desc}</p>
    `;

        document.getElementById('modal').style.display = 'block';
    }

    if (e.target.classList.contains('modal-close')) {
        document.getElementById('modal').style.display = 'none';
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag')) {
        const tag = e.target.getAttribute('data-tag');
        const filtered = restaurantData.filter(r => r.tags && r.tags.includes(tag));
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
