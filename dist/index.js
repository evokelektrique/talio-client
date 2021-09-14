/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! regenerator-runtime */ "./node_modules/regenerator-runtime/runtime.js");


/***/ }),

/***/ "./node_modules/just-performance/dist/esm/browser.js":
/*!***********************************************************!*\
  !*** ./node_modules/just-performance/dist/esm/browser.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "performance": () => (/* binding */ performance)
/* harmony export */ });
const universal = typeof globalThis !== "undefined" ? globalThis : __webpack_require__.g;
const performance = universal.performance;

//# sourceMappingURL=browser.js.map

/***/ }),

/***/ "./node_modules/limiter/dist/esm/RateLimiter.js":
/*!******************************************************!*\
  !*** ./node_modules/limiter/dist/esm/RateLimiter.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RateLimiter": () => (/* binding */ RateLimiter)
/* harmony export */ });
/* harmony import */ var _TokenBucket_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TokenBucket.js */ "./node_modules/limiter/dist/esm/TokenBucket.js");
/* harmony import */ var _clock_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./clock.js */ "./node_modules/limiter/dist/esm/clock.js");


/**
 * A generic rate limiter. Underneath the hood, this uses a token bucket plus
 * an additional check to limit how many tokens we can remove each interval.
 *
 * @param options
 * @param options.tokensPerInterval Maximum number of tokens that can be
 *  removed at any given moment and over the course of one interval.
 * @param options.interval The interval length in milliseconds, or as
 *  one of the following strings: 'second', 'minute', 'hour', day'.
 * @param options.fireImmediately Whether or not the promise will resolve
 *  immediately when rate limiting is in effect (default is false).
 */
class RateLimiter {
    constructor({ tokensPerInterval, interval, fireImmediately }) {
        this.tokenBucket = new _TokenBucket_js__WEBPACK_IMPORTED_MODULE_0__.TokenBucket({
            bucketSize: tokensPerInterval,
            tokensPerInterval,
            interval,
        });
        // Fill the token bucket to start
        this.tokenBucket.content = tokensPerInterval;
        this.curIntervalStart = (0,_clock_js__WEBPACK_IMPORTED_MODULE_1__.getMilliseconds)();
        this.tokensThisInterval = 0;
        this.fireImmediately = fireImmediately !== null && fireImmediately !== void 0 ? fireImmediately : false;
    }
    /**
     * Remove the requested number of tokens. If the rate limiter contains enough
     * tokens and we haven't spent too many tokens in this interval already, this
     * will happen immediately. Otherwise, the removal will happen when enough
     * tokens become available.
     * @param count The number of tokens to remove.
     * @returns A promise for the remainingTokens count.
     */
    async removeTokens(count) {
        // Make sure the request isn't for more than we can handle
        if (count > this.tokenBucket.bucketSize) {
            throw new Error(`Requested tokens ${count} exceeds maximum tokens per interval ${this.tokenBucket.bucketSize}`);
        }
        const now = (0,_clock_js__WEBPACK_IMPORTED_MODULE_1__.getMilliseconds)();
        // Advance the current interval and reset the current interval token count
        // if needed
        if (now < this.curIntervalStart || now - this.curIntervalStart >= this.tokenBucket.interval) {
            this.curIntervalStart = now;
            this.tokensThisInterval = 0;
        }
        // If we don't have enough tokens left in this interval, wait until the
        // next interval
        if (count > this.tokenBucket.tokensPerInterval - this.tokensThisInterval) {
            if (this.fireImmediately) {
                return -1;
            }
            else {
                const waitMs = Math.ceil(this.curIntervalStart + this.tokenBucket.interval - now);
                await (0,_clock_js__WEBPACK_IMPORTED_MODULE_1__.wait)(waitMs);
                const remainingTokens = await this.tokenBucket.removeTokens(count);
                this.tokensThisInterval += count;
                return remainingTokens;
            }
        }
        // Remove the requested number of tokens from the token bucket
        const remainingTokens = await this.tokenBucket.removeTokens(count);
        this.tokensThisInterval += count;
        return remainingTokens;
    }
    /**
     * Attempt to remove the requested number of tokens and return immediately.
     * If the bucket (and any parent buckets) contains enough tokens and we
     * haven't spent too many tokens in this interval already, this will return
     * true. Otherwise, false is returned.
     * @param {Number} count The number of tokens to remove.
     * @param {Boolean} True if the tokens were successfully removed, otherwise
     *  false.
     */
    tryRemoveTokens(count) {
        // Make sure the request isn't for more than we can handle
        if (count > this.tokenBucket.bucketSize)
            return false;
        const now = (0,_clock_js__WEBPACK_IMPORTED_MODULE_1__.getMilliseconds)();
        // Advance the current interval and reset the current interval token count
        // if needed
        if (now < this.curIntervalStart || now - this.curIntervalStart >= this.tokenBucket.interval) {
            this.curIntervalStart = now;
            this.tokensThisInterval = 0;
        }
        // If we don't have enough tokens left in this interval, return false
        if (count > this.tokenBucket.tokensPerInterval - this.tokensThisInterval)
            return false;
        // Try to remove the requested number of tokens from the token bucket
        const removed = this.tokenBucket.tryRemoveTokens(count);
        if (removed) {
            this.tokensThisInterval += count;
        }
        return removed;
    }
    /**
     * Returns the number of tokens remaining in the TokenBucket.
     * @returns {Number} The number of tokens remaining.
     */
    getTokensRemaining() {
        this.tokenBucket.drip();
        return this.tokenBucket.content;
    }
}
//# sourceMappingURL=RateLimiter.js.map

/***/ }),

/***/ "./node_modules/limiter/dist/esm/TokenBucket.js":
/*!******************************************************!*\
  !*** ./node_modules/limiter/dist/esm/TokenBucket.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TokenBucket": () => (/* binding */ TokenBucket)
/* harmony export */ });
/* harmony import */ var _clock_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./clock.js */ "./node_modules/limiter/dist/esm/clock.js");

/**
 * A hierarchical token bucket for rate limiting. See
 * http://en.wikipedia.org/wiki/Token_bucket for more information.
 *
 * @param options
 * @param options.bucketSize Maximum number of tokens to hold in the bucket.
 *  Also known as the burst rate.
 * @param options.tokensPerInterval Number of tokens to drip into the bucket
 *  over the course of one interval.
 * @param options.interval The interval length in milliseconds, or as
 *  one of the following strings: 'second', 'minute', 'hour', day'.
 * @param options.parentBucket Optional. A token bucket that will act as
 *  the parent of this bucket.
 */
