/* =====================================
   1. ОБРАТНЫЙ ОТСЧЁТ
===================================== */

const weddingDate = new Date(
    "2026-11-10T18:00:00+06:00"
).getTime();

function updateCountdown() {

    const difference = weddingDate - Date.now();

    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");

    const message = document.getElementById("countdown-message");

    if (difference <= 0) {

        daysElement.textContent = "00";
        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";

        message.textContent =
            "Сегодня наш особенный день! Будем рады видеть вас ❤️";

        return;
    }

    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference / 3600000) % 24);
    const minutes = Math.floor((difference / 60000) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    daysElement.textContent = String(days).padStart(2, "0");
    hoursElement.textContent = String(hours).padStart(2, "0");
    minutesElement.textContent = String(minutes).padStart(2, "0");
    secondsElement.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* =====================================
   2. ПОЯВЛЕНИЕ РАЗДЕЛОВ
===================================== */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },
        { threshold: 0.12 }
    );

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

} else {

    revealElements.forEach(element => {
        element.classList.add("visible");
    });

}


/* =====================================
   3. ПОЛОСА ПРОКРУТКИ
===================================== */

const progress = document.getElementById("progress");

window.addEventListener("scroll", () => {

    const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

    const percent = scrollable > 0
        ? (window.scrollY / scrollable) * 100
        : 0;

    progress.style.width = `${percent}%`;

});


/* =====================================
   4. ФОРМА ОТВЕТА
===================================== */

const attendance = document.getElementById("attendance");

const guestCountWrap =
    document.getElementById("guest-count-wrap");

const guestCountInput =
    document.getElementById("guest-count");

attendance.addEventListener("change", () => {

    const isComing = attendance.value === "yes";

    guestCountWrap.classList.toggle("is-hidden", !isComing);

    guestCountInput.required = isComing;

});


/* =====================================
   5. СОХРАНЕНИЕ ГОСТЕЙ
===================================== */

const STORAGE_KEY = "weddingGuests";

function loadGuests() {

    try {

        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(saved) ? saved : [];

    } catch (error) {

        console.error("Ошибка загрузки:", error);

        return [];

    }

}

let guests = loadGuests();

function saveGuests() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(guests)
        );

        return true;

    } catch (error) {

        console.error("Ошибка сохранения:", error);

        alert("Не удалось сохранить ответы.");

        return false;

    }

}


/* =====================================
   6. ЭЛЕМЕНТЫ МИНИ-КОРЗИНЫ
===================================== */

const guestFab = document.getElementById("guest-fab");
const guestModal = document.getElementById("guest-modal");
const guestClose = document.getElementById("guest-close");
const guestOverlay = document.getElementById("guest-overlay");
const guestList = document.getElementById("guest-list");


guestFab.addEventListener("click", () => {

    guestModal.hidden = false;

    document.body.classList.add("modal-open");

    renderGuests();

});


function closeGuestModal() {

    guestModal.hidden = true;

    document.body.classList.remove("modal-open");

}

guestClose.addEventListener("click", closeGuestModal);

guestOverlay.addEventListener("click", closeGuestModal);

document.addEventListener("keydown", event => {

    if (event.key === "Escape" && !guestModal.hidden) {

        closeGuestModal();

    }

});


/* =====================================
   7. БЕЗОПАСНОЕ ОТОБРАЖЕНИЕ ТЕКСТА
===================================== */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => {

        const symbols = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return symbols[char];

    });

}


/* =====================================
   8. СПИСОК ГОСТЕЙ
===================================== */

function renderGuests() {

    const coming = guests.filter(
        guest => guest.answer === "yes"
    );

    const notComing = guests.filter(
        guest => guest.answer === "no"
    );

    const comingPeople = coming.reduce(
        (sum, guest) => sum + Number(guest.count || 1),
        0
    );

    document.getElementById("coming-count").textContent =
        comingPeople;

    document.getElementById("not-coming-count").textContent =
        notComing.length;

    document.getElementById("total-count").textContent =
        guests.length;

    document.getElementById("guest-badge").textContent =
        guests.length;


    if (guests.length === 0) {

        guestList.innerHTML = `

            <div class="guest-empty">

                <span>♡</span>

                <p>Пока никто не ответил</p>

                <small>
                    Здесь будут отображаться ответы гостей.
                </small>

            </div>

        `;

        return;

    }


    guestList.innerHTML = guests.map(guest => {

        const isComing = guest.answer === "yes";

        const statusClass = isComing ? "yes" : "no";

        const statusText = isComing
            ? `Придёт · ${Number(guest.count || 1)} чел.`
            : "Не придёт";

        return `

            <div class="guest-item">

                <div class="guest-item-info">

                    <strong>${escapeHTML(guest.name)}</strong>

                    <small>${escapeHTML(guest.date)}</small>

                </div>

                <span class="guest-status ${statusClass}">
                    ${statusText}
                </span>

                <button
                    class="guest-delete"
                    data-id="${escapeHTML(guest.id)}"
                    type="button"
                    aria-label="Удалить гостя"
                >
                    ×
                </button>

            </div>

        `;

    }).join("");


    guestList.querySelectorAll(".guest-delete").forEach(button => {

        button.addEventListener("click", () => {

            const id = button.dataset.id;

            guests = guests.filter(
                guest => guest.id !== id
            );

            if (saveGuests()) {

                renderGuests();

            }

        });

    });

}


