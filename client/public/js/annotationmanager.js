
let addNoteButton;
let noteContainer;
let notes = [];

createAnnotationUI();


function createAnnotationUI() {
    addNoteButton = document.getElementById('add-note-button');
    noteContainer = document.getElementById('note-container');

    addNoteButton.addEventListener('click', onAddNoteClicked.bind(this));

    document.getElementById('log').addEventListener('click', function(){
            console.log(notes);
    });
}

function createTextArea() {
    // Create a new text area for the note
    var noteTextArea = document.createElement('textarea');
    noteTextArea.placeholder = 'Enter your note here';
    noteTextArea.classList.add('note-textarea');
    return noteTextArea;
}

function getTimestamp() {
    // Get the current video timestamp
    var timestamp = document.querySelector('video').currentTime;
    return timestamp;
}

function createTimestampField(timestamp) {
    // Create a new text node for the timestamp
    const timestampText = document.createTextNode(`[${formatTime(timestamp)}] `);
    const timestampSpan = document.createElement('span');
    timestampSpan.classList.add('note-timestamp');
    timestampSpan.appendChild(timestampText);
    return timestampSpan;
}

function createSaveButton(noteTextarea, saveButton, editButton, noteParagraph, timestamp) {
    saveButton.textContent = 'Save';
    saveButton.classList.add('note-buttons', 'note-save');

    // Add event listeners to the button
    saveButton.addEventListener('click', () => {

        // Check if note is empty
        if (!noteTextarea.value.trim()) {
            const confirmDelete = confirm('You haven\'t entered anything for this note. Do you want to delete it?');
            if (confirmDelete) {
              noteParagraph.remove();
              return;
            }
            return;
        }

        // Save the note
        noteTextarea.readOnly = true;
        saveButton.style.display = 'none';
        editButton.style.display = 'inline-block';

        const index = notes.findIndex(n => n.timestamp === timestamp);
        if (index !== -1) {
          notes.splice(index, 1);
        }
        
        const note = {
            timestamp: timestamp,
            note: noteTextarea.value
          };
          notes.push(note);
    });

    return saveButton;
}

function createEditButton(noteTextarea, saveButton, editButton) {
    editButton.textContent = 'Edit';
    editButton.classList.add('note-buttons', 'note-edit');

    // Add event listeners to the button
    editButton.addEventListener('click', () => {
        // Edit the note
        noteTextarea.readOnly = false;
        editButton.style.display = 'none';
        saveButton.style.display = 'inline-block';
    });
}

function createDeleteButton(deleteButton, noteParagraph, timestamp) {
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('note-buttons', 'note-delete');

    // Add event listeners to the button
    deleteButton.addEventListener('click', () => {
        // Delete the note
        noteParagraph.remove();

        const index = notes.findIndex(n => n.timestamp === timestamp);
        if (index !== -1) {
          notes.splice(index, 1);
        }
    });

}


function onAddNoteClicked() {
    // Create a new paragraph element to hold the timestamp, note, and buttons
    const noteParagraph = document.createElement('p');
    const noteTextarea = createTextArea();
    const timestamp = getTimestamp();

    noteParagraph.classList.add('note');
    noteParagraph.appendChild(createTimestampField(timestamp));
    noteParagraph.appendChild(noteTextarea);

    // Create the save, edit, and delete buttons
    const saveButton = document.createElement('button');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    createSaveButton(noteTextarea, saveButton, editButton, noteParagraph, timestamp);
    createEditButton(noteTextarea, saveButton, editButton);
    createDeleteButton(deleteButton, noteParagraph, timestamp);
    
    // Add the buttons to the paragraph element
    noteParagraph.appendChild(saveButton);
    noteParagraph.appendChild(editButton);
    noteParagraph.appendChild(deleteButton);

    // Add the paragraph element to the note container
    noteContainer.appendChild(noteParagraph);
}


function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}