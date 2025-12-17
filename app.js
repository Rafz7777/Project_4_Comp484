// ===================================
// CSUN Location Game
// ===================================

// 5 locations (4 chosen + assigned)
const locations = [
    { name: "Student Recreation Center — G4", lat: 34.24023164883705, lng: -118.52489914726301 },
    { name: "University Hall", lat: 34.24000269959381, lng: -118.53208119320719 },
    { name: "Oviatt Library", lat: 34.2403832257916, lng: -118.52931800493607 },
    { name: "Campus Store Complex", lat: 34.237586287214725, lng: -118.52823306803677 },
    { name: "Redwood Hall", lat: 34.242034159613425, lng: -118.5262356108534 }
];

let map;
let currentIndex = 0;
let score = 0;
let historyLog = [];
let startTime;
let timerInterval;
let drawnCircles = [];
let highScore = localStorage.getItem("csun_highscore") || null;

if (highScore) {
    document.getElementById("highscore").innerText = `High Score: ${highScore}s`;
}

// Shuffle locations
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffle(locations);

// ===================================
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 34.2394, lng: -118.5287 },
        zoom: 16.5,
        minZoom: 16.5,
        maxZoom: 16.5,
        mapTypeId: "terrain",
        disableDefaultUI: true,
        draggable: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        styles: [{ featureType: "all", elementType: "labels", stylers: [{ visibility: "off" }] }]
    });

    // Start timer
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);

    askQuestion();

    map.addListener("dblclick", function (event) {
        handleGuess(event.latLng);
    });

    // Reset button
    document.getElementById("reset-button").addEventListener("click", resetGame);
}

// ===================================
function updateTimer() {
    let elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").innerText = `Time: ${elapsed}s`;
}

// ===================================
function askQuestion() {
    if (currentIndex >= locations.length) {
        clearInterval(timerInterval);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const finalMsg = `<div><strong>Final Score: ${score} / ${locations.length}</strong> - Time: ${elapsed}s</div>`;
        document.getElementById("history").innerHTML += finalMsg;
        alert(`Game Over! You got ${score} out of ${locations.length} correct in ${elapsed}s.`);

        // Update high score if perfect
        if (score === locations.length) {
            if (!highScore || elapsed < highScore) {
                highScore = elapsed;
                localStorage.setItem("csun_highscore", highScore);
                document.getElementById("highscore").innerText = `High Score: ${highScore}s`;
            }
        }
        return;
    }

    document.getElementById("status").innerText =
        "Find this location: " + locations[currentIndex].name;
}

// ===================================
function handleGuess(latLng) {
    let target = locations[currentIndex];
    let distance = calculateDistance(latLng.lat(), latLng.lng(), target.lat, target.lng);

    let resultMsg;
    if (distance <= 80) {
        document.getElementById("status").innerText = "Correct! You found " + target.name;
        score++;
        drawCircle(target.lat, target.lng, "green");

        resultMsg = `<div style="color: green;">Question ${currentIndex + 1}: ${target.name} - Correct!</div>`;
    } else {
        document.getElementById("status").innerText = "Incorrect! Correct location shown in red.";
        drawCircle(target.lat, target.lng, "red");

        resultMsg = `<div style="color: red;">Question ${currentIndex + 1}: ${target.name} - Incorrect!</div>`;
    }

    document.getElementById("history").innerHTML += resultMsg;
    currentIndex++;
    document.getElementById("score").innerText = `Score: ${score} / ${currentIndex}`;

    setTimeout(askQuestion, 1200);
}

// ===================================
function drawCircle(lat, lng, color) {
    let circle = new google.maps.Circle({
        map: map,
        center: { lat: lat, lng: lng },
        radius: 50,
        strokeColor: color,
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35
    });

    drawnCircles.push(circle); // store circle

    // Pulse animation
    let radius = 50;
    let growing = true;
    let pulse = setInterval(() => {
        if (growing) {
            radius += 5;
            if (radius >= 70) growing = false;
        } else {
            radius -= 5;
            if (radius <= 50) growing = true;
        }
        circle.setRadius(radius);
    }, 50);

    setTimeout(() => clearInterval(pulse), 1000);
}

// ===================================
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ===================================
function resetGame() {
    // Clear circles
    drawnCircles.forEach(c => c.setMap(null));
    drawnCircles = [];

    // Reset variables
    currentIndex = 0;
    score = 0;
    historyLog = [];
    document.getElementById("history").innerHTML = "";
    document.getElementById("score").innerText = "Score: 0 / 0";
    document.getElementById("status").innerText = "Double click on the map to select a location";

    // Shuffle locations
    shuffle(locations);

    // Reset timer
    clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);

    // Start first question
    askQuestion();
}

// ===================================
window.onload = initMap;
