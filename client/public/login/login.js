const form = document.querySelector("form");
eField = form.querySelector(".email"),
  eInput = eField.querySelector("input"),
  pField = form.querySelector(".password"),
  pInput = pField.querySelector("input");

form.onsubmit = (e) => {
  e.preventDefault(); //Prevent the form from submitting

  //If inputs are empty, then shake them
  if (eInput.value == "") {
    eField.classList.add("shake", "error");
  } else {
    checkEmail();
  }
  if (pInput.value == "") {
    pField.classList.add("shake", "error");
  }

  setTimeout(() => { //remove shake class after 500ms
    eField.classList.remove("shake")
    pField.classList.remove("shake")
  }, 500)

  eInput.onkeyup = () => {
    checkEmail();
  }

  function checkEmail() {
    let pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/; //pattern to validate email
    if (!eInput.value.match(pattern)) { //if the pattern doesn't match
      eField.classList.add("error");
      let errorTxt = eField.querySelector(".error-text");
      (eInput.value != "") ? errorTxt.innerText = "Enter a valid email address": errorTxt.innerText = "Email can't be blank";
    } else {
      eField.classList.remove("error");
    }
  }

  pInput.onkeyup = () => {
    if (pInput.value == "") { //if password is empty
      pField.classList.add("error");
    } else {
      pField.classList.remove("error");
    }
  }

  if (!eField.classList.contains("error") && !pField.classList.contains("error")) {
    window.location.href = "#"; //# is where you want to submit the form data
    loginToServer(eInput.value, pInput.value);
    console.log("Form submitted");
  }
}

async function loginToServer(email, password) {
  password = await hash(password);
  var data = {
    "email": email,
    "password": password
  }

  try {
    const response = await fetch("http://127.0.0.1:5001/unitystreamingapp/us-central1/web_updateUserUUIDLogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
    });
    if (response.status == "200") {
      response.json().then(body => document.cookie = "uuid=" + body.uuid + "; expires=Tue, 5 Sep 2023 12:00:00 UTC; path=/");
      window.location.href = "/index.html";
    } else {
      alert("Something went wrong! Please try again.");
    }
  } catch (error) {
    alert("Something went wrong! Please try again.");
  }

}


async function hash(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string                  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