class TokenBucket {
    constructor({ bucketSize, tokensPerInterval, interval, parentBucket }) {
        this.bucketSize = bucketSize;
        this.tokensPerInterval = tokensPerInterval;
        if (typeof interval === "string") {
            switch (interval) {
                case "sec":
                case "second":
                    this.interval = 1000;
                    break;
                case "min":
                case "minute":
                    this.interval = 1000 * 60;
                    break;
                case "hr":
                case "hour":
                    this.interval = 1000 * 60 * 60;
                    break;
                case "day":
                    this.interval = 1000 * 60 * 60 * 24;
                    break;
                default:
                    throw new Error("Invalid interval " + interval);
            }
        }
        else {
            this.interval = interval;
        }
        this.parentBucket = parentBucket;
        this.content = 0;
        this.lastDrip = (0,_clock_js__WEBPACK_IMPORTED_MODULE_0__.getMilliseconds)();
    }
    /**
     * Remove the requested number of tokens. If the bucket (and any parent
     * buckets) contains enough tokens this will happen immediately. Otherwise,
     * the removal will happen when enough tokens become available.
     * @param count The number of tokens to remove.
     * @returns A promise for the remainingTokens count.
     */
    async removeTokens(count) {
        // Is this an infinite size bucket?
        if (this.bucketSize === 0) {
            return Number.POSITIVE_INFINITY;
        }
        // Make sure the bucket can hold the requested number of tokens
        if (count > this.bucketSize) {
            throw new Error(`Requested tokens ${count} exceeds bucket size ${this.bucketSize}`);
        }
        // Drip new tokens into this bucket
        this.drip();
        const comeBackLater = async () => {
            // How long do we need to wait to make up the difference in tokens?
            const waitMs = Math.ceil((count - this.content) * (this.interval / this.tokensPerInterval));
            await (0,_clock_js__WEBPACK_IMPORTED_MODULE_0__.wait)(waitMs);
            return this.removeTokens(count);
        };
        // If we don't have enough tokens in this bucket, come back later
        if (count > this.content)
            return comeBackLater();
        if (this.parentBucket != undefined) {
            // Remove the requested from the parent bucket first
            const remainingTokens = await this.parentBucket.removeTokens(count);
            // Check that we still have enough tokens in this bucket
            if (count > this.content)
                return comeBackLater();
            // Tokens were removed from the parent bucket, now remove them from
            // this bucket. Note that we look at the current bucket and parent
            // bucket's remaining tokens and return the smaller of the two values
            this.content -= count;
            return Math.min(remainingTokens, this.content);
        }
        else {
            // Remove the requested tokens from this bucket
            this.content -= count;
            return this.content;
        }
    }
    /**
     * Attempt to remove the requested number of tokens and return immediately.
     * If the bucket (and any parent buckets) contains enough tokens this will
     * return true, otherwise false is returned.
     * @param {Number} count The number of tokens to remove.
     * @param {Boolean} True if the tokens were successfully removed, otherwise
     *  false.
     */
    tryRemoveTokens(count) {
        // Is this an infinite size bucket?
        if (!this.bucketSize)
            return true;
        // Make sure the bucket can hold the requested number of tokens
        if (count > this.bucketSize)
            return false;
        // Drip new tokens into this bucket
        this.drip();
        // If we don't have enough tokens in this bucket, return false
        if (count > this.content)
            return false;
        // Try to remove the requested tokens from the parent bucket
        if (this.parentBucket && !this.parentBucket.tryRemoveTokens(count))
            return false;
        // Remove the requested tokens from this bucket and return
        this.content -= count;
        return true;
    }
    /**
     * Add any new tokens to the bucket since the last drip.
     * @returns {Boolean} True if new tokens were added, otherwise false.
     */
    drip() {
        if (this.tokensPerInterval === 0) {
            const prevContent = this.content;
            this.content = this.bucketSize;
            return this.content > prevContent;
        }
        const now = (0,_clock_js__WEBPACK_IMPORTED_MODULE_0__.getMilliseconds)();
        const deltaMS = Math.max(now - this.lastDrip, 0);
        this.lastDrip = now;
        const dripAmount = deltaMS * (this.tokensPerInterval / this.interval);
        const prevContent = this.content;
        this.content = Math.min(this.content + dripAmount, this.bucketSize);
        return Math.floor(this.content) > Math.floor(prevContent);
    }
}
//# sourceMappingURL=TokenBucket.js.map

/***/ }),

/***/ "./node_modules/limiter/dist/esm/clock.js":
/*!************************************************!*\
  !*** ./node_modules/limiter/dist/esm/clock.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getMilliseconds": () => (/* binding */ getMilliseconds),
/* harmony export */   "wait": () => (/* binding */ wait)
/* harmony export */ });
/* harmony import */ var just_performance__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! just-performance */ "./node_modules/just-performance/dist/esm/browser.js");

// generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime
function hrtime(previousTimestamp) {
    const clocktime = just_performance__WEBPACK_IMPORTED_MODULE_0__.performance.now() * 1e-3;
    let seconds = Math.floor(clocktime);
    let nanoseconds = Math.floor((clocktime % 1) * 1e9);
    if (previousTimestamp != undefined) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds < 0) {
            seconds--;
            nanoseconds += 1e9;
        }
    }
    return [seconds, nanoseconds];
}
// The current timestamp in whole milliseconds
function getMilliseconds() {
    const [seconds, nanoseconds] = hrtime();
    return seconds * 1e3 + Math.floor(nanoseconds / 1e6);
}
// Wait for a specified number of milliseconds before fulfilling the returned promise.
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=clock.js.map

/***/ }),

/***/ "./node_modules/limiter/dist/esm/index.js":
/*!************************************************!*\
  !*** ./node_modules/limiter/dist/esm/index.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RateLimiter": () => (/* reexport safe */ _RateLimiter_js__WEBPACK_IMPORTED_MODULE_0__.RateLimiter),
/* harmony export */   "TokenBucket": () => (/* reexport safe */ _TokenBucket_js__WEBPACK_IMPORTED_MODULE_1__.TokenBucket)
/* harmony export */ });
/* harmony import */ var _RateLimiter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RateLimiter.js */ "./node_modules/limiter/dist/esm/RateLimiter.js");
/* harmony import */ var _TokenBucket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TokenBucket.js */ "./node_modules/limiter/dist/esm/TokenBucket.js");


//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/murmurhash/murmurhash.js":
/*!***********************************************!*\
  !*** ./node_modules/murmurhash/murmurhash.js ***!
  \***********************************************/
/***/ ((module) => {

(function(){
  var _global = this;

  const createBuffer = (val) => new TextEncoder().encode(val)

  /**
   * JS Implementation of MurmurHash2
   *
   * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
   * @see http://github.com/garycourt/murmurhash-js
   * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
   * @see http://sites.google.com/site/murmurhash/
   *
   * @param {Uint8Array | string} str ASCII only
   * @param {number} seed Positive integer only
   * @return {number} 32-bit positive integer hash
   */
  function MurmurHashV2(str, seed) {
    if (typeof str === 'string') str = createBuffer(str);
    var
      l = str.length,
      h = seed ^ l,
      i = 0,
      k;

    while (l >= 4) {
      k =
        ((str[i] & 0xff)) |
        ((str[++i] & 0xff) << 8) |
        ((str[++i] & 0xff) << 16) |
        ((str[++i] & 0xff) << 24);

      k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
      k ^= k >>> 24;
      k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

    h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

      l -= 4;
      ++i;
    }

    switch (l) {
    case 3: h ^= (str[i + 2] & 0xff) << 16;
    case 2: h ^= (str[i + 1] & 0xff) << 8;
    case 1: h ^= (str[i] & 0xff);
            h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    }

    h ^= h >>> 13;
    h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    h ^= h >>> 15;

    return h >>> 0;
  };

  /**
   * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
   *
   * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
   * @see http://github.com/garycourt/murmurhash-js
   * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
   * @see http://sites.google.com/site/murmurhash/
   *
   * @param {Uint8Array | string} key ASCII only
   * @param {number} seed Positive integer only
   * @return {number} 32-bit positive integer hash
   */
  function MurmurHashV3(key, seed) {
    if (typeof key === 'string') key = createBuffer(key);

    var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

    remainder = key.length & 3; // key.length % 4
    bytes = key.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;

    while (i < bytes) {
        k1 =
          ((key[i] & 0xff)) |
          ((key[++i] & 0xff) << 8) |
          ((key[++i] & 0xff) << 16) |
          ((key[++i] & 0xff) << 24);
      ++i;

      k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

      h1 ^= k1;
          h1 = (h1 << 13) | (h1 >>> 19);
      h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
      h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }

    k1 = 0;

    switch (remainder) {
      case 3: k1 ^= (key[i + 2] & 0xff) << 16;
      case 2: k1 ^= (key[i + 1] & 0xff) << 8;
      case 1: k1 ^= (key[i] & 0xff);

      k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= k1;
    }

    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
  }

  var murmur = MurmurHashV3;
  murmur.v2 = MurmurHashV2;
  murmur.v3 = MurmurHashV3;

  if (true) {
    module.exports = murmur;
  } else { var _previousRoot; }
}());


/***/ }),

