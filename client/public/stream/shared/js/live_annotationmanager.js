import { isPlaying } from "./videoplayer.js";
import { videoId } from "../../live/js/main.js";

let addNoteButton;
let noteContainer;
let notes = [];

setup();


function setup() {
    console.log(videoId);
    window.addEventListener('beforeunload', async () => {
        if (notes.length > 0) {
            const cookie = getCookie("uuid");
            const data = {
                comments: notes
            }
            console.log("Data : " + JSON.stringify(data));
            console.log("cookie " + cookie);
            await fetch("http://127.0.0.1:5001/unitystreamingapp/us-central1/web_postComment", {
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
            });
        }
    });


    addNoteButton = document.getElementsByClassName('add-note-button')[0];
    addNoteButton.hidden = false;

    noteContainer = document.getElementById('notes');
    addNoteButton.addEventListener('click', onAddNoteClicked.bind(this));
}


function onAddNoteClicked() {
    if (!isPlaying) return;
    $.get("http://localhost/stream/shared/annotation_inner.html", function (result) {
        $("#notes").append(result);

        var noteRoot = document.getElementById("notes").lastChild;
        registerEvents(noteRoot, getTimeStamp());
        document.getElementById("notes").lastChild.scrollIntoView();
    });
}

function registerEvents(noteRoot, timestamp) {
    var cancelButton = noteRoot.getElementsByClassName("cancel-button")[0];
    var saveButton = noteRoot.getElementsByClassName("save-button")[0];
    var timestampField = noteRoot.getElementsByClassName("timestamp-button")[0];

    timestampField.innerText = formatTime(timestamp);

    cancelButton.addEventListener('click', () => {
        noteRoot.remove();
    });

    saveButton.addEventListener('click', () => {
        const textarea = noteRoot.getElementsByClassName("textarea")[0];
        const textareaContainer = noteRoot.getElementsByClassName("textarea-container")[0];
        const cancelButton = noteRoot.getElementsByClassName("cancel-button")[0];
        cancelButton.style.display = "flex";

        if (!textarea.value.trim()) {
            const confirmDelete = confirm('You haven\'t entered anything for this note. Do you want to delete it?');
            if (confirmDelete) {
                noteRoot.remove();
            }
            return;
        }
        const actionButtons = noteRoot.getElementsByClassName("action-buttons")[0];
        actionButtons.style.display = 'none';

        const updateButtons = noteRoot.getElementsByClassName("update-buttons")[0];
        updateButtons.style.display = 'flex';

        textarea.classList.add("textarea-saved");
        textarea.classList.remove("textarea");
        textarea.readOnly = true;

        makeButtonsFollowResizing(textarea, textareaContainer, updateButtons);

        const deleteButton = noteRoot.getElementsByClassName("delete-button")[0];
        deleteButton.addEventListener("click", () => {
            noteRoot.remove();
            const index = notes.findIndex(n => n.timestamp === timestamp);
            if (index !== -1) {
                notes.splice(index, 1);
            }
            console.log("After delete: " + JSON.stringify(notes));
        });

        const editButton = noteRoot.getElementsByClassName("edit-button")[0];
        editButton.addEventListener("click", () => {
            textarea.classList.add("textarea");
            textarea.classList.remove("textarea-saved");

            updateButtons.style.display = 'none';
            actionButtons.style.display = 'flex';
            cancelButton.style.display = "none";

            textarea.readOnly = false;
        });

        const index = notes.findIndex(n => n.timestamp === timestamp);
        if (index !== -1) {
            notes.splice(index, 1);
        }

        const note = {
            videoId: videoId,
            annotationTime: timestamp,
            content: textarea.value
        };
        notes.push(note);
        console.log("After save: " + JSON.stringify(notes));
    });
}

function getTimeStamp() {
    var timestamp = document.querySelector('video').currentTime;
    return timestamp;
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function makeButtonsFollowResizing(textarea, textareaContainer, updateButtons) {
    function updateButtonPosition() {
        const textareaRect = textarea.getBoundingClientRect();
        const wrapperRect = textareaContainer.getBoundingClientRect();

        const buttonTop = textareaRect.top - wrapperRect.top + 15;
        const buttonRight = wrapperRect.right - textareaRect.right + 35;

        updateButtons.style.top = buttonTop + 'px';
        updateButtons.style.right = buttonRight + 'px';
    }

    updateButtonPosition();

    new ResizeObserver(updateButtonPosition).observe(textarea);
}

function pushAnnotationsWebRequest() {
    const cookie = getCookie("uuid");
    try {
        data = {
            comments: JSON.stringify(notes)
        }
        console.log("cookie " + cookie);
        const response = fetch("http://127.0.0.1:5001/unitystreamingapp/us-central1/web_postComment", {
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
        });
        if (response.status == "200") {
            // Do nothing
        } else {
            alert("Something went wrong! Please try again.");
        }
    } catch (error) {
        alert("Something went wrong! Please try again.");
    }

}