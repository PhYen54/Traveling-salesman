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
// 3. XỬ LÝ KHI BẤM NÚT "THÊM VÀO LỊCH TRÌNH"
// ==========================================
// Hàm này được gọi khi bạn bấm cái nút màu xanh bên trong Popup
let itineraryList = []; // Mảng lưu trữ dữ liệu
const locationListElement = document.getElementById('location-list');

// Hàm 1: Đưa dữ liệu vào mảng và vẽ lại UI
window.addToItinerary = function(name, lat, lon) {
    itineraryList.push({ name: name, lat: lat, lon: lon });
    mymap.closePopup(); // Đóng popup trên bản đồ
    updateItineraryUI(); // Gọi hàm vẽ lại giao diện
};

// Hàm 2: Vẽ lại danh sách <li> lên màn hình
function updateItineraryUI() {
    locationListElement.innerHTML = ''; // Xóa sạch danh sách cũ

    // Nếu mảng trống
    if (itineraryList.length === 0) {
        locationListElement.innerHTML = '<li style="color: #aaa; border: none; justify-content: center;">Chưa có địa điểm nào được chọn.</li>';
        return;
    }

    // Nếu có điểm, in ra từng dòng
    itineraryList.forEach((item, index) => {
        const li = document.createElement('li');
        
        const spanName = document.createElement('span');
        spanName.textContent = `${index + 1}. ${item.name}`;
        
        const btnDelete = document.createElement('span');
        btnDelete.textContent = '✖';
        btnDelete.style.color = 'red';
        btnDelete.style.cursor = 'pointer';
        btnDelete.style.fontWeight = 'bold';
        
        // Sự kiện xóa điểm
        btnDelete.onclick = function() {
            itineraryList.splice(index, 1); // Xóa khỏi mảng
            updateItineraryUI(); // Vẽ lại giao diện
        };

        li.appendChild(spanName);
        li.appendChild(btnDelete);
        locationListElement.appendChild(li);
    });
}

// ==========================================
// 4. GỬI DỮ LIỆU VỀ BACKEND ĐỂ TỐI ƯU (TSP)
// ==========================================

// Tìm cái nút "TỐI ƯU LỊCH TRÌNH" trong HTML
const btnOptimize = document.querySelector('.btn-optimize');

// Lắng nghe sự kiện click vào nút
btnOptimize.addEventListener('click', function() {
    
    // 1. KIỂM TRA ĐIỀU KIỆN (Validation)
    // Bài toán TSP cần ít nhất 2 điểm (hoặc 3 điểm) mới có ý nghĩa để tối ưu
    if (itineraryList.length < 2) {
        alert("Vui lòng thêm ít nhất 2 địa điểm vào lịch trình để tối ưu!");
        return; 
    }

    // 2. TẠO HIỆU ỨNG CHỜ (Loading)
    // Đổi chữ và khóa nút lại để người dùng không bấm liên tục nhiều lần
    const originalText = btnOptimize.textContent;
    btnOptimize.textContent = 'ĐANG TÍNH TOÁN... ⏳';
    btnOptimize.disabled = true;
    btnOptimize.style.backgroundColor = '#ccc'; // Đổi màu xám

    // 3. ĐÓNG GÓI VÀ GỬI THƯ (Gọi API Backend)
    // Chúng ta sẽ gửi dữ liệu đến một địa chỉ (route) tên là '/optimize' mà Flask sắp tạo
    fetch('/optimize', {
        method: 'POST', // Dùng phương thức POST để gửi dữ liệu đi
        headers: {
            'Content-Type': 'application/json', // Báo cho Python biết đây là dữ liệu JSON
        },
        body: JSON.stringify({ 
            locations: itineraryList // Gói cái mảng của chúng ta vào trong một object
        })
    })
    .then(response => response.json()) // Chờ Python trả lời và dịch nó ra
    .then(data => {
        // 4. XỬ LÝ KẾT QUẢ TRẢ VỀ TỪ PYTHON
        console.log("Kết quả tối ưu từ Server:", data);
        
        // Tạm thời thông báo ra màn hình (Chúng ta sẽ code phần vẽ đường đi sau)
        alert("Thành công! Hãy mở F12 (Console) để xem dữ liệu Python trả về.");

        // Phục hồi lại trạng thái nút bấm
        btnOptimize.textContent = originalText;
        btnOptimize.disabled = false;
        btnOptimize.style.backgroundColor = '#1a73e8';
    })
    .catch(error => {
        // Xử lý nếu có lỗi mạng hoặc Server Python chưa bật
        console.error("Lỗi khi kết nối Backend:", error);
        alert("Không thể kết nối với máy chủ Python. Bạn đã bật Flask chưa?");
        
        // Phục hồi lại trạng thái nút bấm
        btnOptimize.textContent = originalText;
        btnOptimize.disabled = false;
        btnOptimize.style.backgroundColor = '#1a73e8';
    });
});