import type { PlasmoCSConfig } from "plasmo";
import { useStorage } from "@plasmohq/storage/hook";
import cssText from "data-text:~style.css";
import { useEffect } from "react";
import { createState } from "niue";

export const config: PlasmoCSConfig = {
    // only run on solar.reed.edu
    matches: ["https://solar.reed.edu/*"],
    // world: "MAIN" // doesn't seem to work with firefox
};

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = cssText;
    return style;
};

type Course = {
    name: string;
    termId: string;
    courseId: string;
};

const useCourses = () => {
    return useStorage("courses", [] as Course[])
};

const useSettings = () => {
    return useStorage("settings", {
        armed: null as boolean | null,
        autoAuth: false,
        pin: "",
        for: "All"
    });
};

const [useStore, patch] = createState({
    active: false,
    pageCourse: null as Course | null,
    isAutoRegistering: false,
    isRegistrationComplete: false
});

getCourse().then(c => patch({ pageCourse: c }));

let lastArmed = null;

const regModeRegex = /(.*All courses available.*)|(.*You may ADD, DROP or waitlist fall \d+ and spring \d+ courses.*)/;

let isClosed = (settings: ReturnType<typeof useSettings>[0]) => document.head.getElementsByTagName("title")[0].innerText.includes("closed")
    || (
        settings.for === "All" &&
        document.querySelector("#current-reg-mode") &&
        !(document.querySelector("#current-reg-mode") as HTMLElement).innerText.match(regModeRegex)
    );

export default function Content() {
    const { active } = useStore();
    const [settings, setSettings] = useSettings();
    const doRegister = useDoRegister();

    useEffect(() => {
        const handler = async (e: CustomEvent) => {
            patch({ pageCourse: await getCourse("http://a.b" + e.detail) });
        };

        document.addEventListener("plasmo:showCourseInfoInDialog", handler);
        return () => document.removeEventListener("plasmo:showCourseInfoInDialog", handler);
    }, []);

    useEffect(() => {
        if(window.location.href.includes("/login") && settings.autoAuth && settings.pin) {
            document.querySelector("#login_pin")?.setAttribute("value", settings.pin);
            (document.querySelector("input[value='Log in']") as HTMLInputElement | null)?.click();
        }
    }, [settings]);

    useEffect(() => {
        if(lastArmed !== null) return;
        lastArmed = settings.armed;
        if(window.location.href === "https://solar.reed.edu/" && settings.armed && !isClosed(settings)) {
            doRegister();
        }
    }, [settings.armed]);

    useEffect(() => {
        if(settings.armed && isClosed(settings)) {
            setTimeout(() => window.location.reload(), 5000);
        }
    }, [settings.armed])
    
    return (
        <div className="fixed right-8 bottom-8 max-h-[calc(100%-3rem)] overflow-auto">
            {active ? (
                <Dialog />
            ) : (
                <button className="bg-gray-800 text-white hover:italic p-4 rounded-full text-xl opacity-90" onClick={() => patch({ active: true })}>
                    🌞👨‍💻
                </button>
            )}
        </div>
    );
}

function Dialog() {
    return (
        <div className="bg-gray-800 text-white rounded p-4 flex flex-col opacity-90 min-w-[300px] max-w-[500px]">
            <div className="text-lg text-center flex flex-row gap-2 justify-between">
                <h1 className="text-lg text-center">SOLAR Pro Mode 🌞👨‍💻</h1>
                <span className="cursor-pointer select-none hover:italic" onClick={() => patch({ active: false })}>[x]</span>
            </div>
            <span><strong>Links: </strong> <a href="https://github.com/Merlin04/solar-pro-mode/blob/main/README.md#how-to-use" className="text-blue-500 underline font-bold">Instruction manual</a> <a
                href="/" className="text-blue-500 underline">SOLAR main</a> <a href="/class_schedule"
                                                                               className="text-blue-500 underline">Class Schedule</a></span>
            <hr className="my-4"/>
            {/* render the Add component if we're on a /class_schedule url, otherwise show the register page */}
            {window.location.href.includes("/class_schedule") && <Add />}
            <Register />
            <TheList />
        </div>
    );
}

