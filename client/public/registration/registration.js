const form = document.querySelector("form");
nameField = form.querySelector(".name");
nameInput = nameField.querySelector("input");

emailField = form.querySelector(".email");
emailInput = emailField.querySelector("input");

createPasswordField = form.querySelector(".create_password");
createPasswordInput = createPasswordField.querySelector("input");

confirmPasswordField = form.querySelector(".confirm_password");
confirmPasswordInput = confirmPasswordField.querySelector("input");

roleField = document.getElementById("role");

form.onsubmit = (e) => {
    e.preventDefault(); //Prevent the form from submitting

    //If inputs are empty, then shake them
    if (nameInput.value == "") {
        nameField.classList.add("shake", "error");
    } else {
        nameField.classList.remove("shake", "error");
    }

    if (emailInput.value == "") {
        emailField.classList.add("shake", "error");
    } else {
        emailField.classList.remove("shake", "error");
    }

    if (createPasswordInput.value == "") {
        createPasswordField.classList.add("shake", "error");
    } else {
        createPasswordField.classList.remove("shake", "error");
    }

    if (confirmPasswordInput.value == "") {
        confirmPasswordField.classList.add("shake", "error");
    } else {
        confirmPasswordField.classList.remove("shake", "error");
    }

    if (createPasswordInput.value != "" && confirmPasswordInput.value != "") {
        if (createPasswordInput.value != confirmPasswordInput.value) {
            confirmPasswordField.classList.add("shake", "error");
        }
    }


    if (emailInput.value != "") {
        checkEmail();
    }


    setTimeout(() => { //remove shake class after 500ms
        emailField.classList.remove("shake")
        nameField.classList.remove("shake")
        createPasswordField.classList.remove("shake");
        confirmPasswordField.classList.remove("shake");
    }, 500)

    emailInput.onkeyup = () => {
        checkEmail();
    }

    nameInput.onkeyup = () => {
        if (nameInput.value != "") {
            nameField.classList.remove("error");
        }
    }

    createPasswordInput.onkeyup = () => {
        if (createPasswordInput.value != "") {
            createPasswordField.classList.remove("error");
        }
    }

    confirmPasswordInput.onkeyup = () => {
        if (createPasswordInput.value == confirmPasswordInput.value) {
            confirmPasswordField.classList.remove("error");
        }
    }

    function checkEmail() {
        let pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/; //pattern to validate email
        if (!emailInput.value.match(pattern)) { //if the pattern doesn't match
            emailField.classList.add("error");
            let errorTxt = emailField.querySelector(".error-text");
            (emailInput.value != "") ? errorTxt.innerText = "Enter a valid email address" : errorTxt.innerText = "Email can't be blank";
        } else {
            emailField.classList.remove("error");
        }
    }

    if (!emailField.classList.contains("error") && !nameField.classList.contains("error") &&
        !createPasswordField.classList.contains("error") && !confirmPasswordField.classList.contains("error")
    ) {
        window.location.href = "#"; //# is where you want to submit the form data
        console.log("Form submitted");
        postUserToDB(roleField.value -1, nameInput.value, emailInput.value, createPasswordInput.value);
    }
}

async function postUserToDB(role, name, email, password) {
    var data = {
        "role" : 0,
        "name": name,
        "email": email,
        "password": password
    }

    const response = await fetch("http://127.0.0.1:5001/unitystreamingapp/us-central1/web_postUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", 
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
    });
    console.log(response.status);
  }
  