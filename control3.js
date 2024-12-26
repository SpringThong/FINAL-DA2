true //gà ăn....................................................................................
//CHO GÀ ĂN
var g01_on = document.getElementById("g01_on");
var g01_off = document.getElementById("g01_off");
var manualSet1 = true;

database.ref("/eat").get().then((snapshot) => {
    if (snapshot.exists()) {
        console.log(snapshot.val())

        var bulb_03_status = snapshot.val()
        if (bulb_03_status["eat-e"] == "ON")
            document.getElementById("g01_img").src = "./img/an_on.png"
        else
            document.getElementById("g01_img").src = "./img/an_off.png"
    } else
        console.log("No data available!")
})

g01_on.onclick = function() {
    if (foodLevel >= 15) {
        window.alert("Thức ăn sắp hết, không thể điều khiển!!");
        return;
    }
    if (coDangTrongHenGioChoAn) {
        window.alert("ĐANG TRONG THỜI GIAN HẸN GIỜ CHO ĂN TỰ ĐỘNG, KHÔNG THỂ ĐIỀU KHIỂN THỦ CÔNG!!");
        return;
    }
    manualSet1 = true;
    document.getElementById("g01_img").src = "./img/an_on.png"

    firebase.database().ref("/eat").update({
        "eat-e": "ON"
    })
}
g01_off.onclick = function() {
    if (foodLevel >= 15) {
        window.alert("Thức ăn sắp hết, không thể điều khiển!!");
        return;
    }
    if (coDangTrongHenGioChoAn) {
        window.alert("ĐANG TRONG THỜI GIAN HẸN GIỜ CHO ĂN TỰ ĐỘNG, KHÔNG THỂ ĐIỀU KHIỂN THỦ CÔNG!!");
        return;
    }
    document.getElementById("g01_img").src = "./img/an_off.png"
    manualSet1 = true;
    firebase.database().ref("/eat").update({
        "eat-e": "OFF"
    })
}

//TUONG TÁC NGƯỢC LẠI FIREBASE VÀ WEB
database.ref("/eat/eat-e").on("value", function(snapshot) {
    let ledState = snapshot.val();
    console.log(ledState)
    if (ledState == "ON") {
        if (foodLevel >= 15) {
            firebase.database().ref("/eat").update({
                "eat-e": "OFF"
            });
            document.getElementById("g01_img").src = `./img/an_off.png`
        } else {
            document.getElementById(`g01_img`).src = `./img/an_on.png`
        }
    } else {
        console.log("set OFF'")
        document.getElementById(`g01_img`).src = `./img/an_off.png`
    }
});



//// HẸN GIỜ CHO ĂN 