function Register() {
    const [settings, setSettings] = useSettings();
    const { isAutoRegistering, isRegistrationComplete } = useStore();
    const doRegister = useDoRegister();

    return (
        <div className="flex flex-col gap-4">
            { isRegistrationComplete ? (
                <p className="text-black bg-white font-bold p-2">Finished auto-registration. If it didn&apos;t work, try again by reloading the page/clicking register (or register manually; there&apos;s a chance something in SOLAR changed that broke the extension)</p>
            ) : isAutoRegistering ? (
                <p className="text-green-500 bg-white font-bold p-2">Auto-registration in progress...</p>
            ) : (
                <p className="text-red-500 bg-white font-bold p-2">Not currently in the process of auto-registering. If you expected to be registering right now, click the green Register button.</p>
            ) }
            <p><strong>Registration parameters</strong></p>
            <div className="flex flex-row flex-wrap gap-4">
                <label className="flex flex-col gap-2">
                    <span>Pin</span>
                    <input className="text-black max-w-[100px]" type="text" value={settings.pin} onChange={e => setSettings({ ...settings, pin: e.target.value })} />
                </label>
                <label className="flex flex-col gap-2">
                    <span>Auto-auth</span>
                    <input type="checkbox" checked={settings.autoAuth} onChange={e => setSettings({ ...settings, autoAuth: e.target.checked })} />
                </label>
                <label className="flex flex-col gap-2">
                    <span>Armed</span>
                    <input type="checkbox" checked={settings.armed} onChange={e => setSettings({ ...settings, armed: e.target.checked })} />
                </label>
                <label className="flex flex-col gap-2">
                    <span>Register when SOLAR is in:</span>
                    <select className="text-black" value={settings.for}
                            onChange={e => setSettings({ ...settings, for: e.target.value })}>
                        <option value="Any">partial registration mode (registering for first choice)</option>
                        <option value="All">open registration mode (registering for the rest of your classes)</option>
                    </select>
                </label>
            </div>
            {!window.location.href.includes("/class_schedule") && (
                <button className="btn-sm bg-green-500" onClick={doRegister}>Register!</button>
            )}
            <hr />
        </div>
    );
}

const useDoRegister = () => {
    const [courses] = useCourses();

    return async function doRegister() {
        patch({ active: true, isAutoRegistering: true, isRegistrationComplete: false });
    
        // register for each of the classes in the list
        const statuses: { [key: string]: boolean } = {};
    
        const registerForOne = async (course: Course) => {
            const req = await fetch(`https://solar.reed.edu/scheduler/${course.termId}/add/${course.courseId}`, {
                "credentials": "include",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
                    "Accept": "*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript",
                    "Accept-Language": "en-US,en;q=0.5",
                    "X-CSRF-Token": document.querySelector("meta[name='csrf-token']")?.getAttribute("content") || "",
                    "X-Requested-With": "XMLHttpRequest"
                },
                "referrer": `https://solar.reed.edu/scheduler/${course.termId}`,
                "method": "POST",
                "mode": "cors"
            });
            const t = await req.text();
            const status = !(t.includes("alert-danger") || t.includes("alert-warning"));
            if(!status) {
                console.error("Error adding course", course, t);
            }
            statuses[course.name] = status;
            let $ = (selector) => {
                return {
                    replaceWith(html) {
                        try {
                            console.log("Replacing", selector, "with", html);
                            (document.querySelector(selector) as HTMLElement).outerHTML = html.replaceAll(" fade", "");
                        } catch(err) { console.warn(err); }
                    },
                    fadeIn() {
                        // just show it
                        try {
                            console.log("Showing", selector);
                            (document.querySelector(selector) as HTMLElement).style.display = "block";
                        } catch(err) { console.warn(err); }
                    },
                    fadeOut() {
                        // just hide it
                        try {
                            console.log("Hiding", selector);
                            (document.querySelector(selector) as HTMLElement).style.display = "none";
                        } catch(err) { console.warn(err); }
                    },
                    text(t: string) {
                        try {
                            console.log("Setting text of", selector, "to", t);
                            (document.querySelector(selector) as HTMLElement).innerText = t;
                        } catch(err) { console.warn(err); }
                    },
                    hide() {
                        try {
                            console.log("Hiding", selector);
                            (document.querySelector(selector) as HTMLElement).style.display = "none";
                        } catch(err) { console.warn(err); }
                    },
                    html(t: string) {
                        try {
                            console.log("Setting html of", selector, "to", t);
                            (document.querySelector(selector) as HTMLElement).outerHTML = t;
                        } catch(err) { console.warn(err); }
                    }
                }
            };
            try {
                (new Function("$", t))($);
            } catch(e) {
                console.error("Error running JS", e);
            }
        };

        for(const course of courses) {
            let attempts = 0;
            while(attempts < 3 && !statuses[course.name]) {
                if(attempts > 0) {
                    console.log("Retrying", course.name);
                    await new Promise(r => setTimeout(r, 500)); // wait a bit, sometimes the server gets sad
                }
                await registerForOne(course);
                attempts++;
            }
        }

        // show a message with the results (alert)
        alert("Registration status"
        + Object.entries(statuses).map(([name, status]) => `\n${name}: ${status ? "✅" : "❌"}`).join("") + "\nSee console for error messages.");
        
        patch({ isRegistrationComplete: true });
    }
}

