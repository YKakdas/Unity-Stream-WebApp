const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('videoId');
const amazonVideoUrl = `https://vrisb-streaming-bucket.s3.us-east-2.amazonaws.com/${videoId}.mp4`

let player;

setup();

async function setup() {
    player = videojs('Video');
    player.src(amazonVideoUrl);

    await populateNotes();
}

async function populateNotes() {
    const markers = [];

    const videoInfo = await getVideo();
    const notesJson = await getAllNotes();

    const notes = notesJson;
    const videoStartTime = videoInfo.videoStartTime;

    notes.sort((a, b) => a.actualTime - b.actualTime);

    var count = 0;
    notes.forEach(note => {
        $.get("http://localhost/stream/saved/saved_annotation_inner.html", function (result) {
            $("#notes").append(result);

            var noteRoot = document.getElementById("notes").lastChild;
            noteRoot.id = `note-${count}`;
            count++;

            const textarea = noteRoot.getElementsByClassName("textarea-saved")[0];
            textarea.readOnly = true;
            textarea.value = note.content;

            const timestamp = (note.actualTime - videoStartTime) / 1000;
            const timestampField = noteRoot.getElementsByClassName("timestamp-button")[0];

            timestampField.addEventListener('click', function () {
                player.currentTime(timestamp);
                document.getElementById('player').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });

            timestampField.innerText = formatTime(timestamp);

            const nameArea = noteRoot.getElementsByClassName("name")[0];
            nameArea.innerText = note.userName;

            const marker = {
                time: timestamp,
                text: note.userName,
                overlayText: 'overlay',
                class: 'custom-marker'
            }
            markers.push(marker);
        });
    });

    populateMarkers(markers);
}

function populateMarkers(markers) {
    player.markers({
        markerStyle: {
            'width': '7px',
            'border-radius': '30%',
            'background-color': 'red'
        },
        markerTip: {
            display: true,
            text: function (marker) {
                return marker.text;
            },
            time: function (marker) {
                return marker.time;
            }
        },
        breakOverlay: {
            display: false,
            displayTime: 3,
            style: {
                'width': '100%',
                'height': '20%',
                'background-color': 'rgba(0,0,0,0.7)',
                'color': 'white',
                'font-size': '17px'
            },
            text: function (marker) {
                return "Break overlay: " + marker.overlayText;
            }
        },
        onMarkerClick: function (marker) {
            const index = markers.indexOf(marker);

            const noteContainer = document.getElementById(`note-${index}`);

            noteContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });

            noteContainer.classList.add("horizontal-shake");

            setTimeout(() => { noteContainer.classList.remove("horizontal-shake"); }, 2000);
        },
        onMarkerReached: function (marker) { },
        markers: markers
    });
}

async function getAllNotes() {
    const cookie = getCookie("uuid");
    const data = {
        videoId: videoId
    }

    return await fetch("http://127.0.0.1:5001/unitystreamingapp/us-central1/web_getCommentsOfVideo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Accept': 'application/json',
            "uuid": cookie
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
        keepalive: true
    })
        .then(response => response.json());
}

async function getVideo() {
    const cookie = getCookie("uuid");
    const data = {
        videoId: videoId
    }

    return await fetch("http://127.0.0.1:5001/unitystreamingapp/us-central1/web_getVideo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Accept': 'application/json',
            "uuid": cookie
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
        keepalive: true
    })
        .then(response => response.json());
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
