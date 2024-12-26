//CHIẾU SÁNG....................................................................................
//ĐÈN CHIẾU SÁNG
var d02_on = document.getElementById("d02_on");
var d02_off = document.getElementById("d02_off");
var manualSet = true;


database.ref("/light").get().then((snapshot) => {
    if (snapshot.exists()) {
        console.log(snapshot.val())

        var bulb_02_status = snapshot.val()
        if (bulb_02_status["light-l"] == "ON")
            document.getElementById("d02_img").src = "./img/sang_on.png"
        else
            document.getElementById("d02_img").src = "./img/sang_off.png"
    } else
        console.log("No data available!")
})

d02_on.onclick = function() {
    if (coDangTrongHenGioChieuSang) {
        window.alert("ĐANG TRONG THỜI GIAN HẸN GIỜ CHIẾU SÁNG TỰ ĐỘNG, KHÔNG THỂ ĐIỀU KHIỂN THỦ CÔNG!!")
        return;
    }
    manualSet = true;
    document.getElementById("d02_img").src = "./img/sang_on.png"

    firebase.database().ref("/light").update({
        "light-l": "ON"
    })
}
d02_off.onclick = function() {
    if (coDangTrongHenGioChieuSang) {
        window.alert("ĐANG TRONG THỜI GIAN HẸN GIỜ CHIẾU SÁNG TỰ ĐỘNG, KHÔNG THỂ ĐIỀU KHIỂN THỦ CÔNG!!")
        return;
    }
    document.getElementById("d02_img").src = "./img/sang_off.png"
    manualSet = true;
    firebase.database().ref("/light").update({
        "light-l": "OFF"
    })
}

//TUONG TÁC NGƯỢC LẠI FIREBASE VÀ WEB
database.ref("/light/light-l").on("value", function(snapshot) {
    let ledState = snapshot.val();
    console.log(ledState)
    if (ledState == "ON") {
        document.getElementById(`d02_img`).src = `./img/sang_on.png`

    } else {
        console.log("set OFF'")
        document.getElementById(`d02_img`).src = `./img/sang_off.png`
    }
});

//// HẸN GIỜ BẬT ĐÈN

// Hàm lưu thời gian hẹn giờ lên Firebase
function setWeeklyTimers_1() {
    var weeklyTimers_1 = {
        monday: {
            s: document.getElementById("tt2on").value,
            e: document.getElementById("tt2off").value
        },
        tuesday: {
            s: document.getElementById("tt3on").value,
            e: document.getElementById("tt3off").value
        },
        wednesday: {
            s: document.getElementById("tt4on").value,
            e: document.getElementById("tt4off").value
        },
        thursday: {
            s: document.getElementById("tt5on").value,
            e: document.getElementById("tt5off").value
        },
        friday: {
            s: document.getElementById("tt6on").value,
            e: document.getElementById("tt6off").value
        },
        saturday: {
            s: document.getElementById("tt7on").value,
            e: document.getElementById("tt7off").value
        },
        sunday: {
            s: document.getElementById("tt8on").value,
            e: document.getElementById("tt8off").value
        }
    };

    // Kiểm tra xem tất cả các ngày đã được nhập thời gian hay chưa
    for (var day in weeklyTimers_1) {
        if (!weeklyTimers_1[day].s || !weeklyTimers_1[day].e) {
            alert("VUI LÒNG NHẬP ĐỦ THỜI GIAN CHO TẤT CẢ CÁC NGÀY !!.");
            return;
        }
    }

    // Lưu dữ liệu lên Firebase
    database.ref("/light/timer-l").set(weeklyTimers_1)
        .then(() => {
            manualSet = false;
            coDangTrongHenGioChieuSang = true;
            firebase.database().ref("/light").update({
                "bool-l": true
            });
            alert("HẸN GIỜ ĐÃ ĐƯỢC LƯU THÀNH CÔNG!!");
        })
        .catch((error) => {
            console.error("Lỗi khi lưu dữ liệu: ", error);
        });
}