// Hàm lưu thời gian hẹn giờ lên Firebase
function setWeeklyTimers() {
    var weeklyTimers = {
        monday: {
            s: document.getElementById("t2on").value,
            e: document.getElementById("t2off").value
        },
        tuesday: {
            s: document.getElementById("t3on").value,
            e: document.getElementById("t3off").value
        },
        wednesday: {
            s: document.getElementById("t4on").value,
            e: document.getElementById("t4off").value
        },
        thursday: {
            s: document.getElementById("t5on").value,
            e: document.getElementById("t5off").value
        },
        friday: {
            s: document.getElementById("t6on").value,
            e: document.getElementById("t6off").value
        },
        saturday: {
            s: document.getElementById("t7on").value,
            e: document.getElementById("t7off").value
        },
        sunday: {
            s: document.getElementById("t8on").value,
            e: document.getElementById("t8off").value
        }
    };

    // Kiểm tra xem tất cả các ngày đã được nhập thời gian hay chưa
    for (var day in weeklyTimers) {
        if (!weeklyTimers[day].s || !weeklyTimers[day].e) {
            alert("VUI LÒNG NHẬP ĐỦ THỜI GIAN CHO TẤT CẢ CÁC NGÀY !!.");
            return;
        }
    }

    // Lưu dữ liệu lên Firebase
    database.ref("/eat/timer-e").set(weeklyTimers)
        .then(() => {
            manualSet1 = false;
            coDangTrongHenGioChoAn = true;
            firebase.database().ref("/eat").update({
                "bool-e": true
            });
            alert("HẸN GIỜ ĐÃ ĐƯỢC LƯU THÀNH CÔNG!!");
            checkFoodLevelAndCancelSchedule(); // Add this line
        })
        .catch((error) => {
            console.error("Lỗi khi lưu dữ liệu: ", error);
        });
}
// Hàm lấy dữ liệu thời gian từ Firebase và hiển thị lên form
// Hàm lấy dữ liệu thời gian từ Firebase và hiển thị lên form
async function loadWeeklyTimers() {
    try {
        // Lấy trạng thái hẹn giờ từ Firebase
        const runningSnapshot = await database.ref("/eat/bool-e").once('value');
        coDangTrongHenGioChoAn = runningSnapshot.val() || false;

        // Cập nhật giao diện với trạng thái đã lấy
        document.getElementById("deviceStatus").innerText = coDangTrongHenGioChoAn ?
            "TRONG THỜI GIAN HẸN GIỜ. KHÔNG THỂ ĐIỀU CHỈNH THỦ CÔNG" :
            "NGOÀI THỜI HẸN GIỜ, CÓ THỂ ĐIỀU CHỈNH THỦ CÔNG";

        // Lấy thời gian hẹn gi��� từ Firebase và cập nhật form
        const timersSnapshot = await database.ref("/eat/timer-e").once('value');
        var timers = timersSnapshot.val();

        if (timers) {
            document.getElementById("t2on").value = timers.monday.s || "";
            document.getElementById("t2off").value = timers.monday.e || "";

            document.getElementById("t3on").value = timers.tuesday.s || "";
            document.getElementById("t3off").value = timers.tuesday.e || "";

            document.getElementById("t4on").value = timers.wednesday.s || "";
            document.getElementById("t4off").value = timers.wednesday.e || "";

            document.getElementById("t5on").value = timers.thursday.s || "";
            document.getElementById("t5off").value = timers.thursday.e || "";

            document.getElementById("t6on").value = timers.friday.s || "";
            document.getElementById("t6off").value = timers.friday.e || "";

            document.getElementById("t7on").value = timers.saturday.s || "";
            document.getElementById("t7off").value = timers.saturday.e || "";

            document.getElementById("t8on").value = timers.sunday.s || "";
            document.getElementById("t8off").value = timers.sunday.e || "";
        } else {
            document.getElementById("deviceStatus").innerText = "VUI LÒNG HẸN GIỜ HOẶC ĐIỀU KHIỂN THỦ CÔNG";
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ Firebase:", error);
    }
}

// Hàm kiểm tra thời gian hiện tại với thời gian đã hẹn
async function checkLightStatus() {
    try {
        if (!manualSet1) {
            var currentTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            var currentDay = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase(); // Lấy thứ hiện tại

            const snapshot = await database.ref("/eat/timer-e/" + currentDay).once('value');
            var timers = snapshot.val();

            if (timers && currentTime >= timers.s && currentTime < timers.e) {
                if (foodLevel >= 15) {
                    firebase.database().ref("/eat").update({
                        "eat-e": "OFF"
                    });
                    document.getElementById("g01_img").src = "img/an_off.png";
                    document.getElementById("deviceStatus").innerText = "THỨC ĂN SẮP HẾT, KHÔNG THỂ ĐIỀU KHIỂN!!";
                    coDangTrongHenGioChoAn = false;
                } else {
                    document.getElementById("g01_img").src = "img/an_on.png"; // ăn sáng
                    document.getElementById("deviceStatus").innerText = "TRONG THỜI GIAN HẸN GIỜ. KHÔNG THỂ ĐIỀU CHỈNH THỦ CÔNG";
                    coDangTrongHenGioChoAn = true;

                    // Cập nhật Firebase trạng thái
                    await firebase.database().ref("/eat").update({
                        "eat-e": "ON"
                    });
                }
            } else {
                document.getElementById("g01_img").src = "img/an_off.png"; // GÀ tắt
                document.getElementById("deviceStatus").innerText = "NGOÀI THỜI HẸN GIỜ, CÓ THỂ ĐIỀU CHỈNH THỦ CÔNG";
                coDangTrongHenGioChoAn = false;

                // Cập nhật Firebase trạng thái
                await firebase.database().ref("/eat").update({
                    "eat-e": "OFF",
                    "bool-e": false
                });
            }
        }
    } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái thời gian:", error);
    }
}