const sc = document.createElement("script");
sc.src = chrome.runtime.getURL("assets/hook.js");
document.body.appendChild(sc);

async function getCourse(href: string = window.location.href): Promise<Course | null> {
    if(!href.includes("course_information")) return null;
    // extract from URL
    const url = new URL(href);
    // url is in format /class_schedule/course_information/[course_id]/[term_id]
    const s = url.pathname.split("/");
    const courseId = s[3];
    const termId = s[4].replaceAll(".html", "");
    // get course name from page
    // we're probably in the main class_schedule page, so we have to get it from the popup
    const popup = Array.from(document.querySelectorAll(".ui-dialog")).find((e: HTMLElement) => e.style.display === "block");
    if(!popup && href !== window.location.href) return null;
    let courseName = ((popup || document).querySelector("#section_info") as HTMLSpanElement | null)?.innerText.replaceAll("\n", " ");
    if(!courseName && (popup as HTMLElement).innerText.includes("Loading")) {
        // it's loading,, use a mutation observer to wait for it to finish
        await new Promise<void>((resolve) => {
            const observer = new MutationObserver(() => {
                courseName = ((popup.querySelector("#section_info")) as HTMLSpanElement)?.innerText.replaceAll("\n", " ");
                if(courseName) {
                    observer.disconnect();
                    resolve();
                }
            });
            observer.observe(popup, { subtree: true, childList: true });
        });
    }

    return {
        name: courseName,
        termId,
        courseId
    };
}

function Add() {
    const [courses, setCourses] = useCourses();
    const { pageCourse } = useStore(["pageCourse"]);

    return (
        <div className="flex flex-col gap-4">
            {pageCourse ? (
                <>
                    <p><strong>Currently detected: </strong>{pageCourse.name} (id: {pageCourse.courseId}, tId: {pageCourse.termId})</p>
                    <button className="btn-sm" onClick={() => {
                        setCourses([...courses, pageCourse]);
                    }}>Add to list</button>
                </>
            ) : (
                <p><strong>No course detected on this page.</strong> Try selecting a course from the class schedule (click on its name in the table). If it still doesn't work, reload, open this dialog, and then try clicking the course</p>
            )}
        </div>
    )
}

function TheList() {
    // the list,,,,
    const [courses, setCourses] = useCourses();

    return (
        courses.length > 0 ? (
            <div>
                <p><strong>Courses in list:</strong></p>
                <ul className="flex flex-col gap-2">
                    {courses.map((c, i) => (
                        <li key={i} className="flex flex-row gap-2">
                            <span>{c.name} (id: {c.courseId}, tId: {c.termId})</span>
                            <button className="btn-sm bg-red-500" onClick={() => {
                                if(!confirm("Are you sure you want to remove the course " + c.name + " from the list?")) return;
                                setCourses(courses.filter((_, j) => j !== i));
                            }}>Remove</button>
                            {/* move up and down */}
                            <button className="btn-sm bg-gray-500" onClick={() => {
                                if(i === 0) return;
                                const newCourses = [...courses];
                                newCourses[i] = newCourses[i - 1];
                                newCourses[i - 1] = c;
                                setCourses(newCourses);
                            }}>↑</button>
                            <button className="btn-sm bg-gray-500" onClick={() => {
                                if(i === courses.length - 1) return;
                                const newCourses = [...courses];
                                newCourses[i] = newCourses[i + 1];
                                newCourses[i + 1] = c;
                                setCourses(newCourses);
                            }}>↓</button>
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            <p><strong>No courses added yet.</strong> Try adding a course from the class schedule.</p>
        )
    )
}
