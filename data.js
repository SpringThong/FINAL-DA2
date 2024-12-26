let isViewingOldData = false; // Biến toàn cục để kiểm tra xem có đang xem dữ liệu cũ hay không
let temperatureRef, humidityRef, airQualityRef;
let intervalId; // Biến lưu trữ ID của setInterval để dừng nó khi xem dữ liệu cũ
function getLocalTime() {
    // Chuyển đổi thời gian UTC sang thời gian theo múi giờ địa phương
    const localDate = new Date();
    const timeZoneOffset = localDate.getTimezoneOffset() * 60000; // Múi giờ offset tính bằng mili giây
    return new Date(localDate.getTime() - timeZoneOffset);
}
document.addEventListener("DOMContentLoaded", function() {
    var ctx = document.getElementById('dailyDataChart').getContext('2d');
    var dailyDataChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 24 }, (_, i) => i + ":00"),
            datasets: [{
                    label: 'Nhiệt độ (°C)',
                    data: new Array(24).fill(null),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Độ ẩm (%)',
                    data: new Array(24).fill(null),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Chất lượng không khí (AQI)',
                    data: new Array(24).fill(null),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'giá trị trung bình đo được trong ngày'
                    }
                },
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 400,
                    title: {
                        display: true,
                        text: 'Giá trị'
                    }
                }
            }
        }
    });

    // Lấy dữ liệu từ Firebase và cập nhật biểu đồ hàng giờ
    function updateChartData(data, datasetIndex, hour) {
        if (dailyDataChart.data.datasets[datasetIndex].data[hour] === null) {
            dailyDataChart.data.datasets[datasetIndex].data[hour] = data;
        } else {
            // Tính toán giá trị trung bình trong một giờ
            const existingValue = dailyDataChart.data.datasets[datasetIndex].data[hour];
            dailyDataChart.data.datasets[datasetIndex].data[hour] = (existingValue + data) / 2;
        } //
        dailyDataChart.update();

        // Lưu giá trị trung bình vào Firebase
        const today = getLocalTime().toISOString().split('T')[0];
        const refPath = `/h/${today}/${hour}`;
        const dataKey = ["Temperature", "Humidity", "AirQuality"][datasetIndex];
        firebase.database().ref(refPath).update({
            [dataKey]: dailyDataChart.data.datasets[datasetIndex].data[hour]
        });
    }

    // Lắng nghe và cập nhật dữ liệu từ Firebase
    // Thay đổi hàm cập nhật dữ liệu từ Firebase để tính toán mà không cập nhật biểu đồ nếu đang xem dữ liệu cũ
    temperatureRef = firebase.database().ref('/temp-hum/t1').on('value', function(snapshot) {
        if (isViewingOldData) return; // Không xử lý nếu đang xem dữ liệu cũ

        const temperatureData = snapshot.val();
        const currentHour = new Date().getHours();
        updateChartData(temperatureData, 0, currentHour);
    });

    humidityRef = firebase.database().ref('/temp-hum/h1').on('value', function(snapshot) {
        if (isViewingOldData) return; // Không xử lý nếu đang xem dữ liệu cũ

        const humidityData = snapshot.val();
        const currentHour = new Date().getHours();
        updateChartData(humidityData, 1, currentHour);
    });

    airQualityRef = firebase.database().ref('/temp-hum/a1').on('value', function(snapshot) {
        if (isViewingOldData) return; // Không xử lý nếu đang xem dữ liệu cũ

        const airQualityData = snapshot.val();
        const currentHour = new Date().getHours();
        updateChartData(airQualityData, 2, currentHour);
    });


    // Lưu giá trị trung bình hàng giờ vào Firebase
    function storeHourlyAverage(hour) {
        const today = getLocalTime().toISOString().split('T')[0];
        dailyDataChart.data.datasets.forEach((dataset, index) => {
            const dataKey = ["Temperature", "Humidity", "AirQuality"][index];
            const refPath = `/h/${today}/${hour}`;
            const dataValue = dataset.data[hour];
            if (dataValue !== null) {
                firebase.database().ref(refPath).update({
                    [dataKey]: dataValue
                });
            }
        });
    }

    // Tính toán và cập nhật giá trị trung bình mỗi giờ
    function calculateAndStoreHourlyAverage() {
        if (isViewingOldData) return; // Không tính toán nếu đang xem dữ liệu cũ

        const currentHour = new Date().getHours();
        dailyDataChart.data.datasets.forEach((dataset, index) => {
            const dataPoints = dataset.data.slice(0, currentHour + 1).filter(value => value !== null);
            if (dataPoints.length > 0) {
                const avg = dataPoints.reduce((sum, value) => sum + value, 0) / dataPoints.length;
                dailyDataChart.data.datasets[index].data[currentHour] = avg;
            }
        });
        dailyDataChart.update();
        storeHourlyAverage(currentHour);
    }

    function calculateAndStoreDailyAverage(date) {
        const refPath = `/h/${date}`;
        firebase.database().ref(refPath).once('value', function(snapshot) {
            const hourlyData = snapshot.val();
            if (hourlyData) {
                let temperatureSum = 0,
                    humiditySum = 0,
                    airQualitySum = 0;
                let count = 0;

                // Tính trung bình từ dữ liệu hàng giờ
                Object.keys(hourlyData).forEach(hour => {
                    const hourData = hourlyData[hour];
                    if (hourData) {
                        if (hourData.Temperature !== undefined) {
                            temperatureSum += hourData.Temperature;
                        }
                        if (hourData.Humidity !== undefined) {
                            humiditySum += hourData.Humidity;
                        }
                        if (hourData.AirQuality !== undefined) {
                            airQualitySum += hourData.AirQuality;
                        }
                        count++;
                    }
                });

                if (count > 0) {
                    const dailyAverage = {
                        Temperature: temperatureSum / count,
                        Humidity: humiditySum / count,
                        AirQuality: airQualitySum / count,
                    };

                    // Lưu dữ liệu trung bình ngày vào Firebase
                    firebase.database().ref(`/d/${date}`).set(dailyAverage);
                    console.log(`Lưu trung bình ngày thành công cho ${date}:`, dailyAverage);
                } else {
                    console.log(`Không có dữ liệu hàng giờ để tính trung bình ngày cho ${date}`);
                }
            } else {
                console.log(`Không tìm thấy dữ liệu hàng giờ cho ${date}`);
            }
        });
    }


    // Tính toán giá trị trung bình khi đến giờ mới
    intervalId = setInterval(function() {
        const now = new Date();
        if (now.getMinutes() === 0 && now.getSeconds() === 0) {
            calculateAndStoreHourlyAverage();
        }

        // Lưu dữ liệu trung bình khi kết thúc một ngày
        if (now.getHours() === 23 && now.getMinutes() === 59 && now.getSeconds() === 59) {
            storeDailyAverage();
        }
    }, 1000);

    // Hàm được gọi vào cuối mỗi ngày để tính và lưu trung bình ngày
    function storeDailyAverage() {
        const today = getLocalTime().toISOString().split('T')[0]; // Ngày hiện tại
        const refPath = `/h/${today}`; // Dữ liệu hàng giờ của ngày hiện tại

        firebase.database().ref(refPath).once('value', function(snapshot) {
            const hourlyData = snapshot.val();
            if (hourlyData) {
                let temperatureSum = 0,
                    humiditySum = 0,
                    airQualitySum = 0;
                let count = 0;

                // Duyệt qua tất cả dữ liệu hàng giờ để tính trung bình
                Object.keys(hourlyData).forEach(hour => {
                    const hourData = hourlyData[hour];
                    if (hourData) {
                        if (hourData.Temperature !== undefined) {
                            temperatureSum += hourData.Temperature;
                        }
                        if (hourData.Humidity !== undefined) {
                            humiditySum += hourData.Humidity;
                        }
                        if (hourData.AirQuality !== undefined) {
                            airQualitySum += hourData.AirQuality;
                        }
                        count++;
                    }
                });

                if (count > 0) {
                    const dailyAverage = {
                        Temperature: temperatureSum / count,
                        Humidity: humiditySum / count,
                        AirQuality: airQualitySum / count
                    };

                    // Lưu dữ liệu trung bình ngày vào Firebase
                    firebase.database().ref(`/d/${today}`).set(dailyAverage);
                    console.log(`Trung bình ngày đã lưu cho ${today}:`, dailyAverage);
                } else {
                    console.log(`Không có dữ liệu để tính trung bình ngày cho ${today}`);
                }
            } else {
                console.log(`Không tìm thấy dữ liệu hàng giờ cho ${today}`);
            }
        });
    }

    // Hàm gọi tự động vào cuối ngày (23:59:59)
    setInterval(function() {
        const now = new Date();
        if (now.getHours() === 23 && now.getMinutes() === 59 && now.getSeconds() === 59) {
            storeDailyAverage();
        }
    }, 1000);


    // Tải lại dữ liệu giờ trung bình từ Firebase khi reload trang
    function loadHourlyAverage() {
        const today = getLocalTime().toISOString().split('T')[0];
        const refPath = `/h/${today}`;
        firebase.database().ref(refPath).once('value', function(snapshot) {
            const data = snapshot.val();
            if (data) {
                Object.keys(data).forEach(hour => {
                    const hourData = data[hour];
                    if (hourData.Temperature) {
                        dailyDataChart.data.datasets[0].data[hour] = hourData.Temperature;
                    }
                    if (hourData.Humidity) {
                        dailyDataChart.data.datasets[1].data[hour] = hourData.Humidity;
                    }
                    if (hourData.AirQuality) {
                        dailyDataChart.data.datasets[2].data[hour] = hourData.AirQuality;
                    }
                });
                dailyDataChart.update();
            }
        });
    }

    // Gọi hàm loadHourlyAverage khi trang được load
    loadHourlyAverage();

    /// Hàm hiển thị dữ liệu của ngày cũ
    function fetchDailyAverage() {
        const selectedDate = document.getElementById("selectedDate").value;
        if (!selectedDate) return alert("Vui lòng chọn ngày!");

        isViewingOldData = true; // Đánh dấu là đang xem dữ liệu cũ

        // Làm sạch dữ liệu biểu đồ trước khi cập nhật
        dailyDataChart.data.datasets.forEach(dataset => {
            dataset.data = []; // Xóa toàn bộ dữ liệu trước đó
        });

        const refPath = `/h/${selectedDate}`; // Đường dẫn mới
        firebase.database().ref(refPath).once('value', function(snapshot) {
            const data = snapshot.val();

            if (data) {
                // Lấy dữ liệu từng giờ
                Object.keys(data).forEach(hour => {
                    const hourData = data[hour];
                    if (hourData.Temperature !== undefined) {
                        dailyDataChart.data.datasets[0].data[hour] = hourData.Temperature;
                    }
                    if (hourData.Humidity !== undefined) {
                        dailyDataChart.data.datasets[1].data[hour] = hourData.Humidity;
                    }
                    if (hourData.AirQuality !== undefined) {
                        dailyDataChart.data.datasets[2].data[hour] = hourData.AirQuality;
                    }
                });

                dailyDataChart.update();
            } else {
                alert("Không có dữ liệu cho ngày đã chọn.");
            }

            // Thêm nút quay lại dữ liệu thời gian thực
            document.getElementById("realTimeButton").style.display = 'block';
        });
    }

    function returnToRealTime() {
        isViewingOldData = false;

        // Xóa dữ liệu thời gian cũ trên biểu đồ
        dailyDataChart.data.datasets.forEach(dataset => {
            dataset.data = new Array(24).fill(null);
        });
        dailyDataChart.update();

        // Xóa ngày cũ đã chọn
        document.getElementById("selectedDate").value = "";

        loadHourlyAverage(); // Load lại dữ liệu thời gian thực
        startRealTimeUpdates(); // Khôi phục cập nhật thời gian thực
        document.getElementById("realTimeButton").style.display = 'none';
    }

    // Khởi động lại cập nhật thời gian thực
    function startRealTimeUpdates() {
        intervalId = setInterval(function() {
            const now = new Date();
            if (now.getMinutes() === 0 && now.getSeconds() === 0) {
                calculateAndStoreHourlyAverage();
            }

            // Lưu dữ liệu trung bình khi kết thúc một ngày
            if (now.getHours() === 23 && now.getMinutes() === 59 && now.getSeconds() === 59) {
                storeDailyAverage();
            }
        }, 1000);

        temperatureRef = firebase.database().ref('/temp-hum/t1').on('value', function(snapshot) {
            const temperatureData = snapshot.val();
            const currentHour = new Date().getHours();
            updateChartData(temperatureData, 0, currentHour);
        });

        humidityRef = firebase.database().ref('/temp-hum/h1').on('value', function(snapshot) {
            const humidityData = snapshot.val();
            const currentHour = new Date().getHours();
            updateChartData(humidityData, 1, currentHour);
        });

        airQualityRef = firebase.database().ref('/aqi/a1').on('value', function(snapshot) {
            const airQualityData = snapshot.val();
            const currentHour = new Date().getHours();
            updateChartData(airQualityData, 2, currentHour);
        });
    }

    function exportToExcel() {
        const selectedDate = document.getElementById("selectedDate").value;
        if (!selectedDate) return alert("Vui lòng chọn ngày!");

        const refPath = `/h/${selectedDate}`;
        firebase.database().ref(refPath).once('value', function(snapshot) {
            const data = snapshot.val();
            if (data) {
                const wb = XLSX.utils.book_new();

                // Tạo tiêu đề và dữ liệu Excel
                const wsData = [
                    ["Ngày", "Giờ", "Nhiệt độ (°C)", "Độ ẩm (%)", "Chất lượng không khí (AQI)"]
                ];

                Object.keys(data).forEach(hour => {
                    const hourData = data[hour];
                    wsData.push([
                        selectedDate, // Ngày
                        `${hour}:00`, // Giờ
                        hourData.Temperature || "", // Nhiệt độ
                        hourData.Humidity || "", // Độ ẩm
                        hourData.AirQuality || "" // Chất lượng không khí
                    ]);
                });

                // Tạo sheet và ghi file Excel
                const ws = XLSX.utils.aoa_to_sheet(wsData);
                XLSX.utils.book_append_sheet(wb, ws, "Daily Data");
                XLSX.writeFile(wb, `ThongKeDuLieu_${selectedDate}.xlsx`);
            } else {
                alert("Không có dữ liệu cho ngày được chọn.");
            }
        });
    }

    function exportMonthlyAverageToExcel() {
        const selectedMonth = document.getElementById("selectedMonth").value;
        if (!selectedMonth) return alert("Vui lòng chọn tháng!");

        const [year, month] = selectedMonth.split("-");
        const daysInMonth = new Date(year, month, 0).getDate();

        const wb = XLSX.utils.book_new();
        const wsData = [
            ["Ngày", "Nhiệt độ trung bình (°C)", "Độ ẩm trung bình (%)", "Chất lượng không khí trung bình (AQI)"]
        ];

        let completedDays = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const refPath = `/d/${currentDate}`;

            firebase.database().ref(refPath).once('value', function(snapshot) {
                const data = snapshot.val();
                if (data) {
                    wsData.push([
                        currentDate, // Ngày
                        data.Temperature || "", // Nhiệt độ trung bình
                        data.Humidity || "", // Độ ẩm trung bình
                        data.AirQuality || "" // Chất lượng không khí trung bình
                    ]);
                } else {
                    // Nếu không có dữ liệu, thêm hàng trống
                    wsData.push([currentDate, "", "", ""]);
                }

                completedDays++;

                // Khi đã xử lý hết các ngày, xuất file Excel
                if (completedDays === daysInMonth) {
                    const ws = XLSX.utils.aoa_to_sheet(wsData);
                    XLSX.utils.book_append_sheet(wb, ws, "Monthly Averages");
                    XLSX.writeFile(wb, `ThongKeTrungBinh_${selectedMonth}.xlsx`);
                }
            });
        }
    }

    // Gắn sự kiện cho các nút
    document.querySelector("button[onclick='fetchDailyAverage()']").addEventListener('click', fetchDailyAverage);
    document.querySelector("button[onclick='exportToExcel()']").addEventListener('click', exportToExcel);
    document.querySelector("button[onclick='exportMonthlyAverageToExcel()']").addEventListener('click', exportMonthlyAverageToExcel);
    document.getElementById("realTimeButton").addEventListener('click', returnToRealTime);

    // Khởi động lại việc cập nhật dữ liệu thời gian thực khi trang đã tải xong
    startRealTimeUpdates();
});

// Khởi động lại việc cập nhật dữ liệu thời gian thực khi trang đã tải xong
startRealTimeUpdates();