// Sự kiện khi tải trang
window.onload = async function() {
    try {
        console.log("Bắt đầu tải trạng thái từ Firebase...");

        // Tải trạng thái cho hẹn giờ
        await loadWeeklyTimers();

        // Kiểm tra trạng thái sau khi tải
        checkLightStatus(); // Phần cho ăn

        // Thiết lập kiểm tra định kỳ mỗi giây
        setInterval(() => {
            checkLightStatus();
        }, 1000);
        updateFoodLevelStatus();
        console.log("Hoàn tất tải trạng thái từ Firebase.");
    } catch (error) {
        console.error("Lỗi khi tải trạng thái từ Firebase:", error);
        // Cập nhật giao diện lỗi nếu xảy ra sự cố
        document.getElementById("deviceStatus").innerText = "LỖI KHI TẢI TRẠNG THÁI!";
    }
};



// Hàm kiểm tra thời gian hiện tại với thời gian đã hẹn
function checkLightStatus() {
    if (!manualSet1) {
        console.log(coDangTrongHenGioChoAn)
        var currentTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        var currentDay = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase(); // Lấy thứ hiện tại

        database.ref("/eat/timer-e/" + currentDay).once('value').then((snapshot) => {
            var timers = snapshot.val();

            if (timers && currentTime >= timers.s && currentTime < timers.e) {
                document.getElementById("g01_img").src = "img/an_on.png"; // ăn sáng
                document.getElementById("deviceStatus").innerText = "TRONG THỜI GIAN HẸN GIỜ. KHÔNG THỂ ĐIỀU CHỈNH THỦ CÔNG";
                firebase.database().ref("/eat").update({
                    "eat-e": "ON"
                });
                coDangTrongHenGioChoAn = true;

            } else {
                document.getElementById("g01_img").src = "img/an_off.png"; // GÀ tắt
                document.getElementById("deviceStatus").innerText = "NGOÀI THỜI HẸN GIỜ,CÓ THỂ ĐIỀU CHỈNH THỦ CÔNG";
                firebase.database().ref("/eat").update({
                    "eat-e": "OFF"
                });
                manualSet1 = true;
                coDangTrongHenGioChoAn = false;
                firebase.database().ref("/eat").update({
                    "bool-e": false
                });
            }
        });
    }
}
// ĐỘ CHẾ
//document.getElementById("cancelScheduleButton1").onclick = cancelWeeklyTimers1;

// Hàm hủy hẹn giờ
function cancelWeeklyTimers1() {
    // Xóa dữ liệu hẹn giờ trong Firebase
    database.ref("/eat/timer-e").once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            alert("Không có cài đặt hẹn giờ để hủy!");
            return;
        }

        database.ref("/eat/timer-e").remove()
            .then(() => {
                manualSet1 = true;
                coDangTrongHenGioChoAn = false;
                firebase.database().ref("/eat").update({
                    "bool-e": false
                });
                alert("Đã hủy hẹn giờ thành công!");
                // Cập nhật giao diện người dùng để xóa thời gian hẹn giờ
                clearWeeklyTimersForm1();
            })
            .catch((error) => {
                console.error("Lỗi khi hủy hẹn giờ: ", error);
            });
    });
}

