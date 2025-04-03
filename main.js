fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById('restaurant-list');

        data.forEach(restaurant => {
            const distance = getDistance(
                restaurant.latitude,
                restaurant.longitude,
                restaurant.station_latitude,
                restaurant.station_longitude
            );
            const walkMinutes = Math.round(distance / 80); // 80m/分

            const div = document.createElement('div');
            div.className = 'restaurant';
            div.innerHTML = `
        <h2>${restaurant.name}</h2>
        <img src="${restaurant.image}" alt="${restaurant.name}">
        <p><strong>カテゴリ:</strong> ${restaurant.category}</p>
        <p>${restaurant.description}</p>
        <p><span class="distance">駅から徒歩 約${walkMinutes}分</span>（最寄: ${restaurant.nearest_station}）</p>
        <a href="https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}" target="_blank">Google Mapで見る</a>
      `;
            list.appendChild(div);
        });
    });

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 地球の半径(m)
    const rad = deg => deg * Math.PI / 180;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // m単位
}
