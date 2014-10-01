import { MethodError } from "../errors";
import { DOM2_EVENTS } from "../const";
import { $Element, $NullElement } from "../types";

/**
 * Unbind an event from the element
 * @memberOf module:events
 * @param  {String}          type type of event
 * @param  {Function|String} [callback] event handler
 * @return {$Element}
 */
$Element.prototype.off = function(type, callback) {
    if (typeof type !== "string") throw new MethodError("off");

    var node = this[0];

    this._._handlers = this._._handlers.filter((handler) => {
        if (type !== handler.type || callback && callback !== handler.callback) return true;

        type = handler._type || handler.type;

        if (DOM2_EVENTS) {
            node.removeEventListener(type, handler, !!handler.capturing);
        } else {
            node.detachEvent("on" + type, handler);
        }
    });

    return this;
};

$NullElement.prototype.off = function() {
    return this;
};
