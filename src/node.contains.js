/**
 * Ancestor check support
 * @module contains
 */
import _ from "./utils";
import $Node from "./node";
import $Element from "./element";

/**
 * Check if element is inside of context
 * @memberOf module:contains
 * @param  {$Element} element element to check
 * @return {Boolean} true if success
 */
$Node.prototype.contains = function(element) {
    var node = this._node;

    if (element instanceof $Element) {
        return node && element.every((el) => node.contains(el._node));
    }

    throw _.makeError("contains");
};
