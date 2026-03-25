from flask import Flask, render_template, request, jsonify
import requests
import itertools 

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

def find_visited(cost):

    cities = list(range(len(cost)))

    permutation_cities = itertools.permutations(cities[1:])
    permutation_cities = [[cities[0]] + list(per) + [cities[0]] for per in permutation_cities]

    min_resolve = float('inf')
    res = []
    for per in permutation_cities:

        cost_visit = 0
        path = [0]
        
        for i in range(len(per[:-1])):

            cost_visit += cost[per[i]][per[i+1]]
            path.append(per[i+1])

        if min_resolve > cost_visit:
            min_resolve = cost_visit
            res = path
        
    return min_resolve, res

@app.route('/optimize', methods=['POST'])
def optimize_route():
    data = request.get_json()
    locations = data.get('locations', [])
    
    if len(locations) < 2:
        return jsonify({"status": "error", "message": "Cần ít nhất 2 điểm!"})

    matrix = get_distance_matrix(locations)
    if matrix is None:
        return jsonify({"status": "error", "message": "Lỗi lấy ma trận."})
    print(matrix)
    min_dist, best_path_indices  = find_visited(matrix)
    
    print("\n--- KẾT QUẢ TỐI ƯU ---")
    print(f"Thứ tự các điểm (Index): {best_path_indices}")
    print(f"Tổng quãng đường: {round(min_dist / 1000, 2)} km")
    
    optimized_locations = []
    for idx in best_path_indices:
        optimized_locations.append(locations[idx])
        
    return jsonify({
        "status": "success",
        "message": "Đã tìm ra đường đi tối ưu!",
        "optimized_locations": optimized_locations,
        "total_distance_km": round(min_dist / 1000, 2)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)