// Hàm lấy dữ liệu thời gian từ Firebase và hiển thị lên form
async function loadWeeklyTimers_1() {
    database.ref("/light/bool-l").once('value').then((snapshot) => {
        coDangTrongHenGioChieuSang = snapshot.val() || false;
        if (coDangTrongHenGioChieuSang) {
            document.getElementById("deviceStatus_1").innerText = "TRONG THỜI GIAN HẸN GIỜ. KHÔNG THỂ ĐIỀU CHỈNH THỦ CÔNG";
        } else {
            document.getElementById("deviceStatus_1").innerText = "NGOÀI THỜI HẸN GIỜ, CÓ THỂ ĐIỀU CHỈNH THỦ CÔNG";
        }
    });
    database.ref("/light/timer-l").once('value').then((snapshot) => {
        var timers = snapshot.val();

        if (timers) {
            document.getElementById("tt2on").value = timers.monday.s || "KHÔNG CÓ HẾN GIỜ";
            document.getElementById("tt2off").value = timers.monday.e

            document.getElementById("tt3on").value = timers.tuesday.s || "KHÔNG CÓ HẾN GIỜ";
            document.getElementById("tt3off").value = timers.tuesday.e || "KHÔNG CÓ HẾN GIỜ";

            document.getElementById("tt4on").value = timers.wednesday.s || "KHÔNG CÓ HẾN GIỜ";
            document.getElementById("tt4off").value = timers.wednesday.e || "KHÔNG CÓ HẾN GIỜ";

            document.getElementById("tt5on").value = timers.thursday.s || "KHÔNG CÓ HẾN GIỜ";
            document.getElementById("tt5off").value = timers.thursday.e || "KHÔNG CÓ HẾN GIỜ";

            document.getElementById("tt6on").value = timers.friday.s || "KHÔNG CÓ HẾN GIỜ";
            document.getElementById("tt6off").value = timers.friday.e || "KHÔNG CÓ HẾN GIỜ";

            document.getElementById("tt7on").value = timers.saturday.s || "KHÔNG CÓ HẾN GIỜ";
            document.getElementById("tt7off").value = timers.saturday.e || "KHÔNG CÓ HẾN GIỜ";

            document.getElementById("tt8on").value = timers.sunday.s || "KHÔNG CÓ HẾN GIỜ";
            document.getElementById("tt8off").value = timers.sunday.e || "KHÔNG CÓ HẾN GIỜ";
        } else {
            document.getElementById("deviceStatus_1").innerText = "VUI LÒNG HẸN GIỜ HOẶC ĐIỀU KHIỂN THỦ CÔNG ";
        }
    });

    // Kiểm tra trạng thái hẹn giờ

}


// Hàm kiểm tra thời gian hiện tại với thời gian đã hẹn
function checkLightStatus_1() {
    if (!manualSet) {
        console.log(coDangTrongHenGioChieuSang)
        var currentTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        var currentDay = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase(); // Lấy thứ hiện tại

        database.ref("/light/timer-l/" + currentDay).once('value').then((snapshot) => {
            var timers = snapshot.val();

            if (timers && currentTime >= timers.s && currentTime < timers.e) {
                document.getElementById("d02_img").src = "img/sang_on.png"; // Đèn sáng
                document.getElementById("deviceStatus_1").innerText = "TRONG THỜI GIAN HẸN GIỜ. KHÔNG THỂ ĐIỀU CHỈNH THỦ CÔNG";
                firebase.database().ref("/light").update({
                    "light-l": "ON"
                });
                coDangTrongHenGioChieuSang = true;

            } else {
                document.getElementById("d02_img").src = "img/sang_off.png"; // Đèn tắt
                document.getElementById("deviceStatus_1").innerText = "NGOÀI THỜI HẸN GIỜ,CÓ THỂ ĐIỀU CHỈNH THỦ CÔNG";
                firebase.database().ref("/light").update({
                    "light-l": "OFF"
                });
                manualSet = true;
                coDangTrongHenGioChieuSang = false;
                firebase.database().ref("/light").update({
                    "bool-l": false
                });
            }
        });
    }
}
// ĐỘ CHẾ
document.getElementById("cancelScheduleButton").onclick = cancelWeeklyTimers;

// Hàm hủy hẹn giờ
function cancelWeeklyTimers() {
    // Xóa dữ liệu hẹn giờ trong Firebase
    database.ref("/light/timer-l").once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            alert("Không có cài đặt hẹn giờ để hủy!");
            return;
        }

        database.ref("/light/timer-l").remove()
            .then(() => {
                manualSet = true;
                coDangTrongHenGioChieuSang = false;
                firebase.database().ref("/light").update({
                    "bool-l": false
                });
                alert("Đã hủy hẹn giờ thành công!");
                // Cập nhật giao diện người dùng để xóa thời gian hẹn giờ
                clearWeeklyTimersForm();
            })
            .catch((error) => {
                console.error("Lỗi khi hủy hẹn giờ: ", error);
            });
    });
}

// Hàm xóa nội dung của form hẹn giờ
function clearWeeklyTimersForm() {
    document.getElementById("tt2on").value = "";
    document.getElementById("tt2off").value = "";

    document.getElementById("tt3on").value = "";
    document.getElementById("tt3off").value = "";

    document.getElementById("tt4on").value = "";
    document.getElementById("tt4off").value = "";

    document.getElementById("tt5on").value = "";
    document.getElementById("tt5off").value = "";

    document.getElementById("tt6on").value = "";
    document.getElementById("tt6off").value = "";

    document.getElementById("tt7on").value = "";
    document.getElementById("tt7off").value = "";

    document.getElementById("tt8on").value = "";
    document.getElementById("tt8off").value = "";

    firebase.database().ref("/light").update({
        "light-l": "OFF"

    });
    document.getElementById("deviceStatus_1").innerText = "VUI LÒNG HẸN GIỜ HOẶC ĐIỀU KHIỂN THỦ CÔNG ";
}

function updateDeviceStatus_1() {
    var statusRef = database.ref("/light/bool-l");

    statusRef.on('value', (snapshot) => {
        var status = snapshot.val();
        document.getElementById("deviceStatus").innerText = status;
    });
}