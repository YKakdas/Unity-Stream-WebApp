import { isPlaying } from "./videoplayer.js";
import { videoId, starttime } from "../../live/js/main.js";

let addNoteButton;
let noteContainer;
let notes = [];
let previousNotes = [];

await setup();

isPlaying.registerListener(async function(val) {
    if(val == false){
        await pushComments();
        alert("The stream has ended. Your comments has been saved to be shown with recorded stream.");
        window.location.href = "/index.html";
    }
  });

async function setup() {


    previousNotes = await getPreviousComments();

    previousNotes.sort((a, b) => a.annotationTime - b.annotationTime);

    if (previousNotes.length > 0) {
        populatePreviousComments();
    }

    window.addEventListener('beforeunload', await pushComments());

    addNoteButton = document.getElementsByClassName('add-note-button')[0];
    addNoteButton.hidden = false;

    noteContainer = document.getElementById('notes');
    addNoteButton.addEventListener('click', onAddNoteClicked.bind(this));
}


function onAddNoteClicked() {
    if (!isPlaying) return;
    $.get("http://localhost/stream/shared/annotation_inner.html", function (result) {
        $("#notes").append(result);

        let lastNote = null;
        if (notes.length > 0) {
            lastNote = notes[notes.length - 1];
        }

        let timestamp = null;
        if (lastNote !== null) {
            timestamp = lastNote.annotationTime + (new Date().getTime() - lastNote.actualTime) / 1000;
        } else {
            timestamp = getTimeStamp();
        }
        var noteRoot = document.getElementById("notes").lastChild;
        registerEvents(noteRoot, timestamp, null);
        document.getElementById("notes").lastChild.scrollIntoView();
    });
}

function populatePreviousComments() {
    previousNotes.forEach(comment => {
        $.get("http://localhost/stream/shared/annotation_inner.html", function (result) {
            $("#notes").append(result);

            var noteRoot = document.getElementById("notes").lastChild;
            registerEvents(noteRoot, comment.annotationTime, comment.content);
            notes.push({
                videoId: comment.videoId,
                annotationTime: comment.annotationTime,
                content: comment.content,
                actualTime: comment.actualTime
            });
        });
    });
}

function registerEvents(noteRoot, timestamp, content) {
    const actionButtons = noteRoot.getElementsByClassName("action-buttons")[0];
    const updateButtons = noteRoot.getElementsByClassName("update-buttons")[0];

    const actualTime = new Date().getTime();
    const textarea = noteRoot.getElementsByClassName("textarea")[0];

    var timestampField = noteRoot.getElementsByClassName("timestamp-button")[0];

    if (content !== null) {
        textarea.value = content;
        textarea.classList.add("textarea-saved");
        textarea.classList.remove("textarea");
        textarea.readOnly = true;

        actionButtons.style.display = 'none';
        updateButtons.style.display = 'flex';
    }

    timestampField.innerText = formatTime(timestamp);

    var cancelButton = noteRoot.getElementsByClassName("cancel-button")[0];
    var saveButton = noteRoot.getElementsByClassName("save-button")[0];

    cancelButton.addEventListener('click', () => {
        noteRoot.remove();
    });

    const deleteButton = noteRoot.getElementsByClassName("delete-button")[0];
    deleteButton.addEventListener("click", () => {
        noteRoot.remove();
        const index = notes.findIndex(n => n.annotationTime === timestamp);
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

    saveButton.addEventListener('click', () => {
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

        actionButtons.style.display = 'none';
        updateButtons.style.display = 'flex';

        textarea.classList.add("textarea-saved");
        textarea.classList.remove("textarea");
        textarea.readOnly = true;

        makeButtonsFollowResizing(textarea, textareaContainer, updateButtons);

        const index = notes.findIndex(n => n.annotationTime === timestamp);
        console.log("index " + index);
        if (index !== -1) {
            notes.splice(index, 1);
        }

        const note = {
            videoId: videoId,
            annotationTime: timestamp,
            content: textarea.value,
            actualTime: actualTime
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
    console.log(time);
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

async function getPreviousComments() {
    const tempNotes = []
    const cookie = getCookie("uuid");

    const data = {
        videoId: videoId
    }

    console.log("cookie " + cookie);
    return fetch("http://127.0.0.1:5001/unitystreamingapp/us-central1/web_getCommentsOfUser", {
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
        .then((response) => response.json())
        .then((response) => response.comments);
}

async function pushComments() {
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
}