/***/ "./node_modules/phoenix/priv/static/phoenix.js":
/*!*****************************************************!*\
  !*** ./node_modules/phoenix/priv/static/phoenix.js ***!
  \*****************************************************/
/***/ (function(module) {

!function(e,t){ true?module.exports=t():0}(this,(function(){return function(e){var t={};function n(i){if(t[i])return t[i].exports;var o=t[i]={i:i,l:!1,exports:{}};return e[i].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(i,o,function(t){return e[t]}.bind(null,o));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){(function(t){e.exports=t.Phoenix=n(2)}).call(this,n(1))},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n},function(e,t,n){"use strict";function i(e){return function(e){if(Array.isArray(e))return a(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||s(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],i=!0,o=!1,r=void 0;try{for(var s,a=e[Symbol.iterator]();!(i=(s=a.next()).done)&&(n.push(s.value),!t||n.length!==t);i=!0);}catch(e){o=!0,r=e}finally{try{i||null==a.return||a.return()}finally{if(o)throw r}}return n}(e,t)||s(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function s(e,t){if(e){if("string"==typeof e)return a(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?a(e,t):void 0}}function a(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,i=new Array(t);n<t;n++)i[n]=e[n];return i}function c(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function u(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function h(e,t,n){return t&&u(e.prototype,t),n&&u(e,n),e}n.r(t),n.d(t,"Channel",(function(){return _})),n.d(t,"Serializer",(function(){return H})),n.d(t,"Socket",(function(){return U})),n.d(t,"LongPoll",(function(){return D})),n.d(t,"Ajax",(function(){return M})),n.d(t,"Presence",(function(){return N}));var l="undefined"!=typeof self?self:null,f="undefined"!=typeof window?window:null,d=l||f||void 0,p=0,v=1,y=2,m=3,g="closed",k="errored",b="joined",j="joining",C="leaving",E="phx_close",R="phx_error",T="phx_join",S="phx_reply",w="phx_leave",A=[E,R,T,S,w],L="longpoll",x="websocket",O=function(e){if("function"==typeof e)return e;return function(){return e}},P=function(){function e(t,n,i,o){c(this,e),this.channel=t,this.event=n,this.payload=i||function(){return{}},this.receivedResp=null,this.timeout=o,this.timeoutTimer=null,this.recHooks=[],this.sent=!1}return h(e,[{key:"resend",value:function(e){this.timeout=e,this.reset(),this.send()}},{key:"send",value:function(){this.hasReceived("timeout")||(this.startTimeout(),this.sent=!0,this.channel.socket.push({topic:this.channel.topic,event:this.event,payload:this.payload(),ref:this.ref,join_ref:this.channel.joinRef()}))}},{key:"receive",value:function(e,t){return this.hasReceived(e)&&t(this.receivedResp.response),this.recHooks.push({status:e,callback:t}),this}},{key:"reset",value:function(){this.cancelRefEvent(),this.ref=null,this.refEvent=null,this.receivedResp=null,this.sent=!1}},{key:"matchReceive",value:function(e){var t=e.status,n=e.response;e.ref;this.recHooks.filter((function(e){return e.status===t})).forEach((function(e){return e.callback(n)}))}},{key:"cancelRefEvent",value:function(){this.refEvent&&this.channel.off(this.refEvent)}},{key:"cancelTimeout",value:function(){clearTimeout(this.timeoutTimer),this.timeoutTimer=null}},{key:"startTimeout",value:function(){var e=this;this.timeoutTimer&&this.cancelTimeout(),this.ref=this.channel.socket.makeRef(),this.refEvent=this.channel.replyEventName(this.ref),this.channel.on(this.refEvent,(function(t){e.cancelRefEvent(),e.cancelTimeout(),e.receivedResp=t,e.matchReceive(t)})),this.timeoutTimer=setTimeout((function(){e.trigger("timeout",{})}),this.timeout)}},{key:"hasReceived",value:function(e){return this.receivedResp&&this.receivedResp.status===e}},{key:"trigger",value:function(e,t){this.channel.trigger(this.refEvent,{status:e,response:t})}}]),e}(),_=function(){function e(t,n,i){var o=this;c(this,e),this.state=g,this.topic=t,this.params=O(n||{}),this.socket=i,this.bindings=[],this.bindingRef=0,this.timeout=this.socket.timeout,this.joinedOnce=!1,this.joinPush=new P(this,T,this.params,this.timeout),this.pushBuffer=[],this.stateChangeRefs=[],this.rejoinTimer=new J((function(){o.socket.isConnected()&&o.rejoin()}),this.socket.rejoinAfterMs),this.stateChangeRefs.push(this.socket.onError((function(){return o.rejoinTimer.reset()}))),this.stateChangeRefs.push(this.socket.onOpen((function(){o.rejoinTimer.reset(),o.isErrored()&&o.rejoin()}))),this.joinPush.receive("ok",(function(){o.state=b,o.rejoinTimer.reset(),o.pushBuffer.forEach((function(e){return e.send()})),o.pushBuffer=[]})),this.joinPush.receive("error",(function(){o.state=k,o.socket.isConnected()&&o.rejoinTimer.scheduleTimeout()})),this.onClose((function(){o.rejoinTimer.reset(),o.socket.hasLogger()&&o.socket.log("channel","close ".concat(o.topic," ").concat(o.joinRef())),o.state=g,o.socket.remove(o)})),this.onError((function(e){o.socket.hasLogger()&&o.socket.log("channel","error ".concat(o.topic),e),o.isJoining()&&o.joinPush.reset(),o.state=k,o.socket.isConnected()&&o.rejoinTimer.scheduleTimeout()})),this.joinPush.receive("timeout",(function(){o.socket.hasLogger()&&o.socket.log("channel","timeout ".concat(o.topic," (").concat(o.joinRef(),")"),o.joinPush.timeout),new P(o,w,O({}),o.timeout).send(),o.state=k,o.joinPush.reset(),o.socket.isConnected()&&o.rejoinTimer.scheduleTimeout()})),this.on(S,(function(e,t){o.trigger(o.replyEventName(t),e)}))}return h(e,[{key:"join",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.timeout;if(this.joinedOnce)throw new Error("tried to join multiple times. 'join' can only be called a single time per channel instance");return this.timeout=e,this.joinedOnce=!0,this.rejoin(),this.joinPush}},{key:"onClose",value:function(e){this.on(E,e)}},{key:"onError",value:function(e){return this.on(R,(function(t){return e(t)}))}},{key:"on",value:function(e,t){var n=this.bindingRef++;return this.bindings.push({event:e,ref:n,callback:t}),n}},{key:"off",value:function(e,t){this.bindings=this.bindings.filter((function(n){return!(n.event===e&&(void 0===t||t===n.ref))}))}},{key:"canPush",value:function(){return this.socket.isConnected()&&this.isJoined()}},{key:"push",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.timeout;if(t=t||{},!this.joinedOnce)throw new Error("tried to push '".concat(e,"' to '").concat(this.topic,"' before joining. Use channel.join() before pushing events"));var i=new P(this,e,(function(){return t}),n);return this.canPush()?i.send():(i.startTimeout(),this.pushBuffer.push(i)),i}},{key:"leave",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.timeout;this.rejoinTimer.reset(),this.joinPush.cancelTimeout(),this.state=C;var n=function(){e.socket.hasLogger()&&e.socket.log("channel","leave ".concat(e.topic)),e.trigger(E,"leave")},i=new P(this,w,O({}),t);return i.receive("ok",(function(){return n()})).receive("timeout",(function(){return n()})),i.send(),this.canPush()||i.trigger("ok",{}),i}},{key:"onMessage",value:function(e,t,n){return t}},{key:"isLifecycleEvent",value:function(e){return A.indexOf(e)>=0}},{key:"isMember",value:function(e,t,n,i){return this.topic===e&&(!i||i===this.joinRef()||!this.isLifecycleEvent(t)||(this.socket.hasLogger()&&this.socket.log("channel","dropping outdated message",{topic:e,event:t,payload:n,joinRef:i}),!1))}},{key:"joinRef",value:function(){return this.joinPush.ref}},{key:"rejoin",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.timeout;this.isLeaving()||(this.socket.leaveOpenTopic(this.topic),this.state=j,this.joinPush.resend(e))}},{key:"trigger",value:function(e,t,n,i){var o=this.onMessage(e,t,n,i);if(t&&!o)throw new Error("channel onMessage callbacks must return the payload, modified or unmodified");for(var r=this.bindings.filter((function(t){return t.event===e})),s=0;s<r.length;s++){r[s].callback(o,n,i||this.joinRef())}}},{key:"replyEventName",value:function(e){return"chan_reply_".concat(e)}},{key:"isClosed",value:function(){return this.state===g}},{key:"isErrored",value:function(){return this.state===k}},{key:"isJoined",value:function(){return this.state===b}},{key:"isJoining",value:function(){return this.state===j}},{key:"isLeaving",value:function(){return this.state===C}}]),e}(),H={HEADER_LENGTH:1,META_LENGTH:4,KINDS:{push:0,reply:1,broadcast:2},encode:function(e,t){if(e.payload.constructor===ArrayBuffer)return t(this.binaryEncode(e));var n=[e.join_ref,e.ref,e.topic,e.event,e.payload];return t(JSON.stringify(n))},decode:function(e,t){if(e.constructor===ArrayBuffer)return t(this.binaryDecode(e));var n=r(JSON.parse(e),5);return t({join_ref:n[0],ref:n[1],topic:n[2],event:n[3],payload:n[4]})},binaryEncode:function(e){var t=e.join_ref,n=e.ref,i=e.event,o=e.topic,r=e.payload,s=this.META_LENGTH+t.length+n.length+o.length+i.length,a=new ArrayBuffer(this.HEADER_LENGTH+s),c=new DataView(a),u=0;c.setUint8(u++,this.KINDS.push),c.setUint8(u++,t.length),c.setUint8(u++,n.length),c.setUint8(u++,o.length),c.setUint8(u++,i.length),Array.from(t,(function(e){return c.setUint8(u++,e.charCodeAt(0))})),Array.from(n,(function(e){return c.setUint8(u++,e.charCodeAt(0))})),Array.from(o,(function(e){return c.setUint8(u++,e.charCodeAt(0))})),Array.from(i,(function(e){return c.setUint8(u++,e.charCodeAt(0))}));var h=new Uint8Array(a.byteLength+r.byteLength);return h.set(new Uint8Array(a),0),h.set(new Uint8Array(r),a.byteLength),h.buffer},binaryDecode:function(e){var t=new DataView(e),n=t.getUint8(0),i=new TextDecoder;switch(n){case this.KINDS.push:return this.decodePush(e,t,i);case this.KINDS.reply:return this.decodeReply(e,t,i);case this.KINDS.broadcast:return this.decodeBroadcast(e,t,i)}},decodePush:function(e,t,n){var i=t.getUint8(1),o=t.getUint8(2),r=t.getUint8(3),s=this.HEADER_LENGTH+this.META_LENGTH-1,a=n.decode(e.slice(s,s+i));s+=i;var c=n.decode(e.slice(s,s+o));s+=o;var u=n.decode(e.slice(s,s+r));return s+=r,{join_ref:a,ref:null,topic:c,event:u,payload:e.slice(s,e.byteLength)}},decodeReply:function(e,t,n){var i=t.getUint8(1),o=t.getUint8(2),r=t.getUint8(3),s=t.getUint8(4),a=this.HEADER_LENGTH+this.META_LENGTH,c=n.decode(e.slice(a,a+i));a+=i;var u=n.decode(e.slice(a,a+o));a+=o;var h=n.decode(e.slice(a,a+r));a+=r;var l=n.decode(e.slice(a,a+s));a+=s;var f=e.slice(a,e.byteLength);return{join_ref:c,ref:u,topic:h,event:S,payload:{status:l,response:f}}},decodeBroadcast:function(e,t,n){var i=t.getUint8(1),o=t.getUint8(2),r=this.HEADER_LENGTH+2,s=n.decode(e.slice(r,r+i));r+=i;var a=n.decode(e.slice(r,r+o));return r+=o,{join_ref:null,ref:null,topic:s,event:a,payload:e.slice(r,e.byteLength)}}},U=function(){function e(t){var n=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};c(this,e),this.stateChangeCallbacks={open:[],close:[],error:[],message:[]},this.channels=[],this.sendBuffer=[],this.ref=0,this.timeout=i.timeout||1e4,this.transport=i.transport||d.WebSocket||D,this.defaultEncoder=H.encode.bind(H),this.defaultDecoder=H.decode.bind(H),this.closeWasClean=!1,this.unloaded=!1,this.binaryType=i.binaryType||"arraybuffer",this.transport!==D?(this.encode=i.encode||this.defaultEncoder,this.decode=i.decode||this.defaultDecoder):(this.encode=this.defaultEncoder,this.decode=this.defaultDecoder),f&&f.addEventListener&&f.addEventListener("unload",(function(e){n.conn&&(n.unloaded=!0,n.abnormalClose("unloaded"))})),this.heartbeatIntervalMs=i.heartbeatIntervalMs||3e4,this.rejoinAfterMs=function(e){return i.rejoinAfterMs?i.rejoinAfterMs(e):[1e3,2e3,5e3][e-1]||1e4},this.reconnectAfterMs=function(e){return n.unloaded?100:i.reconnectAfterMs?i.reconnectAfterMs(e):[10,50,100,150,200,250,500,1e3,2e3][e-1]||5e3},this.logger=i.logger||null,this.longpollerTimeout=i.longpollerTimeout||2e4,this.params=O(i.params||{}),this.endPoint="".concat(t,"/").concat(x),this.vsn=i.vsn||"2.0.0",this.heartbeatTimer=null,this.pendingHeartbeatRef=null,this.reconnectTimer=new J((function(){n.teardown((function(){return n.connect()}))}),this.reconnectAfterMs)}return h(e,[{key:"protocol",value:function(){return location.protocol.match(/^https/)?"wss":"ws"}},{key:"endPointURL",value:function(){var e=M.appendParams(M.appendParams(this.endPoint,this.params()),{vsn:this.vsn});return"/"!==e.charAt(0)?e:"/"===e.charAt(1)?"".concat(this.protocol(),":").concat(e):"".concat(this.protocol(),"://").concat(location.host).concat(e)}},{key:"disconnect",value:function(e,t,n){this.closeWasClean=!0,this.reconnectTimer.reset(),this.teardown(e,t,n)}},{key:"connect",value:function(e){var t=this;e&&(console&&console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor"),this.params=O(e)),this.conn||(this.closeWasClean=!1,this.conn=new this.transport(this.endPointURL()),this.conn.binaryType=this.binaryType,this.conn.timeout=this.longpollerTimeout,this.conn.onopen=function(){return t.onConnOpen()},this.conn.onerror=function(e){return t.onConnError(e)},this.conn.onmessage=function(e){return t.onConnMessage(e)},this.conn.onclose=function(e){return t.onConnClose(e)})}},{key:"log",value:function(e,t,n){this.logger(e,t,n)}},{key:"hasLogger",value:function(){return null!==this.logger}},{key:"onOpen",value:function(e){var t=this.makeRef();return this.stateChangeCallbacks.open.push([t,e]),t}},{key:"onClose",value:function(e){var t=this.makeRef();return this.stateChangeCallbacks.close.push([t,e]),t}},{key:"onError",value:function(e){var t=this.makeRef();return this.stateChangeCallbacks.error.push([t,e]),t}},{key:"onMessage",value:function(e){var t=this.makeRef();return this.stateChangeCallbacks.message.push([t,e]),t}},{key:"onConnOpen",value:function(){this.hasLogger()&&this.log("transport","connected to ".concat(this.endPointURL())),this.unloaded=!1,this.closeWasClean=!1,this.flushSendBuffer(),this.reconnectTimer.reset(),this.resetHeartbeat(),this.stateChangeCallbacks.open.forEach((function(e){return(0,r(e,2)[1])()}))}},{key:"resetHeartbeat",value:function(){var e=this;this.conn&&this.conn.skipHeartbeat||(this.pendingHeartbeatRef=null,clearInterval(this.heartbeatTimer),this.heartbeatTimer=setInterval((function(){return e.sendHeartbeat()}),this.heartbeatIntervalMs))}},{key:"teardown",value:function(e,t,n){var i=this;if(!this.conn)return e&&e();this.waitForBufferDone((function(){i.conn&&(t?i.conn.close(t,n||""):i.conn.close()),i.waitForSocketClosed((function(){i.conn&&(i.conn.onclose=function(){},i.conn=null),e&&e()}))}))}},{key:"waitForBufferDone",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;5!==n&&this.conn&&this.conn.bufferedAmount?setTimeout((function(){t.waitForBufferDone(e,n+1)}),150*n):e()}},{key:"waitForSocketClosed",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;5!==n&&this.conn&&this.conn.readyState!==m?setTimeout((function(){t.waitForSocketClosed(e,n+1)}),150*n):e()}},{key:"onConnClose",value:function(e){this.hasLogger()&&this.log("transport","close",e),this.triggerChanError(),clearInterval(this.heartbeatTimer),this.closeWasClean||this.reconnectTimer.scheduleTimeout(),this.stateChangeCallbacks.close.forEach((function(t){return(0,r(t,2)[1])(e)}))}},{key:"onConnError",value:function(e){this.hasLogger()&&this.log("transport",e),this.triggerChanError(),this.stateChangeCallbacks.error.forEach((function(t){return(0,r(t,2)[1])(e)}))}},{key:"triggerChanError",value:function(){this.channels.forEach((function(e){e.isErrored()||e.isLeaving()||e.isClosed()||e.trigger(R)}))}},{key:"connectionState",value:function(){switch(this.conn&&this.conn.readyState){case p:return"connecting";case v:return"open";case y:return"closing";default:return"closed"}}},{key:"isConnected",value:function(){return"open"===this.connectionState()}},{key:"remove",value:function(e){this.off(e.stateChangeRefs),this.channels=this.channels.filter((function(t){return t.joinRef()!==e.joinRef()}))}},{key:"off",value:function(e){for(var t in this.stateChangeCallbacks)this.stateChangeCallbacks[t]=this.stateChangeCallbacks[t].filter((function(t){var n=r(t,1)[0];return-1===e.indexOf(n)}))}},{key:"channel",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=new _(e,t,this);return this.channels.push(n),n}},{key:"push",value:function(e){var t=this;if(this.hasLogger()){var n=e.topic,i=e.event,o=e.payload,r=e.ref,s=e.join_ref;this.log("push","".concat(n," ").concat(i," (").concat(s,", ").concat(r,")"),o)}this.isConnected()?this.encode(e,(function(e){return t.conn.send(e)})):this.sendBuffer.push((function(){return t.encode(e,(function(e){return t.conn.send(e)}))}))}},{key:"makeRef",value:function(){var e=this.ref+1;return e===this.ref?this.ref=0:this.ref=e,this.ref.toString()}},{key:"sendHeartbeat",value:function(){if(this.isConnected()){if(this.pendingHeartbeatRef)return this.pendingHeartbeatRef=null,this.hasLogger()&&this.log("transport","heartbeat timeout. Attempting to re-establish connection"),void this.abnormalClose("heartbeat timeout");this.pendingHeartbeatRef=this.makeRef(),this.push({topic:"phoenix",event:"heartbeat",payload:{},ref:this.pendingHeartbeatRef})}}},{key:"abnormalClose",value:function(e){this.closeWasClean=!1,this.conn.readyState===v&&this.conn.close(1e3,e)}},{key:"flushSendBuffer",value:function(){this.isConnected()&&this.sendBuffer.length>0&&(this.sendBuffer.forEach((function(e){return e()})),this.sendBuffer=[])}},{key:"onConnMessage",value:function(e){var t=this;this.decode(e.data,(function(e){var n=e.topic,i=e.event,o=e.payload,s=e.ref,a=e.join_ref;s&&s===t.pendingHeartbeatRef&&(t.pendingHeartbeatRef=null),t.hasLogger()&&t.log("receive","".concat(o.status||""," ").concat(n," ").concat(i," ").concat(s&&"("+s+")"||""),o);for(var c=0;c<t.channels.length;c++){var u=t.channels[c];u.isMember(n,i,o,a)&&u.trigger(i,o,s,a)}for(var h=0;h<t.stateChangeCallbacks.message.length;h++){(0,r(t.stateChangeCallbacks.message[h],2)[1])(e)}}))}},{key:"leaveOpenTopic",value:function(e){var t=this.channels.find((function(t){return t.topic===e&&(t.isJoined()||t.isJoining())}));t&&(this.hasLogger()&&this.log("transport",'leaving duplicate topic "'.concat(e,'"')),t.leave())}}]),e}(),D=function(){function e(t){c(this,e),this.endPoint=null,this.token=null,this.skipHeartbeat=!0,this.onopen=function(){},this.onerror=function(){},this.onmessage=function(){},this.onclose=function(){},this.pollEndpoint=this.normalizeEndpoint(t),this.readyState=p,this.poll()}return h(e,[{key:"normalizeEndpoint",value:function(e){return e.replace("ws://","http://").replace("wss://","https://").replace(new RegExp("(.*)/"+x),"$1/"+L)}},{key:"endpointURL",value:function(){return M.appendParams(this.pollEndpoint,{token:this.token})}},{key:"closeAndRetry",value:function(){this.close(),this.readyState=p}},{key:"ontimeout",value:function(){this.onerror("timeout"),this.closeAndRetry()}},{key:"poll",value:function(){var e=this;this.readyState!==v&&this.readyState!==p||M.request("GET",this.endpointURL(),"application/json",null,this.timeout,this.ontimeout.bind(this),(function(t){if(t){var n=t.status,i=t.token,o=t.messages;e.token=i}else n=0;switch(n){case 200:o.forEach((function(t){return e.onmessage({data:t})})),e.poll();break;case 204:e.poll();break;case 410:e.readyState=v,e.onopen(),e.poll();break;case 403:e.onerror(),e.close();break;case 0:case 500:e.onerror(),e.closeAndRetry();break;default:throw new Error("unhandled poll status ".concat(n))}}))}},{key:"send",value:function(e){var t=this;M.request("POST",this.endpointURL(),"application/json",e,this.timeout,this.onerror.bind(this,"timeout"),(function(e){e&&200===e.status||(t.onerror(e&&e.status),t.closeAndRetry())}))}},{key:"close",value:function(e,t){this.readyState=m,this.onclose()}}]),e}(),M=function(){function e(){c(this,e)}return h(e,null,[{key:"request",value:function(e,t,n,i,o,r,s){if(d.XDomainRequest){var a=new XDomainRequest;this.xdomainRequest(a,e,t,i,o,r,s)}else{var c=new d.XMLHttpRequest;this.xhrRequest(c,e,t,n,i,o,r,s)}}},{key:"xdomainRequest",value:function(e,t,n,i,o,r,s){var a=this;e.timeout=o,e.open(t,n),e.onload=function(){var t=a.parseJSON(e.responseText);s&&s(t)},r&&(e.ontimeout=r),e.onprogress=function(){},e.send(i)}},{key:"xhrRequest",value:function(e,t,n,i,o,r,s,a){var c=this;e.open(t,n,!0),e.timeout=r,e.setRequestHeader("Content-Type",i),e.onerror=function(){a&&a(null)},e.onreadystatechange=function(){if(e.readyState===c.states.complete&&a){var t=c.parseJSON(e.responseText);a(t)}},s&&(e.ontimeout=s),e.send(o)}},{key:"parseJSON",value:function(e){if(!e||""===e)return null;try{return JSON.parse(e)}catch(t){return console&&console.log("failed to parse JSON response",e),null}}},{key:"serialize",value:function(e,t){var n=[];for(var i in e)if(e.hasOwnProperty(i)){var r=t?"".concat(t,"[").concat(i,"]"):i,s=e[i];"object"===o(s)?n.push(this.serialize(s,r)):n.push(encodeURIComponent(r)+"="+encodeURIComponent(s))}return n.join("&")}},{key:"appendParams",value:function(e,t){if(0===Object.keys(t).length)return e;var n=e.match(/\?/)?"&":"?";return"".concat(e).concat(n).concat(this.serialize(t))}}]),e}();M.states={complete:4};var N=function(){function e(t){var n=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};c(this,e);var o=i.events||{state:"presence_state",diff:"presence_diff"};this.state={},this.pendingDiffs=[],this.channel=t,this.joinRef=null,this.caller={onJoin:function(){},onLeave:function(){},onSync:function(){}},this.channel.on(o.state,(function(t){var i=n.caller,o=i.onJoin,r=i.onLeave,s=i.onSync;n.joinRef=n.channel.joinRef(),n.state=e.syncState(n.state,t,o,r),n.pendingDiffs.forEach((function(t){n.state=e.syncDiff(n.state,t,o,r)})),n.pendingDiffs=[],s()})),this.channel.on(o.diff,(function(t){var i=n.caller,o=i.onJoin,r=i.onLeave,s=i.onSync;n.inPendingSyncState()?n.pendingDiffs.push(t):(n.state=e.syncDiff(n.state,t,o,r),s())}))}return h(e,[{key:"onJoin",value:function(e){this.caller.onJoin=e}},{key:"onLeave",value:function(e){this.caller.onLeave=e}},{key:"onSync",value:function(e){this.caller.onSync=e}},{key:"list",value:function(t){return e.list(this.state,t)}},{key:"inPendingSyncState",value:function(){return!this.joinRef||this.joinRef!==this.channel.joinRef()}}],[{key:"syncState",value:function(e,t,n,i){var o=this,r=this.clone(e),s={},a={};return this.map(r,(function(e,n){t[e]||(a[e]=n)})),this.map(t,(function(e,t){var n=r[e];if(n){var i=t.metas.map((function(e){return e.phx_ref})),c=n.metas.map((function(e){return e.phx_ref})),u=t.metas.filter((function(e){return c.indexOf(e.phx_ref)<0})),h=n.metas.filter((function(e){return i.indexOf(e.phx_ref)<0}));u.length>0&&(s[e]=t,s[e].metas=u),h.length>0&&(a[e]=o.clone(n),a[e].metas=h)}else s[e]=t})),this.syncDiff(r,{joins:s,leaves:a},n,i)}},{key:"syncDiff",value:function(e,t,n,o){var r=t.joins,s=t.leaves,a=this.clone(e);return n||(n=function(){}),o||(o=function(){}),this.map(r,(function(e,t){var o=a[e];if(a[e]=t,o){var r,s=a[e].metas.map((function(e){return e.phx_ref})),c=o.metas.filter((function(e){return s.indexOf(e.phx_ref)<0}));(r=a[e].metas).unshift.apply(r,i(c))}n(e,o,t)})),this.map(s,(function(e,t){var n=a[e];if(n){var i=t.metas.map((function(e){return e.phx_ref}));n.metas=n.metas.filter((function(e){return i.indexOf(e.phx_ref)<0})),o(e,n,t),0===n.metas.length&&delete a[e]}})),a}},{key:"list",value:function(e,t){return t||(t=function(e,t){return t}),this.map(e,(function(e,n){return t(e,n)}))}},{key:"map",value:function(e,t){return Object.getOwnPropertyNames(e).map((function(n){return t(n,e[n])}))}},{key:"clone",value:function(e){return JSON.parse(JSON.stringify(e))}}]),e}(),J=function(){function e(t,n){c(this,e),this.callback=t,this.timerCalc=n,this.timer=null,this.tries=0}return h(e,[{key:"reset",value:function(){this.tries=0,clearTimeout(this.timer)}},{key:"scheduleTimeout",value:function(){var e=this;clearTimeout(this.timer),this.timer=setTimeout((function(){e.tries=e.tries+1,e.callback()}),this.timerCalc(this.tries+1))}}]),e}()}])}));

/***/ }),

/***/ "./node_modules/regenerator-runtime/runtime.js":
/*!*****************************************************!*\
  !*** ./node_modules/regenerator-runtime/runtime.js ***!
  \*****************************************************/
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************!*\
  !*** ./index.js ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var phoenix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! phoenix */ "./node_modules/phoenix/priv/static/phoenix.js");
/* harmony import */ var phoenix__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(phoenix__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var limiter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! limiter */ "./node_modules/limiter/dist/esm/index.js");


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }




var murmurhash = __webpack_require__(/*! murmurhash */ "./node_modules/murmurhash/murmurhash.js"); // Define talio object


window.talio = {};
var Talio = {
  nonce: null,
  branch_status: false,
  // Debug Variables
  debug: false,
  // Debug Status
  zindex: 0,
  // Debug zIndex
  // Connection Status
  terminated: false,
  socket_base_addr: "ws://localhost:4000",
  // Page Information
  page: {
    branch: {
      fingerprint: null
    }
  },
  // Current Website Information
  website: {
    // Responsiveness status of current website
    // Default to `true` because in database it
    // is set to `true` as well.
    is_responsive: true
  },
  // Device Information
  device: {
    // View Ports
    view_ports: {
      // Return Current View Port
      current: function current(__MODULE__) {
        var view_port = {}; // Based On Responsiveness of Device Screen

        if (document.body.clientWidth >= __MODULE__.device.view_ports.desktop.width) {
          view_port.target = "desktop";
          view_port.device = 0;
          view_port.width = __MODULE__.device.view_ports.desktop.width;
        }

        if (document.body.clientWidth <= __MODULE__.device.view_ports.tablet.width || document.body.clientWidth <= __MODULE__.device.view_ports.desktop.width) {
          view_port.target = "tablet";
          view_port.device = 1;
          view_port.width = __MODULE__.device.view_ports.tablet.width;
        }

        if (document.body.clientWidth <= __MODULE__.device.view_ports.mobile.width) {
          view_port.target = "mobile";
          view_port.device = 2;
          view_port.width = __MODULE__.device.view_ports.mobile.width;
        }

        return view_port;
      },
      // Pre-Defined View Ports
      desktop: {
        width: 1280
      },
      tablet: {
        width: 800
      },
      mobile: {
        width: 380
      }
    },
    target: null,
    types: {
      0: "Desktop",
      1: "Tablet",
      2: "Mobile"
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height
    },
    // // Touch screen settings (Don't need it)
    // touch: {
    //   offset: null
    // },
    humanized_target: function humanized_target() {
      if (this.target !== null) {
        return this.types[this.target];
      } else {
        return "Unknown";
      }
    }
  },
  init: function init() {
    var _this = this;

    // Setup touch screen settings
    var view_port = this.device.view_ports.current(this); // Setup Current User Device Info

    this.device.target = this.device_detector(); // Enables Debug

    if (this.debug) {
      console.log(this.device.view_ports.current(this));
      this.enable_debug(this.device.view_ports.current(this));
    } // // Rate Limit Config
    // const rate_limit_tokens   = 10
    // const rate_limit_interval = 10000
    // const limiter = new RateLimiter({ 
    //   tokensPerInterval: rate_limit_tokens, 
    //   interval: rate_limit_interval 
    // });
    // Current Website Information


    var website = {
      host: window.location.host,
      path: window.location.pathname
    }; // Create Global Talio Structure

    window.talio = {
      userInfo: {},
      pageInfo: {}
    }; // Parameters to send to Server

    var params = {
      params: {
        website: website
      }
    }; // Connect to Talio WebSocket Endpoint

    var socket = this.connect(params); // Define Current Branch And Send Branch to Server

    var _this$generate_branch = this.generate_branch(),
        fingerprint = _this$generate_branch.fingerprint;

    this.page.branch.fingerprint = fingerprint;
    console.log('Branch:', fingerprint);
    var branch_channel = this.establish_branch_channel(socket, fingerprint); // Connect to Pre-Defined Channels

    var click_channel = this.establish_click_channel(socket); // // // const refresh_nonce = this.refresh_nonce(click_channel)
    // Capture Clicks And Send Them Through WebSocket

    document.addEventListener("click", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().mark(function _callee(e) {
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // const remainingMessages = await limiter.removeTokens(1);
                // console.log("Remained clicks:", remainingMessages)
                // // Limit the clicks
                // if(remainingMessages > 0) {
                // if(this.branch_status) {
                _this.capture_click(e, click_channel); // }
                // }


              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
  },
  establish_branch_channel: function establish_branch_channel(socket, fingerprint) {
    var _this2 = this;

    var branch_channel = socket.channel("branch:" + fingerprint, {}); // 
    // Channel Hooks
    // 

    branch_channel.on("initialize_website", function (response) {
      console.log(response);
      _this2.website.is_responsive = response.is_responsive;
    }); // Define Talio User ID Hook

    branch_channel.on("initialize_user", function (response) {
      console.log(response);
      var nonce = response.nonce;
      branch_channel.push("store_branch", {
        fingerprint: fingerprint,
        nonce: nonce
      }, 10000).receive("ok", function (_response) {
        _this2.branch_status = true;
      });

      _this2.initialize_user(response);
    }); // Socket Terminator Hook

    branch_channel.on("end_session", function (response) {
      console.log("Terminating connection");
      _this2.terminated = true;
      branch_channel.leave();
    }); // Default Hooks

    branch_channel.join() // .receive("ok", ({messages}) => console.log("catching up", messages) )
    .receive("error", function (_ref2) {
      var reason = _ref2.reason;
      return console.log("failed join", reason);
    }).receive("timeout", function () {
      return console.log("Networking issue. Still waiting...");
    });
    return branch_channel;
  },
  refresh_nonce: function refresh_nonce(branch_channel) {
    setInterval(branch_channel.push("refresh_nonce", {}, 10000).receive("ok", function (response) {
      console.log(response);
    }), 1000);
  },
  capture_click: function capture_click(event, click_channel) {
    console.log(event);
    var element_boundings = event.target.getBoundingClientRect();
    var raw_payload = {
      metadata: {
        // // Current User Nonce (Currently we don't need it)
        // nonce: window.talio.userInfo.nonce,
        // Device Type
        device: this.device.target
      },
      branch: {
        fingerprint: this.page.branch.fingerprint
      },
      // We use `page(X/Y)` instead of `client(X/Y)`
      // because `clientY` does not calculate page scroll
      click: {
        // Client Mouse Click In X Axis
        x: event.pageX,
        // Client Mouse Click In Y Axis
        y: event.pageY
      },
      // We only need the path of current element
      element: {
        path: this.css_path(event.target)
      }
    }; // Send Payload(Click) To Server

    this.push_click(event.target, raw_payload, click_channel);
  },
  // Send Payload(Click) To Server
  push_click: function push_click(target, raw_payload, click_channel) {
    // Do not push the clicks when socket is terminated
    if (this.terminated) {
      return;
    }

    var payload = this.adjust_payload(target, raw_payload);
    console.log("Payload:", payload); // Send the click payload to the socket server

    click_channel.push("store_click", payload, 10000).receive("ok", function (response) {
      console.log("Store Click: ", response);
    });
  },
  // // TODO: No need it, because it will cause problems
  // enable_debug(view_port) {
  //   const view_port_border = document.createElement("div")
  //   const top              = 0
  //   const right            = this.device.screen.width - view_port.width 
  //   view_port_border.style.outline   = "1px solid red"
  //   view_port_border.style.position = "fixed"
  //   view_port_border.style.zIndex = "9999"
  //   view_port_border.style.width    = view_port.width + "px"
  //   view_port_border.style.height    = "100%"
  //   if(view_port.target === "desktop") {
  //     view_port_border.style.right    = right/2 + "px"
  //     view_port_border.style.left    = right/2 + "px"
  //   }
  //   view_port_border.style.top      = top + "px"
  //   // TODO: REMOVE
  //   document.body.appendChild(view_port_border)
  // },
  // // Get padding and margin of an element (Don't need it rn)
  // compute_spaces(element) {
  //   const computed_style = window.getComputedStyle(element, null)
  //   const styles = {}
  //   // Paddings
  //   styles.padding_right  = parseFloat(computed_style.paddingRight)
  //   styles.padding_left   = parseFloat(computed_style.paddingLeft)
  //   styles.padding_top    = parseFloat(computed_style.paddingTop)
  //   styles.padding_bottom = parseFloat(computed_style.paddingBottom)
  //   // Margins
  //   styles.margin_right  = parseFloat(computed_style.marginRight)
  //   styles.margin_left   = parseFloat(computed_style.marginLeft)
  //   styles.margin_top    = parseFloat(computed_style.marginTop)
  //   styles.margin_bottom = parseFloat(computed_style.marginBottom)
  //   return styles
  // },
  adjust_payload: function adjust_payload(target, raw_payload) {
    console.log("RAW click", raw_payload.click);
    var payload = raw_payload;
    var view_port = this.device.view_ports.current(this);
    var pre_defined_width = view_port.width; // const element_spaces = this.compute_spaces(target)

    payload.metadata.device = view_port.device;
    var adjusted_x; // Resize Measure

    var right = 0; // Right Offset Only For Desktop And Higher Devices
    // Or if the website is responsive

    if (view_port.target === "desktop" && this.website.is_responsive) {
      right = Math.max(0, this.device.screen.width - pre_defined_width);
    } // Range of Resizing


    var ranges = {
      x1: right / 2,
      x2: pre_defined_width
    }; // Adjust Desktop screen axis

    if (view_port.target === "desktop") {
      if (raw_payload.click.x < ranges.x1) {
        // Resize Outer Range Clicks (Left side)
        adjusted_x = raw_payload.click.x + right / 2; // Change Raw Payload Click in X axis

        payload.click.x = adjusted_x;
        payload.click.x = payload.click.x - right / 2;
      } else if (raw_payload.click.x > ranges.x2) {
        // Resize Outer Range Clicks (Right side)
        adjusted_x = raw_payload.click.x - pre_defined_width;
        adjusted_x = pre_defined_width - adjusted_x;
        adjusted_x = adjusted_x + right / 2; // Change Raw Payload Click in X axis

        payload.click.x = adjusted_x;
        payload.click.x = payload.click.x - right / 2;
      } else {
        payload.click.x = Math.floor(this.device.view_ports.desktop.width * payload.click.x / document.body.clientWidth);
      }
    } // Adjust touch(Tablet / Mobile) screen axis (Big brain math formula)


    if (view_port.target === "tablet") {
      payload.click.x = Math.floor(this.device.view_ports.tablet.width * payload.click.x / document.body.clientWidth);
    }

    if (view_port.target === "mobile") {
      payload.click.x = Math.floor(this.device.view_ports.mobile.width * payload.click.x / document.body.clientWidth);
    }

    console.log(payload.click);
    return payload;
  },
  // Create a Socket Object
  connect: function connect() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      params: {}
    };
    var socket = new phoenix__WEBPACK_IMPORTED_MODULE_1__.Socket(this.socket_base_addr + '/socket', params); // Connect to ws endpoint

    socket.connect(); // Hooks

    socket.onOpen(function () {
      console.log("Talio:", "Socket was opened");
    });
    socket.onClose(function (message) {
      // // Gracefully shut down the socket
      // if(message.type === "close") {
      console.log("Talio:", "Socket connection dropped");
      socket.disconnect(); //   }, 1000)
      // }
    }); // socket.onMessage( (message) => {
    //   console.log("Talio:", "MESSAGE:",message)
    // })

    return socket;
  },
  // Connects To Pre Defined Channels 
  establish_click_channel: function establish_click_channel(socket) {
    var click_channel = socket.channel("click:public", {}); // 
    // Channel Hooks
    // 
    // Default Hooks

    click_channel.join() // .receive("ok", ({messages}) => console.log("catching up", messages) )
    .receive("error", function (_ref3) {
      var reason = _ref3.reason;
      return console.log("failed join", reason);
    }).receive("timeout", function () {
      return console.log("Networking issue. Still waiting...");
    });
    return click_channel;
  },
  // Assigns Current User Information From Server
  initialize_user: function initialize_user(response) {
    window.talio.userInfo.id = response.talio_user_id;
    window.talio.userInfo.nonce = response.nonce;
    this.nonce = response.nonce;
  },
  // Returns an unique hash(murmurhash v3) from parsed html of document
  generate_branch: function generate_branch() {
    var seed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "0";
    var html = window.document.documentElement;
    var parser = new DOMParser(); // Generate a Temporary DOM

    var html_document = parser.parseFromString(html.innerHTML, "text/html"); // Remove Unnecessary Elements From Temporary DOM

    var tags = ["script", // Reason: Browser Add-ons
    "style", // Reason: Browser Add-ons
    "meta" // Reason: Browser Add-ons
    ];
    tags.forEach(function (tag) {
      Array.from(html_document.querySelectorAll(tag)).forEach(function (script) {
        script.remove();
      });
    });
    return {
      fingerprint: murmurhash.v3(html_document.documentElement.innerHTML, seed)
    };
  },
  // Detect Device By User Agent
  device_detector: function device_detector() {
    var user_agent = navigator.userAgent.toLowerCase();
    user_agent = user_agent.toLowerCase();

    if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(user_agent)) {
      return 1; // Tablet
    } else {
      if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/.test(user_agent)) {
        return 2; // Mobile
      } else {
          return 0; // Desktop
        }
    }
  },
  css_path: function css_path(el) {
    if (!(el instanceof Element)) return;
    var path = [];

    while (el.nodeType === Node.ELEMENT_NODE) {
      var selector = el.nodeName.toLowerCase();

      if (el.id) {
        selector += '#' + el.id;
        path.unshift(selector);
        break;
      } else {
        var sib = el,
            nth = 1;

        while (sib = sib.previousElementSibling) {
          if (sib.nodeName.toLowerCase() == selector) nth++;
        }

        if (nth != 1) selector += ":nth-of-type(" + nth + ")";
      }

      path.unshift(selector);
      el = el.parentNode;
    }

    return path.join(" > ");
  }
};
window.talio.instance = Talio;
})();

/******/ })()
;