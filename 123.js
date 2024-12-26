// Hàm để thực hiện nhấp nháy cảnh báo
function blinkWarning(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.animation = "blink 1s step-start infinite";
    }
}

// Hàm để dừng nhấp nháy cảnh báo
function stopBlinkWarning(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.animation = "none";
    }
}
// Hàm để bật còi cảnh báo
function playWarningSound() {
    const warningSound = document.getElementById("warningSound");
    if (warningSound) {
        warningSound.loop = true; // Bật chế độ lặp lại
        warningSound.play();
    }
}

// Hàm để dừng còi cảnh báo
function stopWarningSound() {
    const warningSound = document.getElementById("warningSound");
    if (warningSound) {
        warningSound.loop = false; // Tắt chế độ lặp lại
        warningSound.pause();
        warningSound.currentTime = 0;
    }
}

// ĐỘ ẨM
function controlDevices2(humi) {
    if (humi < 50) {
        // Tự động bật đèn và tắt quạt
        document.getElementById("systemStatus2").innerText = "CẢNH BÁO: ĐỘ ẨM THẤP!!!!";
        blinkWarning("systemStatus2");
        playWarningSound();
    } else if (humi > 90) {

        document.getElementById("systemStatus2").innerText = "CẢNH BÁO: ĐỘ ẨM CAO !!!!";

        blinkWarning("systemStatus2");
        playWarningSound();
    } else {

        document.getElementById("systemStatus2").innerText = "ĐỘ ẨM ỔN ĐỊNH";
        stopBlinkWarning("systemStatus2");
        stopWarningSound();


    }
}