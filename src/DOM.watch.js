define(["DOM", "Element"], function(DOM, $Element, _some, _defer, _forEach, _forOwn, SelectorMatcher, CSSRule) {
    "use strict";

    // WATCH CALLBACK
    // --------------

    /**
     * Execute callback when element with specified selector is found in document tree
     * @memberOf DOM
     * @param {String} selector css selector
     * @param {Fuction} callback event handler
     * @param {Boolean} [once] execute callback only at the first time
     * @function
     */
    DOM.watch = (function() {
        var animId = "DOM" + new Date().getTime(),
            watchers = [],
            cssPrefix, link;

        if (window.CSSKeyframesRule || !document.attachEvent) {
            // Inspired by trick discovered by Daniel Buchner:
            // https://github.com/csuwldcat/SelectorListener
            cssPrefix = CSSRule.KEYFRAMES_RULE ? "" : "-webkit-";

            DOM.importStyles("@" + cssPrefix + "keyframes " + animId, "1% {opacity: .99}");

            document.addEventListener(cssPrefix ? "webkitAnimationStart" : "animationstart", function(e) {
                var node = e.target;

                if (e.animationName === animId) {
                    _forEach(watchers, function(entry) {
                        // do not execute callback if it was previously excluded
                        if (_some(e.detail, function(x) { return x === entry.callback })) return;

                        if (entry.matcher.test(node)) {
                            if (entry.once) node.addEventListener(e.type, entry.once, false);

                            _defer(function() { entry.callback($Element(node)) });
                        }
                    });
                }
            }, false);

            return function(selector, callback, once) {
                var behaviorExists = _some(watchers, function(x) { return x.matcher.selector === selector });

                watchers.push({
                    callback: callback,
                    matcher: new SelectorMatcher(selector),
                    once: once && function(e) {
                        if (e.animationName === animId) {
                            (e.detail = e.detail || []).push(callback);
                        }
                    }
                });

                if (!behaviorExists) {
                    DOM.importStyles(selector, {
                        "animation-duration": "1ms",
                        "animation-name": animId + " !important"
                    });
                }
            };
        } else {
            link = document.querySelector("link[rel=htc]");

            if (!link) throw "You forgot to include <link> with rel='htc' on your page!";

            document.attachEvent("ondataavailable", function() {
                var e = window.event,
                    node = e.srcElement;

                if (e.srcUrn === "dataavailable") {
                    _forEach(watchers, function(entry) {
                        // do not execute callback if it was previously excluded
                        if (_some(e.detail, function(x) { return x === entry.callback })) return;

                        if (entry.matcher.test(node)) {
                            if (entry.once) node.attachEvent("on" + e.type, entry.once);

                            _defer(function() { entry.callback($Element(node)) });
                        }
                    });
                }
            });

            return function(selector, callback, once) {
                var behaviorExists = _some(watchers, function(x) { return x.matcher.selector === selector });

                // do safe call of the callback for each matched element
                // because the behaviour is already attached to selector
                DOM.findAll(selector).each(function(el) {
                    if (el._node.behaviorUrns.length > 0) {
                        _defer(function() { callback(el) });
                    }
                });

                watchers.push({
                    callback: callback,
                    matcher: new SelectorMatcher(selector),
                    once: once && function() {
                        var e = window.event;

                        if (e.srcUrn === "dataavailable") {
                            (e.detail = e.detail || []).push(callback);
                        }
                    }
                });

                if (!behaviorExists) DOM.importStyles(selector, {behavior: "url(" + link.href + ") !important"});
            };
        }
    }());
});
