import { getNotes } from "../../shared/js/annotationmanager.js";

setup();

function setup() {
    var player = videojs('example_video_1');

    const markers = [];
    const notes = getNotes();

    var count = 1;
    notes.forEach(element => {
        const marker = {
            time: element.timestamp,
            text: `note-${count}`,
            overlayText: 'overlay',
            class: 'custom-marker'
        }
        markers.push(marker);
        count++;
    });

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

            const noteElement = document.getElementById(`note-${index}`);
            const parentDiv = noteElement.parentElement;
            const textElement = noteElement.getElementsByClassName('note-textarea')[0];

            noteElement.scrollIntoView({ behavior: 'smooth' });

            var timeElapsed = 0;
            const blink_speed = 600;
            var interval = setInterval(function () {
                timeElapsed += blink_speed;

                parentDiv.style.visibility = (parentDiv.style.visibility == 'hidden' ? '' : 'hidden');
                parentDiv.style.backgroundColor = "yellow";

                noteElement.style.backgroundColor = "yellow";
                textElement.style.backgroundColor = "yellow";

                if (timeElapsed > 2000) {
                    clearInterval(interval);
                    parentDiv.style.visibility = '';
                    noteElement.style.backgroundColor = "white";
                    textElement.style.backgroundColor = "white";
                }
            }, blink_speed);

        },
        onMarkerReached: function (marker) { },
        markers: markers
    });

}