// Hàm xóa nội dung của form hẹn giờ
function clearWeeklyTimersForm1() {
    document.getElementById("t2on").value = "";
    document.getElementById("t2off").value = "";

    document.getElementById("t3on").value = "";
    document.getElementById("t3off").value = "";

    document.getElementById("t4on").value = "";
    document.getElementById("t4off").value = "";

    document.getElementById("t5on").value = "";
    document.getElementById("t5off").value = "";

    document.getElementById("t6on").value = "";
    document.getElementById("t6off").value = "";

    document.getElementById("t7on").value = "";
    document.getElementById("t7off").value = "";

    document.getElementById("t8on").value = "";
    document.getElementById("t8off").value = "";

    firebase.database().ref("/eat").update({
        "eat-e": "OFF"
    });
    document.getElementById("deviceStatus").innerText = "VUI LÒNG HẸN GIỜ HOẶC ĐIỀU KHIỂN THỦ CÔNG ";
}

function updateDeviceStatus() {
    var statusRef = database.ref("/eat/timer-e");

    statusRef.on('value', (snapshot) => {
        var status = snapshot.val();
        document.getElementById("deviceStatus").innerText = status;
    });
}

var foodLevel = 0; // Variable to store the current food level

// Function to update food level status
function updateFoodLevelStatus() {
    database.ref("/eat/sonic").on("value", function(snapshot) {
        foodLevel = snapshot.val();
        let foodLevelImg = document.getElementById("foodLevelImg");
        let foodLevelMessage = document.getElementById("foodLevelMessage");

        if (foodLevel < 15) {
            foodLevelImg.src = "img/food_full.png";
            foodLevelMessage.innerText = "Thức ăn vẫn đủ";
            foodLevelMessage.style.color = "green";
        } else {
            foodLevelImg.src = "img/food_empty.png";
            foodLevelMessage.innerText = "Thức ăn sắp hết, hãy thêm thức ăn";
            foodLevelMessage.style.color = "red";
            firebase.database().ref("/eat").update({
                "eat-e": "OFF"
            });
            document.getElementById("g01_img").src = `./img/an_off.png`;
        }
        checkFoodLevelAndCancelSchedule(); // Add this line
    });
}

document.getElementById("startScheduleButton").onclick = function() {
    if (foodLevel >= 15) {
        window.alert("THỨC ĂN SẮP HẾT, KHÔNG THỂ ĐIỀU KHIỂN!!");
        return;
    }
    setWeeklyTimers();
};





// Call the function to update food level status
updateFoodLevelStatus();
window.onload = async function() {
    try {
        console.log("Bắt đầu tải trạng thái từ Firebase...");

        // Tải trạng thái cho chiếu sáng và cho ăn đồng thời
        await Promise.all([loadWeeklyTimers_1(), loadWeeklyTimers()]);

        // Kiểm tra trạng thái sau khi tải
        setInterval(() => {
            checkLightStatus();
            checkLightStatus_1();
        }, 1000);


        // Thiết lập kiểm tra định kỳ mỗi giây
        setInterval(() => {
            checkLightStatus();
            checkLightStatus_1();
        }, 1000);

        // Gán sự kiện cho nút hủy hẹn giờ
        document.getElementById("cancelScheduleButton").onclick = cancelWeeklyTimers;
        document.getElementById("cancelScheduleButton1").onclick = function() {
            if (foodLevel >= 15) {
                window.alert("THỨC ĂN SẮP HẾT, KHÔNG THỂ ĐIỀU KHIỂN!!");
                return;
            }
            cancelWeeklyTimers1();
        };

        console.log("Hoàn tất tải trạng thái từ Firebase.");
    } catch (error) {
        console.error("Lỗi khi tải trạng thái từ Firebase:", error);
        // Cập nhật giao diện lỗi nếu xảy ra sự cố
        document.getElementById("deviceStatus").innerText = "LỖI KHI TẢI TRẠNG THÁI!";
        document.getElementById("deviceStatus_1").innerText = "LỖI KHI TẢI TRẠNG THÁI!";
    }
};