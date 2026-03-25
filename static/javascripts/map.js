// ==========================================
// 1. KHỞI TẠO BẢN ĐỒ LEAFLET
// ==========================================
// Đặt tâm bản đồ tại TP.HCM
const mymap = L.map('map', {
    zoomControl: false // Tắt nút zoom mặc định ở góc trái trên
}).setView([10.7769, 106.7009], 13);

// Tải lớp ảnh bản đồ từ OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);

// Đưa nút Zoom xuống góc dưới bên phải
L.control.zoom({ position: 'bottomright' }).addTo(mymap);


// ==========================================
// 2. CHỨC NĂNG TÌM KIẾM ĐỊA ĐIỂM (NOMINATIM)
// ==========================================
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
let currentMarker = null; // Biến nhớ cái ghim hiện tại

function performSearch() {
    console.log("Hàm tìm kiếm đã được kích hoạt! Từ khóa là:", searchInput.value);
    const query = searchInput.value.trim();
    if (query === '') return;

    // Gọi API của OpenStreetMap
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                const lat = result.lat;
                const lon = result.lon;
                // Cắt ngắn tên địa điểm cho đỡ dài (chỉ lấy phần đầu trước dấu phẩy)
                const shortName = result.display_name.split(',')[0]; 

                // Xóa ghim cũ
                if (currentMarker) mymap.removeLayer(currentMarker);

                // Cắm ghim mới
                currentMarker = L.marker([lat, lon]).addTo(mymap);
                
                // TẠO POPUP CÓ NÚT BẤM BÊN TRONG
                // Chú ý: Ta dùng nháy đơn và nháy kép cẩn thận để nhúng hàm onclick
                const popupContent = `
                    <div style="text-align: center; min-width: 150px;">
                        <b style="font-size: 14px; color: #333;">${shortName}</b><br>
                        <span style="font-size: 11px; color: #777;">${result.display_name}</span><br><br>
                        <button onclick="addToItinerary('${shortName}', ${lat}, ${lon})" 
                                style="background: #1a73e8; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">
                            + Thêm vào lịch trình
                        </button>
                    </div>
                `;

                currentMarker.bindPopup(popupContent).openPopup();
                mymap.flyTo([lat, lon], 16); // Bay đến mục tiêu
                
            } else {
                alert("Không tìm thấy địa điểm. Thử nhập tên quận/thành phố rõ hơn nhé!");
            }
        })
        .catch(error => console.error("Lỗi:", error));
}

// Bắt sự kiện click nút kính lúp và phím Enter
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') performSearch();
});


// ==========================================
// 3. XỬ LÝ GIAO DIỆN VÀ CẮM GHIM LỊCH TRÌNH
// ==========================================
let itineraryList = []; 
const locationListElement = document.getElementById('location-list');

// Tạo một "cái rổ" chứa các ghim lịch trình trên bản đồ
const itineraryLayerGroup = L.layerGroup().addTo(mymap);

window.addToItinerary = function(name, lat, lon) {
    itineraryList.push({ name: name, lat: lat, lon: lon });
    mymap.closePopup(); 
    updateItineraryUI(); 
};

// Hàm vẽ lại danh sách HTML và Cắm ghim lên bản đồ
function updateItineraryUI() {
    locationListElement.innerHTML = ''; 
    itineraryLayerGroup.clearLayers(); 

    if (itineraryList.length === 0) {
        locationListElement.innerHTML = '<li style="color: #aaa; border: none; justify-content: center;">Chưa có địa điểm nào được chọn.</li>';
        return;
    }

    itineraryList.forEach((item, index) => {
        // --- PHẦN A: VẼ HTML BÊN TRÁI ---
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        
        const spanName = document.createElement('span');
        
        // Nhấn mạnh điểm số 0 (Điểm xuất phát)
        if (index === 0) {
            spanName.innerHTML = `<b style="color: #ea4335;">📍 Xuất phát:</b> ${item.name}`;
        } else {
            spanName.textContent = `${index + 1}. ${item.name}`;
        }
        
        // Tạo một thẻ div chứa các nút bấm (hành động)
        const actionGroup = document.createElement('div');

        // Nút "Chọn làm điểm xuất phát" (Chỉ hiện cho các điểm từ số 2 trở đi)
        if (index > 0) {
            const btnSetStart = document.createElement('span');
            btnSetStart.textContent = '🚩'; // Icon lá cờ (hoặc dùng chữ tùy bạn)
            btnSetStart.title = 'Chọn làm điểm xuất phát';
            btnSetStart.style.cursor = 'pointer';
            btnSetStart.style.marginRight = '15px';
            
            // Lệnh hoán đổi vị trí: Cắt nó ra và nhét lên đầu mảng
            btnSetStart.onclick = function() {
                const selectedItem = itineraryList.splice(index, 1)[0]; // Rút điểm đó ra
                itineraryList.unshift(selectedItem); // Đẩy lên vị trí đầu tiên (index 0)
                updateItineraryUI(); // Vẽ lại toàn bộ
            };
            actionGroup.appendChild(btnSetStart);
        }
        
        // Nút Xóa
        const btnDelete = document.createElement('span');
        btnDelete.textContent = '✖';
        btnDelete.title = 'Xóa khỏi lịch trình';
        btnDelete.style.color = 'red';
        btnDelete.style.cursor = 'pointer';
        btnDelete.style.fontWeight = 'bold';
        
        btnDelete.onclick = function() {
            itineraryList.splice(index, 1); 
            updateItineraryUI(); 
        };

        actionGroup.appendChild(btnDelete);
        
        li.appendChild(spanName);
        li.appendChild(actionGroup); // Nhét cụm nút vào dòng
        locationListElement.appendChild(li);

        // --- PHẦN B: CẮM GHIM LÊN BẢN ĐỒ ---
        const marker = L.marker([item.lat, item.lon]).addTo(itineraryLayerGroup);
        
        // Phân biệt Nhãn dán của Điểm xuất phát và Điểm thường
        let tooltipText = index === 0 ? `📍 Xuất phát: ${item.name}` : `${index + 1}. ${item.name}`;
        
        marker.bindTooltip(tooltipText, {
            permanent: true,       
            direction: 'top',      
            offset: [0, -35],      
            className: 'custom-tooltip' 
        });
    });
}

