from flask import Flask, render_template, request, jsonify
import requests
import itertools # Thêm thư viện này để sinh hoán vị (Brute Force)

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

def get_distance_matrix(locations):
    coords_list = [f"{loc['lon']},{loc['lat']}" for loc in locations]
    coords_string = ";".join(coords_list)
    url = f"http://router.project-osrm.org/table/v1/driving/{coords_string}?annotations=distance"
    
    try:
        response = requests.get(url)
        data = response.json()
        if data.get('code') == 'Ok':
            return data['distances']
        return None
    except Exception as e:
        print("Lỗi OSRM:", e)
        return None

# ==========================================
# THUẬT TOÁN BRUTE FORCE (VÉT CẠN)
# ==========================================
def solve_tsp_brute_force(matrix):
    num_points = len(matrix)
    
    # Giữ cố định điểm đầu tiên (index 0) làm điểm xuất phát
    # Chỉ hoán vị các điểm còn lại (từ 1 đến num_points - 1)
    points_to_permute = list(range(1, num_points))
    
    min_distance = float('inf') # Khởi tạo khoảng cách nhỏ nhất là vô cực
    best_path = []
    
    # Tạo ra tất cả các trường hợp thứ tự đi
    for perm in itertools.permutations(points_to_permute):
        # Nối điểm xuất phát (0) vào đầu và cuối chu trình
        # Ví dụ một lộ trình: [0, 2, 1, 3, 0]
        current_path = [0] + list(perm) + [0]
        
        current_distance = 0
        # Tính tổng quãng đường của lộ trình này dựa vào ma trận OSRM
        for i in range(len(current_path) - 1):
            from_node = current_path[i]
            to_node = current_path[i+1]
            current_distance += matrix[from_node][to_node]
            
        # Nếu lộ trình này ngắn hơn kỷ lục hiện tại, lưu nó lại
        if current_distance < min_distance:
            min_distance = current_distance
            best_path = current_path
            
    return best_path, min_distance

# ==========================================
# CỔNG NHẬN VÀ XỬ LÝ DỮ LIỆU
# ==========================================
@app.route('/optimize', methods=['POST'])
def optimize_route():
    data = request.get_json()
    locations = data.get('locations', [])
    
    if len(locations) < 2:
        return jsonify({"status": "error", "message": "Cần ít nhất 2 điểm!"})

    # 1. Lấy Ma trận từ OSRM
    matrix = get_distance_matrix(locations)
    if matrix is None:
        return jsonify({"status": "error", "message": "Lỗi lấy ma trận."})

    # 2. Giải bài toán TSP bằng Brute Force
    best_path_indices, min_dist = solve_tsp_brute_force(matrix)
    
    print("\n--- KẾT QUẢ TỐI ƯU ---")
    print(f"Thứ tự các điểm (Index): {best_path_indices}")
    print(f"Tổng quãng đường: {round(min_dist / 1000, 2)} km")
    
    # 3. Sắp xếp lại danh sách địa điểm theo thứ tự tối ưu
    # best_path_indices có dạng [0, 2, 1, 0]
    optimized_locations = []
    for idx in best_path_indices:
        optimized_locations.append(locations[idx])

    # 4. Gửi kết quả về lại cho Giao diện web (Javascript)
    return jsonify({
        "status": "success",
        "message": "Đã tìm ra đường đi tối ưu!",
        "optimized_locations": optimized_locations,
        "total_distance_km": round(min_dist / 1000, 2)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)