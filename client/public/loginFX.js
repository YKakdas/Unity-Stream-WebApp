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
    console.log("Form submitted");
  }
}
