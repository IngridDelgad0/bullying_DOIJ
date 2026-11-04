const ENDPOINT = "/api/encuesta";

const form = document.getElementById("surveyForm");
const message = document.getElementById("formMessage");
const button = document.getElementById("submitButton");
const progressBar = document.getElementById("progressBar");

/* BARRA DE PROGRESO */

form.addEventListener("change", () => {
    const total = 9;
    let answered = 0;

    const fields = [
        "experiencia",
        "entorno",
        "tipos",
        "frecuencia",
        "instituciones",
        "reaccion",
        "ayuda",
        "importancia",
        "opinion"
    ];

    fields.forEach(name => {
        const elements = form.querySelectorAll(`[name="${name}"]`);

        if ([...elements].some(el => {
            if (el.type === "checkbox" || el.type === "radio") {
                return el.checked;
            }
            return el.value.trim() !== "";
        })) {
            answered++;
        }
    });

    progressBar.style.width = (answered / total * 100) + "%";
});

/* RECOPILAR RESPUESTAS */

function getSurveyData() {
    const data = {};

    const fields = [
        "experiencia",
        "entorno",
        "tipos",
        "frecuencia",
        "instituciones",
        "reaccion",
        "ayuda",
        "importancia",
        "opinion"
    ];

    fields.forEach(name => {
        const elements = form.querySelectorAll(`[name="${name}"]`);

        if (elements.length > 0 &&
            (elements[0].type === "checkbox")) {

            data[name] = [...elements]
                .filter(el => el.checked)
                .map(el => el.value);

        } else if (elements.length > 0 &&
                   elements[0].type === "radio") {

            const selected = [...elements].find(el => el.checked);
            data[name] = selected ? selected.value : "";

        } else if (elements.length > 0) {
            data[name] = elements[0].value.trim();
        }
    });

    return data;
}

/* ENVÍO DE LA ENCUESTA */

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
        return;
    }

    const data = getSurveyData();

    // Si el servidor todavía no está configurado,
    // se informa al usuario sin fingir que se envió.
    if (ENDPOINT === "/api/encuesta") {
        message.className = "error";
        message.style.display = "block";
        message.textContent =
            "La encuesta está preparada, pero el administrador todavía debe configurar el servidor para recibir las respuestas. Tus datos no se han enviado.";
        return;
    }

    button.disabled = true;
    button.textContent = "Enviando respuestas...";

    try {
        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("No fue posible enviar las respuestas.");
        }

        message.className = "success";
        message.textContent =
            "¡Gracias por participar! Tus respuestas se han enviado correctamente.";

        form.reset();
        progressBar.style.width = "0%";

    } catch (error) {
        message.className = "error";
        message.textContent =
            "No se pudieron enviar tus respuestas. Inténtalo más tarde o comunícate con el administrador de la página.";

    } finally {
        button.disabled = false;
        button.textContent = "Enviar mis respuestas →";
    }
});
