# 🗺️ Tối Ưu Lịch Trình Đi Chơi (TSP Route Optimizer)

Một ứng dụng Web đơn giản giúp bạn tự động tìm ra lộ trình đi chơi ngắn nhất qua nhiều địa điểm khác nhau, ứng dụng thuật toán giải quyết bài toán Người chào hàng (Traveling Salesman Problem - TSP).

## 📑 Mục lục 
- [💡 Ý tưởng dự án](#ý-tưởng-dự-án)
- [🧮 Giới thiệu về bài toán TSP](#giới-thiệu-về-bài-toán-tsp)
- [🧠 Deep dive vào Thuật toán TSP & Hướng phát triển](#deep-dive-vào-thuật-toán-tsp--hướng-phát-triển)
- [🛠️ Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [📂 Cấu trúc dự án](#cấu-trúc-dự-án)
- [🚀 Implement](#implement)
- [📝 Lời nói cuối (Về Vibe Coding))](#lời-nói-cuối-về-vibe-coding)

---
## 💡 Ý tưởng dự án
Mỗi dịp vào các quận trung tâm chơi, mình thường muốn lượn lờ qua rất nhiều tụ điểm ăn uống, cà phê, check-in. Tuy nhiên, Google Maps hiện tại chỉ hỗ trợ chỉ đường theo thứ tự mình nhập vào chứ **không có chức năng tự động sắp xếp lại lộ trình sao cho tiện đường và ngắn nhất**. 

Sau khi tìm hiểu và biết tới bài toán **TSP (Traveling Salesman Problem)**, mình quyết định xây dựng dự án này để tự giải quyết nhu cầu "đi tour 1 ngày" của bản thân, đồng thời thực hành xây dựng một Web App cơ bản.

## 🧮 Giới thiệu về bài toán TSP

Bài toán Người chào hàng (TSP) là một trong những bài toán tối ưu hóa kinh điển nhất trong khoa học máy tính.
* **Đầu vào (Input):** Một danh sách các điểm đến và ma trận khoảng cách (hoặc thời gian di chuyển) giữa tất cả các cặp điểm đó.
* **Đầu ra (Output):** Một lộ trình đi qua tất cả các điểm, mỗi điểm đúng một lần, và quay trở lại điểm xuất phát sao cho tổng quãng đường là ngắn nhất.

## 🧠 Deep dive vào Thuật toán TSP & Hướng phát triển

Trong dự án này, mình bắt đầu tiếp cận bài toán bằng thuật toán nền tảng nhất: **Vét cạn (Brute Force)**. 
Thuật toán này sẽ tính toán toàn bộ các tổ hợp (hoán vị) có thể có của các địa điểm để tìm ra tuyến đường có chi phí (khoảng cách) thấp nhất.

Từ đây, chúng ta mở ra một bài toán con thú vị: **Tìm hoán vị của một tập hợp (Permutation)**. 
* Về mặt thực tế: Mình sử dụng thư viện `itertools.permutations` có sẵn của Python. Vì thư viện này được implement bằng ngôn ngữ C ở bên dưới, nên nó chạy cực kỳ nhanh và tối ưu chi phí tài nguyên hệ thống.
* Về mặt học thuật: Để hiểu rõ bản chất cốt lõi, mình cũng đã tự implement lại thuật toán sinh hoán vị bằng phương pháp **Quay lui (Backtracking)**. Các bạn có thể tham khảo logic này trong file `permutation_with_backtracking.py` đính kèm trong source code.

**🚀 Hướng phát triển thuật toán trong tương lai:**
Thuật toán Brute Force có độ phức tạp thời gian là $O(n!)$, nghĩa là thời gian chạy sẽ bùng nổ cấp số nhân. Thực tế, Brute Force chỉ giải quyết mượt mà được khoảng 10 - 12 địa điểm. Để mở rộng quy mô (Scale-up) Web App này cho những lịch trình phức tạp hơn, mình có các hướng phát triển sau:

1. **Sử dụng thuật toán Held-Karp (Quy hoạch động - Dynamic Programming):** Giúp lưu trữ lại các chặng đường đã tính toán (Memoization) để tránh tính lại. Thuật toán này giúp giảm độ phức tạp từ $O(n!)$ xuống chỉ còn $O(n^2 2^n)$. Nhờ đó, máy tính có thể giải quyết bài toán tối ưu tuyệt đối lên đến khoảng 20 thành phố.
2. **Sử dụng Giải thuật Di truyền (Genetic Algorithm - GA):** Khi số lượng địa điểm vượt quá 20 (ví dụ đi tour xuyên Việt với 50-100 điểm), việc tìm ra kết quả "tuyệt đối" là bất khả thi trong thời gian ngắn. GA là một thuật toán lấy cảm hứng từ quá trình tiến hóa tự nhiên (Lai ghép, Đột biến, Chọn lọc) giúp tìm ra kết quả "đủ tốt" (Gần tối ưu) chỉ trong vài giây.
3. **Các thuật toán xấp xỉ khác (Approximation Algorithms):**
   Ví dụ như thuật toán Kiến (Ant Colony Optimization) hoặc Simulated Annealing cũng là những lựa chọn rất hay để thay thế khi bài toán mở rộng.
   
## 🛠️ Công nghệ sử dụng
Dự án sử dụng các công nghệ nhẹ nhàng nhưng mạnh mẽ để xây dựng trọn vẹn từ Frontend đến Backend:
* **Frontend:** HTML5, CSS3, Vanilla JavaScript.
* **Backend:** Python với framework **Flask** (để tạo Web Server và API nhận dữ liệu).
* **Bản đồ & Định tuyến:** * **Leaflet.js**: Thư viện JavaScript mã nguồn mở để vẽ bản đồ tương tác.
  * **OpenStreetMap (Nominatim)**: Dùng để tìm kiếm tọa độ địa điểm (Geocoding) miễn phí.
  * **OSRM (Open Source Routing Machine)**: Dùng để lấy ma trận khoảng cách đường đi thực tế và vẽ hình dáng đường nối các điểm.

## 📂 Cấu trúc dự án
Dự án được tổ chức theo chuẩn cấu trúc cơ bản của một ứng dụng Flask:

```text
├── app.py                              # File Backend chính, chứa API Flask và thuật toán TSP
├── permutation_with_backtracking.py    # File implement thuật toán backtracking cho bài toán permutation
├── requirements.txt                    # File chứa các library cần thiết
├── static/                             # Nơi chứa các tài nguyên tĩnh
│   ├── css/
│   │   └── style.css                   # File style làm đẹp giao diện
│   └── javascripts/                         
│       └── map.js                      # Toàn bộ logic Frontend: gọi API bản đồ, quản lý UI, gửi dữ liệu
└── templates/                          # Nơi chứa giao diện HTML
    └── index.html                      # Giao diện chính của ứng dụng
```
## 🚀 Implement

### Bước 1: Download repo
```bash
git clone https://github.com/PhYen54/Traveling-salesman.git
```
### Bước 2: Tạo môi trường ảo
```bash
python -m venv venv
```
### Bước 3: Tải các thư viện cần thiết
```bash
pip install -r requirements.txt
```
### Bước 4: Run code
```bash
python app.py
```
## Lời nói cuối (Về vibe coding)
Các code Front end mình sử dụng Gemini pro là chính, quan điểm của mình về vibe coding là những gì AI làm tốt thì hãy để nó làm, những code mình không hài lòng về cấu trúc hoặc phong cách code thì mình sẽ sửa và viết lại

Tuy nhiên với quy mô project này, mình thấy Gemini pro đã làm rất tốt, các bạn có thể xem đây là 1 application đơn giản khi học giải thuật, ứng dụng cho việc tìm lộ trình đi chơi tour 1 ngày tại 1 địa điểm du lịch nào đó hay 1 source code để hiểu 1 app web cơ bản sử dụng các công nghệ như HTML, CSS, Javascripts và Flask như thế nào.

Mình thấy đây là ý tưởng hay để bạn học về web app (học về HTML, CSS, JS, không phải như mình chỉ dùng nó để triển khai cho ý tưởng khi mình học thuật toán :)), bạn có thể thay đổi API map sang Google Map API để hiểu cách làm việc với API tính phí. 

⭐ Nếu bạn thấy dự án này thú vị hoặc giúp ích được cho việc học của bạn, hãy để lại cho mình 1 sao (Star) nhé! Cảm ơn các bạn!
