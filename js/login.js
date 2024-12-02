const user_token = getItem("token");
if(user_token) window.location = "/store/index.html";
const elAuthForm = document.querySelector(".js-auth-form")
const elEmailInp = elAuthForm.querySelector(".js-email-input");
const elPasswordInp = elAuthForm.querySelector(".js-password-input");
const elErrorAlert = document.querySelector(".js-error-alert");
const elBtnOk = elErrorAlert.querySelector(".js-btn-ok");
const handleInputChangeAndBlur = evt => {
    try {
        const evt_target_id = evt.target.id;
        const evt_target_value = evt.target.value.trim();
        if (evt_target_id == "email") {
            if (!(evt_target_value.length)) throw (new Error("Email is required"));
            if (!(email_regex.test(evt_target_value))) throw (new Error("Invalid email addres"));
            if(evt_target_value.length || email_regex.test(evt_target_value)) elErrorAlert.classList.add("d-none");
        };
        if (evt_target_id == "password" && !(evt_target_value.length)) throw (new Error("Password is required"));
        if (evt_target_id == "password" && (evt_target_value.length)) elErrorAlert.classList.add("d-none");
    } catch (error) {
        elErrorAlert.classList.remove("d-none");
        elErrorAlert.querySelector(".js-error-title").textContent = error.message;
    }
}

const handleLoginFn = async evt => {
    try {
        evt.preventDefault();
        let formData = new FormData(evt.target);
        formData = JSON.stringify(Object.fromEntries(formData.entries()));
        if(formData){
            const req = await fetch(BASE_URL+"user/login", {
                method: "POST",
                headers:{
                    "Content-type": "application/json"
                },
                body: formData
            })
            if(req.ok){
                const res = await req.json();
                setItem("token", res.token);
                window.location = "/store/index.html";
            }
        }
    } catch (error) {
        console.log(error);
    }
};

elBtnOk.addEventListener("click", () => elErrorAlert.classList.add("d-none"));

elEmailInp.addEventListener("change", handleInputChangeAndBlur);
elEmailInp.addEventListener("blur", handleInputChangeAndBlur);

elPasswordInp.addEventListener("change", handleInputChangeAndBlur);
elPasswordInp.addEventListener("blur", handleInputChangeAndBlur);

elAuthForm.addEventListener("submit", handleLoginFn)
