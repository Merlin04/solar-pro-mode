void function() {
    /* this function will be injected into the page */
    /* not run in the extension context */
    const old = window["showCourseInfoInDialog"];
    window["showCourseInfoInDialog"] = function(...args) {
        old(...args);
        const [ url ] = args;
        document.dispatchEvent(new CustomEvent("plasmo:showCourseInfoInDialog", { detail: url }));
    };
}();