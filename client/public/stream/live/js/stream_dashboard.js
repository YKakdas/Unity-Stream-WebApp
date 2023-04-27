function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function getOnGoingVideos() {
    const cookie = getCookie("uuid");
    try {
        console.log("cookie " + cookie);
        const response = await fetch("http://127.0.0.1:5001/unitystreamingapp/us-central1/web_getOnGoingVideo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Accept': 'application/json',
                "uuid": cookie
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
        });
        if (response.status == "200") {
            response.json().then(data => {
                // Create an unordered list
                const list = document.createElement('ul');

                // Loop through the data and create list items
                data.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.textContent = item.videoId;

                    // Add an event listener to the list item
                    listItem.addEventListener('click', () => {
                        // When the list item is clicked, load stream.html with the corresponding id
                        window.location.href = `stream.html?id=${item.videoId}`;
                    });

                    // Add the list item to the list
                    list.appendChild(listItem);
                });

                // Add the list to the container
                const container = document.getElementById('dynamic-list-container');
                container.appendChild(list);
            });

        } else {
            alert("Something went wrong! Please try again.");
        }
    } catch (error) {
        alert("Something went wrong! Please try again.");
    }

}

await getOnGoingVideos();
