// =====================================================
// Baby Cry AI Monitoring System
// GitHub Pages + ThingSpeak
// =====================================================

// =====================================================
// THINGSPEAK SETTINGS
// =====================================================

const CHANNEL_ID = "3414669";

// IMPORTANT:
// If your ThingSpeak channel is PUBLIC,
// leave this empty.
//
// If your channel is PRIVATE,
// put your READ API KEY here.
const READ_API_KEY = "";

// Poll ThingSpeak every 5 seconds
const UPDATE_INTERVAL = 5000;


// =====================================================
// CURRENT STATUS
// =====================================================

let currentStatus = "NO CRY";
let confidence = 0;


// =====================================================
// THINGSPEAK URL
// =====================================================

function getThingSpeakURL() {

    let url =
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json?status=true`;

    if (READ_API_KEY !== "") {

        url +=
            `&api_key=${encodeURIComponent(READ_API_KEY)}`;
    }

    return url;
}


// =====================================================
// UPDATE CONNECTION DISPLAY
// =====================================================

function setConnectionOnline() {

    const connection =
        document.getElementById("connection");

    connection.className =
        "connection online";

    connection.innerHTML =
        "🟢 ESP32 / ThingSpeak connected";
}


function setConnectionOffline() {

    const connection =
        document.getElementById("connection");

    connection.className =
        "connection offline";

    connection.innerHTML =
        "🔴 Waiting for ESP32 data...";
}


// =====================================================
// UPDATE ADVICE
// =====================================================

function updateAdvice(status) {

    const advice =
        document.getElementById("autoAdvice");


    if (status === "HUNGER") {

        advice.innerHTML = `

            <h3>
                🍼 Current Status: HUNGER
            </h3>

            <p>
                <b>Suggested Actions:</b>
            </p>

            <ul>

                <li>
                    Check the baby's hunger cues.
                </li>

                <li>
                    Feed the baby if appropriate.
                </li>

                <li>
                    Burp the baby after feeding if needed.
                </li>

                <li>
                    Continue monitoring.
                </li>

            </ul>
        `;

    }

    else if (status === "DISTRESS") {

        advice.innerHTML = `

            <h3>
                🚨 Current Status: DISTRESS
            </h3>

            <p>
                <b>Suggested Actions:</b>
            </p>

            <ul>

                <li>
                    Check the diaper.
                </li>

                <li>
                    Check room temperature.
                </li>

                <li>
                    Check clothing and comfort.
                </li>

                <li>
                    Seek medical advice if you are concerned.
                </li>

            </ul>
        `;

    }

    else {

        advice.innerHTML = `

            <h3>
                😊 Current Status: NO CRY
            </h3>

            <p>
                No crying is currently detected.
            </p>

            <ul>

                <li>
                    Continue normal monitoring.
                </li>

                <li>
                    Ensure the baby is comfortable.
                </li>

                <li>
                    Observe for changes.
                </li>

            </ul>
        `;
    }
}


// =====================================================
// UPDATE STATUS BOX
// =====================================================

function updateStatusDisplay() {

    const box =
        document.getElementById("statusBox");

    const confidenceElement =
        document.getElementById("confidence");


    // Confidence
    confidenceElement.textContent =
        confidence.toFixed(1) + "%";


    // Status box
    box.className = "status";


    if (currentStatus === "HUNGER") {

        box.classList.add("blue");

    }

    else if (currentStatus === "DISTRESS") {

        box.classList.add("red");

    }

    else {

        box.classList.add("green");
    }


    box.textContent =
        currentStatus;


    // Advice
    updateAdvice(
        currentStatus
    );
}


// =====================================================
// READ THINGSPEAK
// =====================================================

async function updateStatus() {

    try {

        const response =
            await fetch(
                getThingSpeakURL(),
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "ThingSpeak request failed"
            );
        }


        const data =
            await response.json();


        // =============================================
        // STATUS
        // =============================================

        /*
          ESP32 sends:

          HUNGER|92.7
          DISTRESS|88.4
          NO CRY|92.7
        */

        let statusText =
            data.status || "";


        statusText =
            String(statusText).trim();


        if (statusText.includes("|")) {

            const parts =
                statusText.split("|");


            currentStatus =
                parts[0].trim().toUpperCase();


            const receivedConfidence =
                parseFloat(parts[1]);


            if (
                !isNaN(
                    receivedConfidence
                )
            ) {

                confidence =
                    receivedConfidence;
            }

        }

        else {

            /*
              Fallback if old ThingSpeak
              entries don't contain our
              new status format.
            */

            currentStatus =
                statusText.toUpperCase();

            confidence = 0;
        }


        // =============================================
        // TIME
        // =============================================

        const updatedTime =
            document.getElementById(
                "lastUpdate"
            );


        if (data.created_at) {

            const date =
                new Date(
                    data.created_at
                );


            updatedTime.textContent =
                date.toLocaleTimeString();
        }

        else {

            updatedTime.textContent =
                new Date().toLocaleTimeString();
        }


        // =============================================
        // DISPLAY
        // =============================================

        setConnectionOnline();

        updateStatusDisplay();

    }

    catch (error) {

        console.error(
            "ThingSpeak error:",
            error
        );

        setConnectionOffline();
    }
}


// =====================================================
// CHATBOT DATABASE
// =====================================================

const helloReplies = [

    "Hello! 👋 I'm your Baby Care Assistant. How can I help?",

    "Hi! I can help with baby care questions.",

    "Hello! Ask me about crying, hunger, distress, feeding or sleep.",

    "Hi there! 😊 How can I help?"

];


const thanksReplies = [

    "You're welcome! 😊",

    "Glad I could help.",

    "My pleasure!",

    "Happy to help!"

];


const hungerReplies = [

    "If the AI detects HUNGER, check the baby's hunger cues and feed the baby if appropriate.",

    "Look for hunger cues such as rooting or sucking movements.",

    "If it is feeding time, offer breast milk or formula as appropriate.",

    "Burping the baby after feeding may help reduce discomfort."

];


const distressReplies = [

    "If DISTRESS is detected, check the diaper first.",

    "Check whether the baby is too hot or too cold.",

    "Check clothing and comfort the baby gently.",

    "Persistent distress should be discussed with a healthcare professional."

];


const sleepReplies = [

    "Keep the baby's sleeping environment safe, calm and comfortable.",

    "A quiet and dim environment may help the baby settle.",

    "Newborns commonly wake during the night to feed."

];


const diaperReplies = [

    "Check whether the diaper is wet or dirty.",

    "Make sure the diaper is not too tight.",

    "Check the baby's skin for signs of irritation."
];


const cryingReplies = [

    "Crying is one of the baby's main ways of communicating.",

    "Babies may cry because of hunger, discomfort, tiredness or needing attention.",

    "Check feeding, diaper and comfort first."
];


const temperatureReplies = [

    "Make sure the baby is comfortably dressed.",

    "Avoid overheating the baby.",

    "Check whether the environment feels too hot or cold."
];


function randomReply(array) {

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];
}


// =====================================================
// CHATBOT
// =====================================================

function getAnswer(question) {

    const q =
        question.toLowerCase();


    if (
        q.includes("hello") ||
        q.includes("hi") ||
        q.includes("hey")
    ) {

        return randomReply(
            helloReplies
        );
    }


    if (q.includes("thank")) {

        return randomReply(
            thanksReplies
        );
    }


    if (
        q.includes("status")
    ) {

        return `The current Baby Cry AI status is <b>${currentStatus}</b> with a confidence of <b>${confidence.toFixed(1)}%</b>.`;
    }


    if (
        q.includes("confidence")
    ) {

        return `The current confidence is <b>${confidence.toFixed(1)}%</b>.`;
    }


    if (
        q.includes("what should i do") ||
        q.includes("what do i do") ||
        q.includes("help me")
    ) {

        if (
            currentStatus === "HUNGER"
        ) {

            return "🍼 The AI currently detects <b>HUNGER</b>. Check the baby's hunger cues and feed the baby if appropriate.";
        }


        if (
            currentStatus === "DISTRESS"
        ) {

            return "🚨 The AI currently detects <b>DISTRESS</b>. Check the diaper, temperature, clothing and comfort.";
        }


        return "😊 The AI currently detects <b>NO CRY</b>. Continue normal monitoring.";
    }


    if (
        q.includes("hunger") ||
        q.includes("hungry") ||
        q.includes("feed") ||
        q.includes("feeding") ||
        q.includes("milk") ||
        q.includes("formula")
    ) {

        return randomReply(
            hungerReplies
        );
    }


    if (
        q.includes("distress") ||
        q.includes("pain") ||
        q.includes("uncomfortable")
    ) {

        return randomReply(
            distressReplies
        );
    }


    if (
        q.includes("sleep") ||
        q.includes("tired") ||
        q.includes("nap")
    ) {

        return randomReply(
            sleepReplies
        );
    }


    if (
        q.includes("diaper") ||
        q.includes("nappy")
    ) {

        return randomReply(
            diaperReplies
        );
    }


    if (
        q.includes("temperature") ||
        q.includes("hot") ||
        q.includes("cold")
    ) {

        return randomReply(
            temperatureReplies
        );
    }


    if (
        q.includes("cry") ||
        q.includes("crying")
    ) {

        return randomReply(
            cryingReplies
        );
    }


    return "I can help with baby crying, hunger, distress, feeding, sleeping, diapers and the current AI status.";
}


// =====================================================
// SEND CHAT MESSAGE
// =====================================================

function sendQuestion() {

    const input =
        document.getElementById(
            "question"
        );


    const question =
        input.value.trim();


    if (
        question === ""
    ) {

        return;
    }


    const chat =
        document.getElementById(
            "chatBox"
        );


    // User message
    chat.innerHTML += `

        <div class="userBubble">
            ${escapeHTML(question)}
        </div>

    `;


    input.value = "";


    // Typing
    const typingId =
        "typing-" +
        Date.now();


    chat.innerHTML += `

        <div
            class="typing"
            id="${typingId}"
        >
            Baby Care Assistant is typing...
        </div>

    `;


    chat.scrollTop =
        chat.scrollHeight;


    setTimeout(
        function () {

            const typing =
                document.getElementById(
                    typingId
                );


            if (typing) {

                typing.remove();
            }


            const answer =
                getAnswer(
                    question
                );


            chat.innerHTML += `

                <div class="aiBubble">
                    ${answer}
                </div>

            `;


            chat.scrollTop =
                chat.scrollHeight;

        },
        500
    );
}


// =====================================================
// SECURITY HELPER
// =====================================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}


// =====================================================
// ENTER KEY
// =====================================================

document
    .getElementById("question")
    .addEventListener(
        "keypress",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                sendQuestion();
            }

        }
    );


// =====================================================
// START
// =====================================================

updateStatus();

setInterval(
    updateStatus,
    UPDATE_INTERVAL
);
