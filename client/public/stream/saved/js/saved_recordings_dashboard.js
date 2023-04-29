function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function getOnGoingVideos() {
    const cookie = getCookie("uuid");
    try {
        console.log("cookie " + cookie);
        const response = await fetch("http://127.0.0.1:5001/unitystreamingapp/us-central1/web_getSavedVideos", {
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
                list.classList.add("live_stream_list");

                let count = 0;

                // Loop through the data and create list items
                data.forEach(item => {
                    count++;

                    var startDate = new Date(item.videoStartTime);
                    var endDate = new Date(item.videoFinishTime);
                    var text = `Recorded stream (${count})  /   ${startDate.toUTCString()} - ${endDate.toUTCString()}`;

                    const listItem = `<li><a class="saved_url" href=saved_recordings.html?videoId=${item.videoId}>${text}</a></li>`
                    list.innerHTML += listItem;
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
