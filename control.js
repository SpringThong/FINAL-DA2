// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyByv3ZrlHeiQk75U9uQDGsNCGGp84q6JLM",
    authDomain: "do-an-2-cuoi-cung.firebaseapp.com",
    databaseURL: "https://do-an-2-cuoi-cung-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "do-an-2-cuoi-cung",
    storageBucket: "do-an-2-cuoi-cung.firebasestorage.app",
    messagingSenderId: "970350717705",
    appId: "1:970350717705:web:0e347cf2869094564301d8"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
// BIẾN CHO GÀ VÀ CHIẾU SÁNG
let coDangTrongHenGioChoAn = false;
let coDangTrongHenGioChieuSang = false;
let dieuKhienThuCong = false;

//CHẤT LƯỢNG KHÔNG KHÍ ............................................................................

//đọc không khí
database.ref("/temp-hum/a").on("value", function(snapshot) {
    var kk = snapshot.val();
    document.getElementById("khongkhi").innerHTML = kk;
    console.log(kk);
    controlDevices1(kk);
});

// QUẠT HÚT
var q02_on = document.getElementById("q02_on");
var q02_off = document.getElementById("q02_off");
var autoMessage1 = document.getElementById("autoMessage1");
var autoMode1 = false; // Biến để theo dõi chế độ tự động

// VOID CHECK AUTO
function controlDevices1(air) {
    if (air > 250) {
        // Tự động bật đèn và tắt quạt
        firebase.database().ref("/ct").update({
            "fan-a": "ON"
        });
        document.getElementById("q02_img").src = "./img/quat_on.png";
        autoMessage1.innerHTML = "BẬT CHẾ ĐỘ LÀM SẠCH KHÔNG KHÍ TỰ ĐỘNG!!";
        document.getElementById("systemStatus3").innerText = "CẢNH BÁO: KHÔNG KHÍ ĐANG Ô NHIỄM !!!!";
        autoMode1 = true; // Đặt chế độ tự động là true
        blinkWarning("systemStatus3");
        playWarningSound();
        dieuKhienThuCong = false;
    } else {

        if (dieuKhienThuCong) {
            // Đang ở chế độ thủ công
            return;
        }

        // Tự động bật quạt và tắt đèn
        firebase.database().ref("/ct").update({
            "fan-a": "OFF"
        });

        document.getElementById("q02_img").src = "./img/quat_off.png";

        // Trong khoảng 31°C - 35°C, cho phép điều khiển thủ công
        autoMessage1.innerHTML = "BẬT CHẾ ĐỘ THỦ CÔNG: CÓ THỂ ĐIỀU CHỈNH QUA NÚT NHẤN !!";
        document.getElementById("systemStatus3").innerText = "KHÔNG KHÍ ỔN ĐỊNH";
        autoMode1 = false; // Đặt chế độ tự động là false
        stopBlinkWarning("systemStatus3");
        stopWarningSound();
        dieuKhienThuCong = true;

    }
}

database.ref("/ct").get().then((snapshot) => {
    if (snapshot.exists()) {
        console.log(snapshot.val())

        var quat_02_status = snapshot.val()
        if (quat_02_status["fan-a"] == "ON")
            document.getElementById("q02_img").src = "./img/quat_on.png"
        else
            document.getElementById("q02_img").src = "./img/quat_off.png"
    } else
        console.log("No data available!")
})

q02_on.onclick = function() {
    if (autoMode1) {
        alert("Hệ thống đang trong chế độ tự động, không thể điều chỉnh bằng tay.");
        return; // Không thực hiện hành động nếu đang ở chế độ tự động
    }
    document.getElementById("q02_img").src = "./img/quat_on.png";
    firebase.database().ref("/ct").update({
        "fan-a": "ON"
    });
}
q02_off.onclick = function() {
    if (autoMode1) {
        alert("Hệ thống đang trong chế độ tự động, không thể điều chỉnh bằng tay.");
        return; // Không thực hiện hành động nếu đang ở chế độ tự động
    }
    document.getElementById("q02_img").src = "./img/quat_off.png";
    firebase.database().ref("/ct").update({
        "fan-a": "OFF"
    });
}

//TUONG TÁC NGƯỢC LẠI FIREBASE VÀ WEB
database.ref("/ct/fan-a").on("value", function(snapshot) {
    let fanState = snapshot.val();
    if (fanState == "ON")
        document.getElementById(`q02_img`).src = `./img/quat_on.png`
    else
        document.getElementById(`q02_img`).src = `./img/quat_off.png`
});