// ==========================================
// 4. GỬI DỮ LIỆU ĐỂ TỐI ƯU VÀ VẼ ĐƯỜNG ĐI
// ==========================================
const btnOptimize = document.querySelector('.btn-optimize');
let currentRouteLayer = null; // Biến này để nhớ cái đường chỉ đỏ, hễ vẽ đường mới thì xóa đường cũ

btnOptimize.addEventListener('click', function() {
    if (itineraryList.length < 2) {
        alert("Vui lòng thêm ít nhất 2 địa điểm!");
        return; 
    }

    const originalText = btnOptimize.textContent;
    btnOptimize.textContent = 'ĐANG TÍNH TOÁN... ⏳';
    btnOptimize.disabled = true;
    btnOptimize.style.backgroundColor = '#ccc';

    // 1. Gửi mảng tọa độ về cho Python (Flask)
    fetch('/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations: itineraryList })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const optimizedList = data.optimized_locations;

            // 2. Cập nhật lại UI Danh sách bên trái
            // Python trả về mảng có điểm đầu trùng điểm cuối (để tạo vòng tròn TSP)
            // Mình sẽ cắt bỏ điểm trùng lặp ở cuối để UI danh sách nhìn gọn gàng
            itineraryList = optimizedList.slice(0, -1); 
            updateItineraryUI();

            // 3. Hỏi OSRM hình dáng đường đi thực tế đi qua các điểm tối ưu này
            // Tạo chuỗi tọa độ kiểu: lon1,lat1;lon2,lat2...
            const coordsString = optimizedList.map(loc => `${loc.lon},${loc.lat}`).join(';');
            
            // Dùng API "route" của OSRM để lấy dữ liệu vẽ (GeoJSON)
            const routeUrl = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

            fetch(routeUrl)
                .then(res => res.json())
                .then(routeData => {
                    if (routeData.code === 'Ok') {
                        // Lấy ra bộ khung xương đường đi
                        const routeGeoJSON = routeData.routes[0].geometry;

                        // Xóa đường đỏ cũ (nếu có) trước khi vẽ đường mới
                        if (currentRouteLayer) {
                            mymap.removeLayer(currentRouteLayer);
                        }

                        // Nhờ Leaflet vẽ một đường Line màu đỏ chuẩn Google
                        currentRouteLayer = L.geoJSON(routeGeoJSON, {
                            style: { color: '#ea4335', weight: 5, opacity: 0.8 }
                        }).addTo(mymap);

                        // Ma thuật điện ảnh: Tự động zoom bản đồ bao trọn cả chuyến đi
                        mymap.fitBounds(currentRouteLayer.getBounds(), { padding: [50, 50] });

                        // Báo cáo thành tích
                        alert(`Đã tối ưu xong! Tổng quãng đường: ${data.total_distance_km} km`);
                    }
                });
        } else {
            alert("Lỗi từ Server: " + data.message);
        }

        // Phục hồi nút bấm
        btnOptimize.textContent = originalText;
        btnOptimize.disabled = false;
        btnOptimize.style.backgroundColor = '#1a73e8';
    })
    .catch(error => {
        console.error("Lỗi:", error);
        alert("Không kết nối được với Python.");
        btnOptimize.textContent = originalText;
        btnOptimize.disabled = false;
        btnOptimize.style.backgroundColor = '#1a73e8';
    });
});