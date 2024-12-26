// SƯỞI ẤM- LÀM MÁT

// Đọc nhiệt độ
database.ref("/temp-hum/t").on("value", function(snapshot) {
    var nd = snapshot.val();
    document.getElementById("nhietdo").innerHTML = nd;
    console.log(nd);

    // Kiểm tra nhiệt độ để điều khiển tự động
    controlDevices(nd);
});

// Đọc độ ẩm
database.ref("/temp-hum/h").on("value", function(snapshot) {
    var da = snapshot.val();
    document.getElementById("doam").innerHTML = da;
    console.log(da);
    controlDevices2(da);
});

// ĐÈN SƯỞI ẤM
var d01_on = document.getElementById("d01_on");
var d01_off = document.getElementById("d01_off");
var q01_on = document.getElementById("q01_on");
var q01_off = document.getElementById("q01_off");
var autoMessage = document.getElementById("autoMessage");
var autoMode = false; // Biến để theo dõi chế độ tự động

function controlDevices(temp) {
    if (temp < 30) {
        // Tự động bật đèn và tắt quạt
        firebase.database().ref("/ct").update({
            "light-t": "ON",
            "fan-t": "OFF"
        });
        document.getElementById("d01_img").src = "./img/den_on.png";
        document.getElementById("q01_img").src = "./img/quat_off.png";
        autoMessage.innerHTML = "BẬT CHẾ ĐỘ SƯỞI ẤM TỰ ĐỘNG!!";
        document.getElementById("systemStatus1").innerText = "CẢNH BÁO: THỜI TIẾT LẠNH !!!!";
        autoMode = true; // Đặt chế độ tự động là true
        blinkWarning("systemStatus1");
        playWarningSound();
    } else if (temp > 50) {
        // Tự động bật quạt và tắt đèn
        firebase.database().ref("/ct").update({
            "light-t": "OFF",
            "fan-t": "ON"
        });
        document.getElementById("d01_img").src = "./img/den_off.png";
        document.getElementById("q01_img").src = "./img/quat_on.png";
        autoMessage.innerHTML = "BẬT CHẾ ĐỘ LÀM MÁT TỰ ĐỘNG!!";
        document.getElementById("systemStatus1").innerText = "CẢNH BÁO: THỜI TIẾT NÓNG !!!!";
        autoMode = true; // Đặt chế độ tự động là true
        blinkWarning("systemStatus1");
        playWarningSound();
    } else {
        // Trong khoảng 31°C - 35°C, cho phép điều khiển thủ công
        autoMessage.innerHTML = "BẬT CHẾ ĐỘ THỦ CÔNG: CÓ THỂ ĐIỀU CHỈNH QUA NÚT NHẤN !!";
        document.getElementById("systemStatus1").innerText = "NHIỆT ĐỘ ỔN ĐỊNH";
        stopBlinkWarning("systemStatus1");
        autoMode = false; // Đặt chế độ tự động là false
        stopBlinkWarning("systemStatus1");
        stopWarningSound();
    }
}

// Khởi tạo trạng thái ban đầu
database.ref("/ct").get().then((snapshot) => {
    if (snapshot.exists()) {
        var bulb_01_status = snapshot.val();
        if (bulb_01_status["light-t"] == "ON") {
            document.getElementById("d01_img").src = "./img/den_on.png";
        } else {
            document.getElementById("d01_img").src = "./img/den_off.png";
        }

        if (bulb_01_status["fan-t"] == "ON") {
            document.getElementById("q01_img").src = "./img/quat_on.png";
        } else {
            document.getElementById("q01_img").src = "./img/quat_off.png";
        }
    } else {
        console.log("No data available!");
    }
});

// Bật đèn sưởi ấm
d01_on.onclick = function() {
    if (autoMode) {
        alert("Hệ thống đang trong chế độ tự động, không thể điều chỉnh bằng tay.");
        return; // Không thực hiện hành động nếu đang ở chế độ tự động
    }
    document.getElementById("d01_img").src = "./img/den_on.png";
    firebase.database().ref("/ct").update({
        "light-t": "ON"
    });
}

// Tắt đèn sưởi ấm
d01_off.onclick = function() {
    if (autoMode) {
        alert("Hệ thống đang trong chế độ tự động, không thể điều chỉnh bằng tay.");
        return; // Không thực hiện hành động nếu đang ở chế độ tự động
    }
    document.getElementById("d01_img").src = "./img/den_off.png";
    firebase.database().ref("/ct").update({
        "light-t": "OFF"
    });
}

// Tương tác ngược lại từ Firebase và web cho đèn sưởi ấm
database.ref("/ct/light-t").on("value", function(snapshot) {
    let ledState = snapshot.val();
    if (ledState == "ON") {
        document.getElementById(`d01_img`).src = `./img/den_on.png`;
    } else {
        document.getElementById(`d01_img`).src = `./img/den_off.png`;
    }
});

// Bật quạt làm mát
q01_on.onclick = function() {
    if (autoMode) {
        alert("Hệ thống đang trong chế độ tự động, không thể điều chỉnh bằng tay.");
        return; // Không thực hiện hành động nếu đang ở chế độ tự động
    }
    document.getElementById("q01_img").src = "./img/quat_on.png";
    firebase.database().ref("/ct").update({
        "fan-t": "ON"
    });
}

// Tắt quạt làm mát
q01_off.onclick = function() {
    if (autoMode) {
        alert("Hệ thống đang trong chế độ tự động, không thể điều chỉnh bằng tay.");
        return; // Không thực hiện hành động nếu đang ở chế độ tự động
    }
    document.getElementById("q01_img").src = "./img/quat_off.png";
    firebase.database().ref("/ct").update({
        "fan-t": "OFF"
    });
}

// Tương tác ngược lại từ Firebase và web cho quạt làm mát
database.ref("/ct/fan-t").on("value", function(snapshot) {
    let ledState = snapshot.val();
    if (ledState == "ON") {
        document.getElementById(`q01_img`).src = `./img/quat_on.png`;
    } else {
        document.getElementById(`q01_img`).src = `./img/quat_off.png`;
    }
});