/* =====================================
   9. ОТПРАВКА ФОРМЫ
===================================== */

// Вставь настоящий номер WhatsApp.
// Пример: 996555123456

const whatsappNumber = "996700123456";

document
    .getElementById("rsvp-form")
    .addEventListener("submit", event => {

        event.preventDefault();

        const name = document
            .getElementById("guest-name")
            .value.trim();

        const answer = attendance.value;

        const count = answer === "yes"
            ? Number(guestCountInput.value)
            : 0;

        const status =
            document.getElementById("rsvp-status");


        if (!name || !answer) {

            status.textContent =
                "Пожалуйста, заполните имя и выберите ответ.";

            return;

        }


        if (
            answer === "yes" &&
            (
                !Number.isInteger(count) ||
                count < 1 ||
                count > 15
            )
        ) {

            status.textContent =
                "Укажите количество гостей от 1 до 15.";

            return;

        }


        const newGuest = {

            id: crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString(),

            name: name,

            answer: answer,

            count: count,

            date: new Date().toLocaleString("ru-RU")

        };


        guests.push(newGuest);

        if (!saveGuests()) {

            guests.pop();

            return;

        }


        renderGuests();


        const reply = answer === "yes"

            ? `С радостью приду на вашу свадьбу! Нас будет ${count} человек.`

            : "К сожалению, не смогу прийти. Спасибо за приглашение!";


        const message =

            `Здравствуйте, Фатима и Бекжан!\n` +

            `Меня зовут: ${name}.\n` +

            `Мой ответ: ${reply}`;


        if (whatsappNumber !== "996700123456") {

            const whatsappUrl =
                `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

            window.open(
                whatsappUrl,
                "_blank",
                "noopener,noreferrer"
            );

        }


        status.textContent = answer === "yes"

            ? "Спасибо! Ваш ответ добавлен в список гостей ❤️"

            : "Спасибо за ваш ответ! ❤️";


        document.getElementById("rsvp-form").reset();

        guestCountWrap.classList.add("is-hidden");

        guestCountInput.required = false;

    });


/* =====================================
   10. ОБНОВЛЕНИЕ СПИСКА
===================================== */

document
    .getElementById("refresh-guests")
    .addEventListener("click", () => {

        guests = loadGuests();

        renderGuests();

    });

window.addEventListener("storage", event => {

    if (event.key === STORAGE_KEY) {

        guests = loadGuests();

        renderGuests();

    }

});


/* =====================================
   11. УДАЛЕНИЕ ВСЕХ ГОСТЕЙ
===================================== */

document
    .getElementById("clear-guests")
    .addEventListener("click", () => {

        if (guests.length === 0) {

            alert("Список гостей уже пуст.");

            return;

        }

        const confirmClear = confirm(
            "Вы действительно хотите удалить все ответы гостей?"
        );

        if (!confirmClear) return;

        const previousGuests = [...guests];

        guests = [];

        if (!saveGuests()) {

            guests = previousGuests;

            return;

        }

        renderGuests();

    });


/* =====================================
   12. ЭКСПОРТ ГОСТЕЙ В CSV
===================================== */

document
    .getElementById("export-guests")
    .addEventListener("click", () => {

        if (guests.length === 0) {

            alert("Список гостей пока пуст.");

            return;

        }

        const rows = [

            [
                "Имя",
                "Ответ",
                "Количество гостей",
                "Дата ответа"
            ],

            ...guests.map(guest => [

                guest.name,

                guest.answer === "yes"
                    ? "Придёт"
                    : "Не придёт",

                guest.count,

                guest.date

            ])

        ];

        const csv = "\uFEFF" + rows

            .map(row =>

                row.map(value =>

                    `"${String(value).replace(/"/g, '""')}"`

                ).join(";")

            )

            .join("\n");


        const blob = new Blob(
            [csv],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "wedding-guests.csv";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

    });


/* =====================================
   13. ЗАПУСК
===================================== */

renderGuests();

console.log("Wedding website successfully loaded ❤️");