//#region node_modules/fast-xml-parser/src/util.js
var e = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
e + "";
var t = "[" + e + "][:A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*", n = RegExp("^" + t + "$");
function r(e, t) {
	let n = [], r = t.exec(e);
	for (; r;) {
		let i = [];
		i.startIndex = t.lastIndex - r[0].length;
		let a = r.length;
		for (let e = 0; e < a; e++) i.push(r[e]);
		n.push(i), r = t.exec(e);
	}
	return n;
}
var i = function(e) {
	return n.exec(e) != null;
};
function a(e) {
	return e !== void 0;
}
var o = [
	"hasOwnProperty",
	"toString",
	"valueOf",
	"__defineGetter__",
	"__defineSetter__",
	"__lookupGetter__",
	"__lookupSetter__"
], s = [
	"__proto__",
	"constructor",
	"prototype"
], c = {
	allowBooleanAttributes: !1,
	unpairedTags: []
};
function l(e, t) {
	t = Object.assign({}, c, t);
	let n = [], r = !1, i = !1;
	e[0] === "﻿" && (e = e.substr(1));
	for (let a = 0; a < e.length; a++) if (e[a] === "<" && e[a + 1] === "?") {
		if (a += 2, a = d(e, a), a.err) return a;
	} else if (e[a] === "<") {
		let o = a;
		if (a++, e[a] === "!") {
			a = f(e, a);
			continue;
		} else {
			let s = !1;
			e[a] === "/" && (s = !0, a++);
			let c = "";
			for (; a < e.length && e[a] !== ">" && e[a] !== " " && e[a] !== "	" && e[a] !== "\n" && e[a] !== "\r"; a++) c += e[a];
			if (c = c.trim(), c[c.length - 1] === "/" && (c = c.substring(0, c.length - 1), a--), !ne(c)) {
				let t;
				return t = c.trim().length === 0 ? "Invalid space after '<'." : "Tag '" + c + "' is an invalid name.", y("InvalidTag", t, b(e, a));
			}
			let l = h(e, a);
			if (l === !1) return y("InvalidAttr", "Attributes for '" + c + "' have open quote.", b(e, a));
			let p = l.value;
			if (a = l.index, p[p.length - 1] === "/") {
				let n = a - p.length;
				p = p.substring(0, p.length - 1);
				let i = _(p, t);
				if (i === !0) r = !0;
				else return y(i.err.code, i.err.msg, b(e, n + i.err.line));
			} else if (s) {
				if (!l.tagClosed) return y("InvalidTag", "Closing tag '" + c + "' doesn't have proper closing.", b(e, a));
				if (p.trim().length > 0) return y("InvalidTag", "Closing tag '" + c + "' can't have attributes or invalid starting.", b(e, o));
				if (n.length === 0) return y("InvalidTag", "Closing tag '" + c + "' has not been opened.", b(e, o));
				{
					let t = n.pop();
					if (c !== t.tagName) {
						let n = b(e, t.tagStartPos);
						return y("InvalidTag", "Expected closing tag '" + t.tagName + "' (opened in line " + n.line + ", col " + n.col + ") instead of closing tag '" + c + "'.", b(e, o));
					}
					n.length == 0 && (i = !0);
				}
			} else {
				let s = _(p, t);
				if (s !== !0) return y(s.err.code, s.err.msg, b(e, a - p.length + s.err.line));
				if (i === !0) return y("InvalidXml", "Multiple possible root nodes found.", b(e, a));
				t.unpairedTags.indexOf(c) !== -1 || n.push({
					tagName: c,
					tagStartPos: o
				}), r = !0;
			}
			for (a++; a < e.length; a++) if (e[a] === "<") if (e[a + 1] === "!") {
				a++, a = f(e, a);
				continue;
			} else if (e[a + 1] === "?") {
				if (a = d(e, ++a), a.err) return a;
			} else break;
			else if (e[a] === "&") {
				let t = ee(e, a);
				if (t == -1) return y("InvalidChar", "char '&' is not expected.", b(e, a));
				a = t;
			} else if (i === !0 && !u(e[a])) return y("InvalidXml", "Extra text at the end", b(e, a));
			e[a] === "<" && a--;
		}
	} else {
		if (u(e[a])) continue;
		return y("InvalidChar", "char '" + e[a] + "' is not expected.", b(e, a));
	}
	return r ? n.length == 1 ? y("InvalidTag", "Unclosed tag '" + n[0].tagName + "'.", b(e, n[0].tagStartPos)) : n.length > 0 ? y("InvalidXml", "Invalid '" + JSON.stringify(n.map((e) => e.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", {
		line: 1,
		col: 1
	}) : !0 : y("InvalidXml", "Start tag expected.", 1);
}
function u(e) {
	return e === " " || e === "	" || e === "\n" || e === "\r";
}
function d(e, t) {
	let n = t;
	for (; t < e.length; t++) if (e[t] == "?" || e[t] == " ") {
		let r = e.substr(n, t - n);
		if (t > 5 && r === "xml") return y("InvalidXml", "XML declaration allowed only at the start of the document.", b(e, t));
		if (e[t] == "?" && e[t + 1] == ">") {
			t++;
			break;
		} else continue;
	}
	return t;
}
function f(e, t) {
	if (e.length > t + 5 && e[t + 1] === "-" && e[t + 2] === "-") {
		for (t += 3; t < e.length; t++) if (e[t] === "-" && e[t + 1] === "-" && e[t + 2] === ">") {
			t += 2;
			break;
		}
	} else if (e.length > t + 8 && e[t + 1] === "D" && e[t + 2] === "O" && e[t + 3] === "C" && e[t + 4] === "T" && e[t + 5] === "Y" && e[t + 6] === "P" && e[t + 7] === "E") {
		let n = 1;
		for (t += 8; t < e.length; t++) if (e[t] === "<") n++;
		else if (e[t] === ">" && (n--, n === 0)) break;
	} else if (e.length > t + 9 && e[t + 1] === "[" && e[t + 2] === "C" && e[t + 3] === "D" && e[t + 4] === "A" && e[t + 5] === "T" && e[t + 6] === "A" && e[t + 7] === "[") {
		for (t += 8; t < e.length; t++) if (e[t] === "]" && e[t + 1] === "]" && e[t + 2] === ">") {
			t += 2;
			break;
		}
	}
	return t;
}
var p = "\"", m = "'";
function h(e, t) {
	let n = "", r = "", i = !1;
	for (; t < e.length; t++) {
		if (e[t] === p || e[t] === m) r === "" ? r = e[t] : r !== e[t] || (r = "");
		else if (e[t] === ">" && r === "") {
			i = !0;
			break;
		}
		n += e[t];
	}
	return r === "" ? {
		value: n,
		index: t,
		tagClosed: i
	} : !1;
}
var g = /* @__PURE__ */ RegExp("(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['\"])(([\\s\\S])*?)\\5)?", "g");
function _(e, t) {
	let n = r(e, g), i = {};
	for (let e = 0; e < n.length; e++) {
		if (n[e][1].length === 0) return y("InvalidAttr", "Attribute '" + n[e][2] + "' has no space in starting.", x(n[e]));
		if (n[e][3] !== void 0 && n[e][4] === void 0) return y("InvalidAttr", "Attribute '" + n[e][2] + "' is without value.", x(n[e]));
		if (n[e][3] === void 0 && !t.allowBooleanAttributes) return y("InvalidAttr", "boolean attribute '" + n[e][2] + "' is not allowed.", x(n[e]));
		let r = n[e][2];
		if (!te(r)) return y("InvalidAttr", "Attribute '" + r + "' is an invalid name.", x(n[e]));
		if (!Object.prototype.hasOwnProperty.call(i, r)) i[r] = 1;
		else return y("InvalidAttr", "Attribute '" + r + "' is repeated.", x(n[e]));
	}
	return !0;
}
function v(e, t) {
	let n = /\d/;
	for (e[t] === "x" && (t++, n = /[\da-fA-F]/); t < e.length; t++) {
		if (e[t] === ";") return t;
		if (!e[t].match(n)) break;
	}
	return -1;
}
function ee(e, t) {
	if (t++, e[t] === ";") return -1;
	if (e[t] === "#") return t++, v(e, t);
	let n = 0;
	for (; t < e.length; t++, n++) if (!(e[t].match(/\w/) && n < 20)) {
		if (e[t] === ";") break;
		return -1;
	}
	return t;
}
function y(e, t, n) {
	return { err: {
		code: e,
		msg: t,
		line: n.line || n,
		col: n.col
	} };
}
function te(e) {
	return i(e);
}
function ne(e) {
	return i(e);
}
function b(e, t) {
	let n = e.substring(0, t).split(/\r?\n/);
	return {
		line: n.length,
		col: n[n.length - 1].length + 1
	};
}
function x(e) {
	return e.startIndex + e[1].length;
}
//#endregion
//#region node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var S = (e) => o.includes(e) ? "__" + e : e, re = {
	preserveOrder: !1,
	attributeNamePrefix: "@_",
	attributesGroupName: !1,
	textNodeName: "#text",
	ignoreAttributes: !0,
	removeNSPrefix: !1,
	allowBooleanAttributes: !1,
	parseTagValue: !0,
	parseAttributeValue: !1,
	trimValues: !0,
	cdataPropName: !1,
	numberParseOptions: {
		hex: !0,
		leadingZeros: !0,
		eNotation: !0
	},
	tagValueProcessor: function(e, t) {
		return t;
	},
	attributeValueProcessor: function(e, t) {
		return t;
	},
	stopNodes: [],
	alwaysCreateTextNode: !1,
	isArray: () => !1,
	commentPropName: !1,
	unpairedTags: [],
	processEntities: !0,
	htmlEntities: !1,
	ignoreDeclaration: !1,
	ignorePiTags: !1,
	transformTagName: !1,
	transformAttributeName: !1,
	updateTag: function(e, t, n) {
		return e;
	},
	captureMetaData: !1,
	maxNestedTags: 100,
	strictReservedNames: !0,
	jPath: !0,
	onDangerousProperty: S
};
function ie(e, t) {
	if (typeof e != "string") return;
	let n = e.toLowerCase();
	if (o.some((e) => n === e.toLowerCase()) || s.some((e) => n === e.toLowerCase())) throw Error(`[SECURITY] Invalid ${t}: "${e}" is a reserved JavaScript keyword that could cause prototype pollution`);
}
function C(e) {
	return typeof e == "boolean" ? {
		enabled: e,
		maxEntitySize: 1e4,
		maxExpansionDepth: 10,
		maxTotalExpansions: 1e3,
		maxExpandedLength: 1e5,
		maxEntityCount: 100,
		allowedTags: null,
		tagFilter: null
	} : typeof e == "object" && e ? {
		enabled: e.enabled !== !1,
		maxEntitySize: Math.max(1, e.maxEntitySize ?? 1e4),
		maxExpansionDepth: Math.max(1, e.maxExpansionDepth ?? 1e4),
		maxTotalExpansions: Math.max(1, e.maxTotalExpansions ?? Infinity),
		maxExpandedLength: Math.max(1, e.maxExpandedLength ?? 1e5),
		maxEntityCount: Math.max(1, e.maxEntityCount ?? 1e3),
		allowedTags: e.allowedTags ?? null,
		tagFilter: e.tagFilter ?? null
	} : C(!0);
}
var ae = function(e) {
	let t = Object.assign({}, re, e), n = [
		{
			value: t.attributeNamePrefix,
			name: "attributeNamePrefix"
		},
		{
			value: t.attributesGroupName,
			name: "attributesGroupName"
		},
		{
			value: t.textNodeName,
			name: "textNodeName"
		},
		{
			value: t.cdataPropName,
			name: "cdataPropName"
		},
		{
			value: t.commentPropName,
			name: "commentPropName"
		}
	];
	for (let { value: e, name: t } of n) e && ie(e, t);
	return t.onDangerousProperty === null && (t.onDangerousProperty = S), t.processEntities = C(t.processEntities), t.unpairedTagsSet = new Set(t.unpairedTags), t.stopNodes && Array.isArray(t.stopNodes) && (t.stopNodes = t.stopNodes.map((e) => typeof e == "string" && e.startsWith("*.") ? ".." + e.substring(2) : e)), t;
}, w = typeof Symbol == "function" ? Symbol("XML Node Metadata") : "@@xmlMetadata", T = class {
	constructor(e) {
		this.tagname = e, this.child = [], this[":@"] = Object.create(null);
	}
	add(e, t) {
		e === "__proto__" && (e = "#__proto__"), this.child.push({ [e]: t });
	}
	addChild(e, t) {
		e.tagname === "__proto__" && (e.tagname = "#__proto__"), e[":@"] && Object.keys(e[":@"]).length > 0 ? this.child.push({
			[e.tagname]: e.child,
			":@": e[":@"]
		}) : this.child.push({ [e.tagname]: e.child }), t !== void 0 && (this.child[this.child.length - 1][w] = { startIndex: t });
	}
	static getMetaDataSymbol() {
		return w;
	}
}, oe = class {
	constructor(e) {
		this.suppressValidationErr = !e, this.options = e;
	}
	readDocType(e, t) {
		let n = Object.create(null), r = 0;
		if (e[t + 3] === "O" && e[t + 4] === "C" && e[t + 5] === "T" && e[t + 6] === "Y" && e[t + 7] === "P" && e[t + 8] === "E") {
			t += 9;
			let i = 1, a = !1, o = !1, s = "";
			for (; t < e.length; t++) if (e[t] === "<" && !o) {
				if (a && D(e, "!ENTITY", t)) {
					t += 7;
					let i, a;
					if ([i, a, t] = this.readEntityExp(e, t + 1, this.suppressValidationErr), a.indexOf("&") === -1) {
						if (this.options.enabled !== !1 && this.options.maxEntityCount != null && r >= this.options.maxEntityCount) throw Error(`Entity count (${r + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`);
						let e = i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
						n[i] = {
							regx: RegExp(`&${e};`, "g"),
							val: a
						}, r++;
					}
				} else if (a && D(e, "!ELEMENT", t)) {
					t += 8;
					let { index: n } = this.readElementExp(e, t + 1);
					t = n;
				} else if (a && D(e, "!ATTLIST", t)) t += 8;
				else if (a && D(e, "!NOTATION", t)) {
					t += 9;
					let { index: n } = this.readNotationExp(e, t + 1, this.suppressValidationErr);
					t = n;
				} else if (D(e, "!--", t)) o = !0;
				else throw Error("Invalid DOCTYPE");
				i++, s = "";
			} else if (e[t] === ">") {
				if (o ? e[t - 1] === "-" && e[t - 2] === "-" && (o = !1, i--) : i--, i === 0) break;
			} else e[t] === "[" ? a = !0 : s += e[t];
			if (i !== 0) throw Error("Unclosed DOCTYPE");
		} else throw Error("Invalid Tag instead of DOCTYPE");
		return {
			entities: n,
			i: t
		};
	}
	readEntityExp(e, t) {
		t = E(e, t);
		let n = t;
		for (; t < e.length && !/\s/.test(e[t]) && e[t] !== "\"" && e[t] !== "'";) t++;
		let r = e.substring(n, t);
		if (O(r), t = E(e, t), !this.suppressValidationErr) {
			if (e.substring(t, t + 6).toUpperCase() === "SYSTEM") throw Error("External entities are not supported");
			if (e[t] === "%") throw Error("Parameter entities are not supported");
		}
		let i = "";
		if ([t, i] = this.readIdentifierVal(e, t, "entity"), this.options.enabled !== !1 && this.options.maxEntitySize != null && i.length > this.options.maxEntitySize) throw Error(`Entity "${r}" size (${i.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`);
		return t--, [
			r,
			i,
			t
		];
	}
	readNotationExp(e, t) {
		t = E(e, t);
		let n = t;
		for (; t < e.length && !/\s/.test(e[t]);) t++;
		let r = e.substring(n, t);
		!this.suppressValidationErr && O(r), t = E(e, t);
		let i = e.substring(t, t + 6).toUpperCase();
		if (!this.suppressValidationErr && i !== "SYSTEM" && i !== "PUBLIC") throw Error(`Expected SYSTEM or PUBLIC, found "${i}"`);
		t += i.length, t = E(e, t);
		let a = null, o = null;
		if (i === "PUBLIC") [t, a] = this.readIdentifierVal(e, t, "publicIdentifier"), t = E(e, t), (e[t] === "\"" || e[t] === "'") && ([t, o] = this.readIdentifierVal(e, t, "systemIdentifier"));
		else if (i === "SYSTEM" && ([t, o] = this.readIdentifierVal(e, t, "systemIdentifier"), !this.suppressValidationErr && !o)) throw Error("Missing mandatory system identifier for SYSTEM notation");
		return {
			notationName: r,
			publicIdentifier: a,
			systemIdentifier: o,
			index: --t
		};
	}
	readIdentifierVal(e, t, n) {
		let r = "", i = e[t];
		if (i !== "\"" && i !== "'") throw Error(`Expected quoted string, found "${i}"`);
		t++;
		let a = t;
		for (; t < e.length && e[t] !== i;) t++;
		if (r = e.substring(a, t), e[t] !== i) throw Error(`Unterminated ${n} value`);
		return t++, [t, r];
	}
	readElementExp(e, t) {
		t = E(e, t);
		let n = t;
		for (; t < e.length && !/\s/.test(e[t]);) t++;
		let r = e.substring(n, t);
		if (!this.suppressValidationErr && !i(r)) throw Error(`Invalid element name: "${r}"`);
		t = E(e, t);
		let a = "";
		if (e[t] === "E" && D(e, "MPTY", t)) t += 4;
		else if (e[t] === "A" && D(e, "NY", t)) t += 2;
		else if (e[t] === "(") {
			t++;
			let n = t;
			for (; t < e.length && e[t] !== ")";) t++;
			if (a = e.substring(n, t), e[t] !== ")") throw Error("Unterminated content model");
		} else if (!this.suppressValidationErr) throw Error(`Invalid Element Expression, found "${e[t]}"`);
		return {
			elementName: r,
			contentModel: a.trim(),
			index: t
		};
	}
	readAttlistExp(e, t) {
		t = E(e, t);
		let n = t;
		for (; t < e.length && !/\s/.test(e[t]);) t++;
		let r = e.substring(n, t);
		for (O(r), t = E(e, t), n = t; t < e.length && !/\s/.test(e[t]);) t++;
		let i = e.substring(n, t);
		if (!O(i)) throw Error(`Invalid attribute name: "${i}"`);
		t = E(e, t);
		let a = "";
		if (e.substring(t, t + 8).toUpperCase() === "NOTATION") {
			if (a = "NOTATION", t += 8, t = E(e, t), e[t] !== "(") throw Error(`Expected '(', found "${e[t]}"`);
			t++;
			let n = [];
			for (; t < e.length && e[t] !== ")";) {
				let r = t;
				for (; t < e.length && e[t] !== "|" && e[t] !== ")";) t++;
				let i = e.substring(r, t);
				if (i = i.trim(), !O(i)) throw Error(`Invalid notation name: "${i}"`);
				n.push(i), e[t] === "|" && (t++, t = E(e, t));
			}
			if (e[t] !== ")") throw Error("Unterminated list of notations");
			t++, a += " (" + n.join("|") + ")";
		} else {
			let n = t;
			for (; t < e.length && !/\s/.test(e[t]);) t++;
			if (a += e.substring(n, t), !this.suppressValidationErr && ![
				"CDATA",
				"ID",
				"IDREF",
				"IDREFS",
				"ENTITY",
				"ENTITIES",
				"NMTOKEN",
				"NMTOKENS"
			].includes(a.toUpperCase())) throw Error(`Invalid attribute type: "${a}"`);
		}
		t = E(e, t);
		let o = "";
		return e.substring(t, t + 8).toUpperCase() === "#REQUIRED" ? (o = "#REQUIRED", t += 8) : e.substring(t, t + 7).toUpperCase() === "#IMPLIED" ? (o = "#IMPLIED", t += 7) : [t, o] = this.readIdentifierVal(e, t, "ATTLIST"), {
			elementName: r,
			attributeName: i,
			attributeType: a,
			defaultValue: o,
			index: t
		};
	}
}, E = (e, t) => {
	for (; t < e.length && /\s/.test(e[t]);) t++;
	return t;
};
function D(e, t, n) {
	for (let r = 0; r < t.length; r++) if (t[r] !== e[n + r + 1]) return !1;
	return !0;
}
function O(e) {
	if (i(e)) return e;
	throw Error(`Invalid entity name ${e}`);
}
//#endregion
//#region node_modules/strnum/strnum.js
var se = /^[-+]?0x[a-fA-F0-9]+$/, ce = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/, le = {
	hex: !0,
	leadingZeros: !0,
	decimalPoint: ".",
	eNotation: !0,
	infinity: "original"
};
function ue(e, t = {}) {
	if (t = Object.assign({}, le, t), !e || typeof e != "string") return e;
	let n = e.trim();
	if (n.length === 0 || t.skipLike !== void 0 && t.skipLike.test(n)) return e;
	if (n === "0") return 0;
	if (t.hex && se.test(n)) return me(n, 16);
	if (!isFinite(n)) return he(e, Number(n), t);
	if (n.includes("e") || n.includes("E")) return fe(e, n, t);
	{
		let r = ce.exec(n);
		if (r) {
			let i = r[1] || "", a = r[2], o = pe(r[3]), s = i ? e[a.length + 1] === "." : e[a.length] === ".";
			if (!t.leadingZeros && (a.length > 1 || a.length === 1 && !s)) return e;
			{
				let r = Number(n), s = String(r);
				if (r === 0) return r;
				if (s.search(/[eE]/) !== -1) return t.eNotation ? r : e;
				if (n.indexOf(".") !== -1) return s === "0" || s === o || s === `${i}${o}` ? r : e;
				let c = a ? o : n;
				return a ? c === s || i + c === s ? r : e : c === s || c === i + s ? r : e;
			}
		} else return e;
	}
}
var de = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function fe(e, t, n) {
	if (!n.eNotation) return e;
	let r = t.match(de);
	if (r) {
		let i = r[1] || "", a = r[3].indexOf("e") === -1 ? "E" : "e", o = r[2], s = i ? e[o.length + 1] === a : e[o.length] === a;
		return o.length > 1 && s ? e : o.length === 1 && (r[3].startsWith(`.${a}`) || r[3][0] === a) ? Number(t) : o.length > 0 ? n.leadingZeros && !s ? (t = (r[1] || "") + r[3], Number(t)) : e : Number(t);
	} else return e;
}
function pe(e) {
	return e && e.indexOf(".") !== -1 ? (e = e.replace(/0+$/, ""), e === "." ? e = "0" : e[0] === "." ? e = "0" + e : e[e.length - 1] === "." && (e = e.substring(0, e.length - 1)), e) : e;
}
function me(e, t) {
	if (parseInt) return parseInt(e, t);
	if (Number.parseInt) return Number.parseInt(e, t);
	if (window && window.parseInt) return window.parseInt(e, t);
	throw Error("parseInt, Number.parseInt, window.parseInt are not supported");
}
function he(e, t, n) {
	let r = t === Infinity;
	switch (n.infinity.toLowerCase()) {
		case "null": return null;
		case "infinity": return t;
		case "string": return r ? "Infinity" : "-Infinity";
		default: return e;
	}
}
//#endregion
//#region node_modules/fast-xml-parser/src/ignoreAttributes.js
function ge(e) {
	return typeof e == "function" ? e : Array.isArray(e) ? (t) => {
		for (let n of e) if (typeof n == "string" && t === n || n instanceof RegExp && n.test(t)) return !0;
	} : () => !1;
}
//#endregion
//#region node_modules/path-expression-matcher/src/Expression.js
var k = class {
	constructor(e, t = {}, n) {
		this.pattern = e, this.separator = t.separator || ".", this.segments = this._parse(e), this.data = n, this._hasDeepWildcard = this.segments.some((e) => e.type === "deep-wildcard"), this._hasAttributeCondition = this.segments.some((e) => e.attrName !== void 0), this._hasPositionSelector = this.segments.some((e) => e.position !== void 0);
	}
	_parse(e) {
		let t = [], n = 0, r = "";
		for (; n < e.length;) e[n] === this.separator ? n + 1 < e.length && e[n + 1] === this.separator ? (r.trim() && (t.push(this._parseSegment(r.trim())), r = ""), t.push({ type: "deep-wildcard" }), n += 2) : (r.trim() && t.push(this._parseSegment(r.trim())), r = "", n++) : (r += e[n], n++);
		return r.trim() && t.push(this._parseSegment(r.trim())), t;
	}
	_parseSegment(e) {
		let t = { type: "tag" }, n = null, r = e, i = e.match(/^([^\[]+)(\[[^\]]*\])(.*)$/);
		if (i && (r = i[1] + i[3], i[2])) {
			let e = i[2].slice(1, -1);
			e && (n = e);
		}
		let a, o = r;
		if (r.includes("::")) {
			let t = r.indexOf("::");
			if (a = r.substring(0, t).trim(), o = r.substring(t + 2).trim(), !a) throw Error(`Invalid namespace in pattern: ${e}`);
		}
		let s, c = null;
		if (o.includes(":")) {
			let e = o.lastIndexOf(":"), t = o.substring(0, e).trim(), n = o.substring(e + 1).trim();
			[
				"first",
				"last",
				"odd",
				"even"
			].includes(n) || /^nth\(\d+\)$/.test(n) ? (s = t, c = n) : s = o;
		} else s = o;
		if (!s) throw Error(`Invalid segment pattern: ${e}`);
		if (t.tag = s, a && (t.namespace = a), n) if (n.includes("=")) {
			let e = n.indexOf("=");
			t.attrName = n.substring(0, e).trim(), t.attrValue = n.substring(e + 1).trim();
		} else t.attrName = n.trim();
		if (c) {
			let e = c.match(/^nth\((\d+)\)$/);
			e ? (t.position = "nth", t.positionValue = parseInt(e[1], 10)) : t.position = c;
		}
		return t;
	}
	get length() {
		return this.segments.length;
	}
	hasDeepWildcard() {
		return this._hasDeepWildcard;
	}
	hasAttributeCondition() {
		return this._hasAttributeCondition;
	}
	hasPositionSelector() {
		return this._hasPositionSelector;
	}
	toString() {
		return this.pattern;
	}
}, _e = class {
	constructor() {
		this._byDepthAndTag = /* @__PURE__ */ new Map(), this._wildcardByDepth = /* @__PURE__ */ new Map(), this._deepWildcards = [], this._patterns = /* @__PURE__ */ new Set(), this._sealed = !1;
	}
	add(e) {
		if (this._sealed) throw TypeError("ExpressionSet is sealed. Create a new ExpressionSet to add more expressions.");
		if (this._patterns.has(e.pattern)) return this;
		if (this._patterns.add(e.pattern), e.hasDeepWildcard()) return this._deepWildcards.push(e), this;
		let t = e.length, n = e.segments[e.segments.length - 1]?.tag;
		if (!n || n === "*") this._wildcardByDepth.has(t) || this._wildcardByDepth.set(t, []), this._wildcardByDepth.get(t).push(e);
		else {
			let r = `${t}:${n}`;
			this._byDepthAndTag.has(r) || this._byDepthAndTag.set(r, []), this._byDepthAndTag.get(r).push(e);
		}
		return this;
	}
	addAll(e) {
		for (let t of e) this.add(t);
		return this;
	}
	has(e) {
		return this._patterns.has(e.pattern);
	}
	get size() {
		return this._patterns.size;
	}
	seal() {
		return this._sealed = !0, this;
	}
	get isSealed() {
		return this._sealed;
	}
	matchesAny(e) {
		return this.findMatch(e) !== null;
	}
	findMatch(e) {
		let t = e.getDepth(), n = `${t}:${e.getCurrentTag()}`, r = this._byDepthAndTag.get(n);
		if (r) {
			for (let t = 0; t < r.length; t++) if (e.matches(r[t])) return r[t];
		}
		let i = this._wildcardByDepth.get(t);
		if (i) {
			for (let t = 0; t < i.length; t++) if (e.matches(i[t])) return i[t];
		}
		for (let t = 0; t < this._deepWildcards.length; t++) if (e.matches(this._deepWildcards[t])) return this._deepWildcards[t];
		return null;
	}
}, ve = class {
	constructor(e) {
		this._matcher = e;
	}
	get separator() {
		return this._matcher.separator;
	}
	getCurrentTag() {
		let e = this._matcher.path;
		return e.length > 0 ? e[e.length - 1].tag : void 0;
	}
	getCurrentNamespace() {
		let e = this._matcher.path;
		return e.length > 0 ? e[e.length - 1].namespace : void 0;
	}
	getAttrValue(e) {
		let t = this._matcher.path;
		if (t.length !== 0) return t[t.length - 1].values?.[e];
	}
	hasAttr(e) {
		let t = this._matcher.path;
		if (t.length === 0) return !1;
		let n = t[t.length - 1];
		return n.values !== void 0 && e in n.values;
	}
	getPosition() {
		let e = this._matcher.path;
		return e.length === 0 ? -1 : e[e.length - 1].position ?? 0;
	}
	getCounter() {
		let e = this._matcher.path;
		return e.length === 0 ? -1 : e[e.length - 1].counter ?? 0;
	}
	getIndex() {
		return this.getPosition();
	}
	getDepth() {
		return this._matcher.path.length;
	}
	toString(e, t = !0) {
		return this._matcher.toString(e, t);
	}
	toArray() {
		return this._matcher.path.map((e) => e.tag);
	}
	matches(e) {
		return this._matcher.matches(e);
	}
	matchesAny(e) {
		return e.matchesAny(this._matcher);
	}
}, ye = class {
	constructor(e = {}) {
		this.separator = e.separator || ".", this.path = [], this.siblingStacks = [], this._pathStringCache = null, this._view = new ve(this);
	}
	push(e, t = null, n = null) {
		this._pathStringCache = null, this.path.length > 0 && (this.path[this.path.length - 1].values = void 0);
		let r = this.path.length;
		this.siblingStacks[r] || (this.siblingStacks[r] = /* @__PURE__ */ new Map());
		let i = this.siblingStacks[r], a = n ? `${n}:${e}` : e, o = i.get(a) || 0, s = 0;
		for (let e of i.values()) s += e;
		i.set(a, o + 1);
		let c = {
			tag: e,
			position: s,
			counter: o
		};
		n != null && (c.namespace = n), t != null && (c.values = t), this.path.push(c);
	}
	pop() {
		if (this.path.length === 0) return;
		this._pathStringCache = null;
		let e = this.path.pop();
		return this.siblingStacks.length > this.path.length + 1 && (this.siblingStacks.length = this.path.length + 1), e;
	}
	updateCurrent(e) {
		if (this.path.length > 0) {
			let t = this.path[this.path.length - 1];
			e != null && (t.values = e);
		}
	}
	getCurrentTag() {
		return this.path.length > 0 ? this.path[this.path.length - 1].tag : void 0;
	}
	getCurrentNamespace() {
		return this.path.length > 0 ? this.path[this.path.length - 1].namespace : void 0;
	}
	getAttrValue(e) {
		if (this.path.length !== 0) return this.path[this.path.length - 1].values?.[e];
	}
	hasAttr(e) {
		if (this.path.length === 0) return !1;
		let t = this.path[this.path.length - 1];
		return t.values !== void 0 && e in t.values;
	}
	getPosition() {
		return this.path.length === 0 ? -1 : this.path[this.path.length - 1].position ?? 0;
	}
	getCounter() {
		return this.path.length === 0 ? -1 : this.path[this.path.length - 1].counter ?? 0;
	}
	getIndex() {
		return this.getPosition();
	}
	getDepth() {
		return this.path.length;
	}
	toString(e, t = !0) {
		let n = e || this.separator;
		if (n === this.separator && t === !0) {
			if (this._pathStringCache !== null) return this._pathStringCache;
			let e = this.path.map((e) => e.namespace ? `${e.namespace}:${e.tag}` : e.tag).join(n);
			return this._pathStringCache = e, e;
		}
		return this.path.map((e) => t && e.namespace ? `${e.namespace}:${e.tag}` : e.tag).join(n);
	}
	toArray() {
		return this.path.map((e) => e.tag);
	}
	reset() {
		this._pathStringCache = null, this.path = [], this.siblingStacks = [];
	}
	matches(e) {
		let t = e.segments;
		return t.length === 0 ? !1 : e.hasDeepWildcard() ? this._matchWithDeepWildcard(t) : this._matchSimple(t);
	}
	_matchSimple(e) {
		if (this.path.length !== e.length) return !1;
		for (let t = 0; t < e.length; t++) if (!this._matchSegment(e[t], this.path[t], t === this.path.length - 1)) return !1;
		return !0;
	}
	_matchWithDeepWildcard(e) {
		let t = this.path.length - 1, n = e.length - 1;
		for (; n >= 0 && t >= 0;) {
			let r = e[n];
			if (r.type === "deep-wildcard") {
				if (n--, n < 0) return !0;
				let r = e[n], i = !1;
				for (let e = t; e >= 0; e--) if (this._matchSegment(r, this.path[e], e === this.path.length - 1)) {
					t = e - 1, n--, i = !0;
					break;
				}
				if (!i) return !1;
			} else {
				if (!this._matchSegment(r, this.path[t], t === this.path.length - 1)) return !1;
				t--, n--;
			}
		}
		return n < 0;
	}
	_matchSegment(e, t, n) {
		if (e.tag !== "*" && e.tag !== t.tag || e.namespace !== void 0 && e.namespace !== "*" && e.namespace !== t.namespace || e.attrName !== void 0 && (!n || !t.values || !(e.attrName in t.values) || e.attrValue !== void 0 && String(t.values[e.attrName]) !== String(e.attrValue))) return !1;
		if (e.position !== void 0) {
			if (!n) return !1;
			let r = t.counter ?? 0;
			if (e.position === "first" && r !== 0 || e.position === "odd" && r % 2 != 1 || e.position === "even" && r % 2 != 0 || e.position === "nth" && r !== e.positionValue) return !1;
		}
		return !0;
	}
	matchesAny(e) {
		return e.matchesAny(this);
	}
	snapshot() {
		return {
			path: this.path.map((e) => ({ ...e })),
			siblingStacks: this.siblingStacks.map((e) => new Map(e))
		};
	}
	restore(e) {
		this._pathStringCache = null, this.path = e.path.map((e) => ({ ...e })), this.siblingStacks = e.siblingStacks.map((e) => new Map(e));
	}
	readOnly() {
		return this._view;
	}
}, be = {
	apos: {
		regex: /&(apos|#0*39|#x0*27);/g,
		val: "'"
	},
	gt: {
		regex: /&(gt|#0*62|#x0*3[Ee]);/g,
		val: ">"
	},
	lt: {
		regex: /&(lt|#0*60|#x0*3[Cc]);/g,
		val: "<"
	},
	quot: {
		regex: /&(quot|#0*34|#x0*22);/g,
		val: "\""
	}
}, A = {
	regex: /&(amp|#0*38|#x0*26);/g,
	val: "&"
}, xe = /* @__PURE__ */ new Set("!?\\\\/[]$%{}^&*()<>|+");
function j(e) {
	for (let t of e) if (xe.has(t)) throw Error(`[EntityReplacer] Invalid character '${t}' in entity name: "${e}"`);
	return e;
}
function M(e) {
	return e.replace(/[.\-+*:]/g, "\\$&");
}
function N(e, t, n = !1) {
	return e === !1 || e === null ? null : e === !0 ? t : e === void 0 ? n ? t : null : typeof e == "object" ? e : null;
}
function Se(e) {
	return e === "all" ? "all" : typeof e == "string" ? new Set([e]) : Array.isArray(e) ? new Set(e) : new Set(["external"]);
}
function P(e) {
	let t = [];
	for (let n of Object.keys(e)) {
		let r = e[n];
		if (typeof r == "object" && r && r.val !== void 0) t.push([n, {
			regex: r.regex ?? r.regx,
			val: r.val
		}]);
		else if (typeof r == "string") {
			if (r.indexOf("&") !== -1) continue;
			j(n), t.push([n, {
				regex: RegExp("&" + M(n) + ";", "g"),
				val: r
			}]);
		}
	}
	return t;
}
var Ce = class {
	constructor(e = {}) {
		this._defaultTable = N(e.default, be, !0), this._systemTable = N(e.system, null, !1), this._ampEnabled = e.amp !== !1 && e.amp !== null, this._maxTotalExpansions = e.maxTotalExpansions || 0, this._maxExpandedLength = e.maxExpandedLength || 0, this._applyLimitsTo = Se(e.applyLimitsTo ?? "external"), this._postCheck = typeof e.postCheck == "function" ? e.postCheck : (e) => e, this._limitExternal = this._applyLimitsTo === "all" || this._applyLimitsTo instanceof Set && this._applyLimitsTo.has("external"), this._limitSystem = this._applyLimitsTo === "all" || this._applyLimitsTo instanceof Set && this._applyLimitsTo.has("system"), this._limitDefault = this._applyLimitsTo === "all" || this._applyLimitsTo instanceof Set && this._applyLimitsTo.has("default"), this._defaultEntries = this._defaultTable ? Object.entries(this._defaultTable) : [], this._systemEntries = this._systemTable ? Object.entries(this._systemTable) : [], this._persistentEntries = [], this._inputEntries = [], this._totalExpansions = 0, this._expandedLength = 0;
	}
	setExternalEntities(e) {
		this._persistentEntries = P(e);
	}
	addExternalEntity(e, t) {
		j(e), typeof t == "string" && t.indexOf("&") === -1 && this._persistentEntries.push([e, {
			regex: RegExp("&" + M(e) + ";", "g"),
			val: t
		}]);
	}
	addInputEntities(e) {
		this._totalExpansions = 0, this._expandedLength = 0, this._inputEntries = P(e);
	}
	reset() {
		this._inputEntries = [], this._totalExpansions = 0, this._expandedLength = 0;
	}
	replace(e) {
		if (typeof e != "string" || e.length === 0 || e.indexOf("&") === -1) return e;
		let t = e;
		return this._persistentEntries.length > 0 && (e = this._applyEntries(e, this._persistentEntries, this._limitExternal)), this._inputEntries.length > 0 && e.indexOf("&") !== -1 && (e = this._applyEntries(e, this._inputEntries, this._limitExternal)), this._defaultEntries.length > 0 && e.indexOf("&") !== -1 && (e = this._applyEntries(e, this._defaultEntries, this._limitDefault)), this._systemEntries.length > 0 && e.indexOf("&") !== -1 && (e = this._applyEntries(e, this._systemEntries, this._limitSystem)), this._ampEnabled && e.indexOf("&") !== -1 && (e = e.replace(A.regex, A.val)), e = this._postCheck(e, t), e;
	}
	parse(e) {
		return this.replace(e);
	}
	_applyEntries(e, t, n) {
		let r = n && this._maxTotalExpansions > 0, i = n && this._maxExpandedLength > 0, a = r || i;
		for (let n = 0; n < t.length && e.indexOf("&") !== -1; n++) {
			let o = t[n][1];
			if (!a) {
				e = e.replace(o.regex, o.val);
				continue;
			}
			if (r && !i) {
				let t = 0;
				if (e = e.replace(o.regex, (...e) => (t++, typeof o.val == "function" ? o.val(...e) : o.val)), t > 0 && (this._totalExpansions += t, this._totalExpansions > this._maxTotalExpansions)) throw Error(`[EntityReplacer] Entity expansion count limit exceeded: ${this._totalExpansions} > ${this._maxTotalExpansions}`);
			} else if (i && !r) {
				let t = e.length;
				e = e.replace(o.regex, o.val);
				let n = e.length - t;
				if (n > 0 && (this._expandedLength += n, this._expandedLength > this._maxExpandedLength)) throw Error(`[EntityReplacer] Expanded content length limit exceeded: ${this._expandedLength} > ${this._maxExpandedLength}`);
			} else {
				let t = e.length, n = 0;
				if (e = e.replace(o.regex, (...e) => (n++, typeof o.val == "function" ? o.val(...e) : o.val)), n > 0 && (this._totalExpansions += n, this._totalExpansions > this._maxTotalExpansions)) throw Error(`[EntityReplacer] Entity expansion count limit exceeded: ${this._totalExpansions} > ${this._maxTotalExpansions}`);
				let r = e.length - t;
				if (r > 0 && (this._expandedLength += r, this._expandedLength > this._maxExpandedLength)) throw Error(`[EntityReplacer] Expanded content length limit exceeded: ${this._expandedLength} > ${this._maxExpandedLength}`);
			}
		}
		return e;
	}
}, we = {
	nbsp: {
		regex: /&(nbsp|#0*160|#x0*[Aa]0);/g,
		val: "\xA0"
	},
	copy: {
		regex: /&(copy|#0*169|#x0*[Aa]9);/g,
		val: "©"
	},
	reg: {
		regex: /&(reg|#0*174|#x0*[Aa][Ee]);/g,
		val: "®"
	},
	trade: {
		regex: /&(trade|#0*8482|#x0*2122);/g,
		val: "™"
	},
	mdash: {
		regex: /&(mdash|#0*8212|#x0*2014);/g,
		val: "—"
	},
	ndash: {
		regex: /&(ndash|#0*8211|#x0*2013);/g,
		val: "–"
	},
	hellip: {
		regex: /&(hellip|#0*8230|#x0*2026);/g,
		val: "…"
	},
	laquo: {
		regex: /&(laquo|#0*171|#x0*[Aa][Bb]);/g,
		val: "«"
	},
	raquo: {
		regex: /&(raquo|#0*187|#x0*[Bb][Bb]);/g,
		val: "»"
	},
	lsquo: {
		regex: /&(lsquo|#0*8216|#x0*2018);/g,
		val: "‘"
	},
	rsquo: {
		regex: /&(rsquo|#0*8217|#x0*2019);/g,
		val: "’"
	},
	ldquo: {
		regex: /&(ldquo|#0*8220|#x0*201[Cc]);/g,
		val: "“"
	},
	rdquo: {
		regex: /&(rdquo|#0*8221|#x0*201[Dd]);/g,
		val: "”"
	},
	bull: {
		regex: /&(bull|#0*8226|#x0*2022);/g,
		val: "•"
	},
	para: {
		regex: /&(para|#0*182|#x0*[Bb]6);/g,
		val: "¶"
	},
	sect: {
		regex: /&(sect|#0*167|#x0*[Aa]7);/g,
		val: "§"
	},
	deg: {
		regex: /&(deg|#0*176|#x0*[Bb]0);/g,
		val: "°"
	},
	frac12: {
		regex: /&(frac12|#0*189|#x0*[Bb][Dd]);/g,
		val: "½"
	},
	frac14: {
		regex: /&(frac14|#0*188|#x0*[Bb][Cc]);/g,
		val: "¼"
	},
	frac34: {
		regex: /&(frac34|#0*190|#x0*[Bb][Ee]);/g,
		val: "¾"
	},
	inr: {
		regex: /&(inr|#0*8377);/g,
		val: "₹"
	}
}, Te = {
	cent: {
		regex: /&(cent|#0*162|#x0*[Aa]2);/g,
		val: "¢"
	},
	pound: {
		regex: /&(pound|#0*163|#x0*[Aa]3);/g,
		val: "£"
	},
	yen: {
		regex: /&(yen|#0*165|#x0*[Aa]5);/g,
		val: "¥"
	},
	euro: {
		regex: /&(euro|#0*8364|#x0*20[Aa][Cc]);/g,
		val: "€"
	},
	inr: {
		regex: /&(inr|#0*8377|#x0*20[Bb]9);/g,
		val: "₹"
	},
	curren: {
		regex: /&(curren|#0*164|#x0*[Aa]4);/g,
		val: "¤"
	},
	fnof: {
		regex: /&(fnof|#0*402|#x0*192);/g,
		val: "ƒ"
	}
}, Ee = {
	num_dec: {
		regex: /&#0*([0-9]{1,7});/g,
		val: (e, t) => F(t, 10, "&#")
	},
	num_hex: {
		regex: /&#x0*([0-9a-fA-F]{1,6});/g,
		val: (e, t) => F(t, 16, "&#x")
	}
};
function F(e, t, n) {
	let r = Number.parseInt(e, t);
	return r >= 0 && r <= 1114111 ? String.fromCodePoint(r) : n + e + ";";
}
//#endregion
//#region node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
function De(e, t) {
	if (!e) return {};
	let n = t.attributesGroupName ? e[t.attributesGroupName] : e;
	if (!n) return {};
	let r = {};
	for (let e in n) if (e.startsWith(t.attributeNamePrefix)) {
		let i = e.substring(t.attributeNamePrefix.length);
		r[i] = n[e];
	} else r[e] = n[e];
	return r;
}
function Oe(e) {
	if (!e || typeof e != "string") return;
	let t = e.indexOf(":");
	if (t !== -1 && t > 0) {
		let n = e.substring(0, t);
		if (n !== "xmlns") return n;
	}
}
var ke = class {
	constructor(e) {
		this.options = e, this.currentNode = null, this.tagsNodeStack = [], this.parseXml = Pe, this.parseTextData = Ae, this.resolveNameSpace = je, this.buildAttributesMap = Ne, this.isItStopNode = Re, this.replaceEntitiesValue = Ie, this.readStopNodeData = Ve, this.saveTextToParentTag = Le, this.addChild = Fe, this.ignoreAttributesFn = ge(this.options.ignoreAttributes), this.entityExpansionCount = 0, this.currentExpandedLength = 0, this.entityReplacer = new Ce({
			default: !0,
			system: this.options.htmlEntities ? {
				...we,
				...Ee,
				...Te
			} : {},
			maxTotalExpansions: this.options.processEntities.maxTotalExpansions,
			maxExpandedLength: this.options.processEntities.maxExpandedLength,
			applyLimitsTo: "all"
		}), this.matcher = new ye(), this.readonlyMatcher = this.matcher.readOnly(), this.isCurrentNodeStopNode = !1, this.stopNodeExpressionsSet = new _e();
		let t = this.options.stopNodes;
		if (t && t.length > 0) {
			for (let e = 0; e < t.length; e++) {
				let n = t[e];
				typeof n == "string" ? this.stopNodeExpressionsSet.add(new k(n)) : n instanceof k && this.stopNodeExpressionsSet.add(n);
			}
			this.stopNodeExpressionsSet.seal();
		}
	}
};
function Ae(e, t, n, r, i, a, o) {
	let s = this.options;
	if (e !== void 0 && (s.trimValues && !r && (e = e.trim()), e.length > 0)) {
		o || (e = this.replaceEntitiesValue(e, t, n));
		let r = s.jPath ? n.toString() : n, c = s.tagValueProcessor(t, e, r, i, a);
		return c == null ? e : typeof c != typeof e || c !== e ? c : s.trimValues || e.trim() === e ? R(e, s.parseTagValue, s.numberParseOptions) : e;
	}
}
function je(e) {
	if (this.options.removeNSPrefix) {
		let t = e.split(":"), n = e.charAt(0) === "/" ? "/" : "";
		if (t[0] === "xmlns") return "";
		t.length === 2 && (e = n + t[1]);
	}
	return e;
}
var Me = /* @__PURE__ */ RegExp("([^\\s=]+)\\s*(=\\s*(['\"])([\\s\\S]*?)\\3)?", "gm");
function Ne(e, t, n) {
	let i = this.options;
	if (i.ignoreAttributes !== !0 && typeof e == "string") {
		let a = r(e, Me), o = a.length, s = {}, c = Array(o), l = !1, u = {};
		for (let e = 0; e < o; e++) {
			let t = this.resolveNameSpace(a[e][1]), r = a[e][4];
			if (t.length && r !== void 0) {
				let a = r;
				i.trimValues && (a = a.trim()), a = this.replaceEntitiesValue(a, n, this.readonlyMatcher), c[e] = a, u[t] = a, l = !0;
			}
		}
		l && typeof t == "object" && t.updateCurrent && t.updateCurrent(u);
		let d = i.jPath ? t.toString() : this.readonlyMatcher, f = !1;
		for (let e = 0; e < o; e++) {
			let t = this.resolveNameSpace(a[e][1]);
			if (this.ignoreAttributesFn(t, d)) continue;
			let n = i.attributeNamePrefix + t;
			if (t.length) if (i.transformAttributeName && (n = i.transformAttributeName(n)), n = B(n, i), a[e][4] !== void 0) {
				let r = c[e], a = i.attributeValueProcessor(t, r, d);
				a == null ? s[n] = r : typeof a != typeof r || a !== r ? s[n] = a : s[n] = R(r, i.parseAttributeValue, i.numberParseOptions), f = !0;
			} else i.allowBooleanAttributes && (s[n] = !0, f = !0);
		}
		if (!f) return;
		if (i.attributesGroupName) {
			let e = {};
			return e[i.attributesGroupName] = s, e;
		}
		return s;
	}
}
var Pe = function(e) {
	e = e.replace(/\r\n?/g, "\n");
	let t = new T("!xml"), n = t, r = "";
	this.matcher.reset(), this.entityExpansionCount = 0, this.currentExpandedLength = 0;
	let i = this.options, a = new oe(i.processEntities), o = e.length;
	for (let s = 0; s < o; s++) if (e[s] === "<") {
		let c = e.charCodeAt(s + 1);
		if (c === 47) {
			let t = I(e, ">", s, "Closing Tag is not closed."), a = e.substring(s + 2, t).trim();
			if (i.removeNSPrefix) {
				let e = a.indexOf(":");
				e !== -1 && (a = a.substr(e + 1));
			}
			a = z(i.transformTagName, a, "", i).tagName, n && (r = this.saveTextToParentTag(r, n, this.readonlyMatcher));
			let o = this.matcher.getCurrentTag();
			if (a && i.unpairedTagsSet.has(a)) throw Error(`Unpaired tag can not be used as closing tag: </${a}>`);
			o && i.unpairedTagsSet.has(o) && (this.matcher.pop(), this.tagsNodeStack.pop()), this.matcher.pop(), this.isCurrentNodeStopNode = !1, n = this.tagsNodeStack.pop(), r = "", s = t;
		} else if (c === 63) {
			let t = L(e, s, !1, "?>");
			if (!t) throw Error("Pi Tag is not closed.");
			if (r = this.saveTextToParentTag(r, n, this.readonlyMatcher), !(i.ignoreDeclaration && t.tagName === "?xml" || i.ignorePiTags)) {
				let e = new T(t.tagName);
				e.add(i.textNodeName, ""), t.tagName !== t.tagExp && t.attrExpPresent && (e[":@"] = this.buildAttributesMap(t.tagExp, this.matcher, t.tagName)), this.addChild(n, e, this.readonlyMatcher, s);
			}
			s = t.closeIndex + 1;
		} else if (c === 33 && e.charCodeAt(s + 2) === 45 && e.charCodeAt(s + 3) === 45) {
			let t = I(e, "-->", s + 4, "Comment is not closed.");
			if (i.commentPropName) {
				let a = e.substring(s + 4, t - 2);
				r = this.saveTextToParentTag(r, n, this.readonlyMatcher), n.add(i.commentPropName, [{ [i.textNodeName]: a }]);
			}
			s = t;
		} else if (c === 33 && e.charCodeAt(s + 2) === 68) {
			let t = a.readDocType(e, s);
			this.entityReplacer.addInputEntities(t.entities), s = t.i;
		} else if (c === 33 && e.charCodeAt(s + 2) === 91) {
			let t = I(e, "]]>", s, "CDATA is not closed.") - 2, a = e.substring(s + 9, t);
			r = this.saveTextToParentTag(r, n, this.readonlyMatcher);
			let o = this.parseTextData(a, n.tagname, this.readonlyMatcher, !0, !1, !0, !0);
			o ??= "", i.cdataPropName ? n.add(i.cdataPropName, [{ [i.textNodeName]: a }]) : n.add(i.textNodeName, o), s = t + 2;
		} else {
			let a = L(e, s, i.removeNSPrefix);
			if (!a) {
				let t = e.substring(Math.max(0, s - 50), Math.min(o, s + 50));
				throw Error(`readTagExp returned undefined at position ${s}. Context: "${t}"`);
			}
			let c = a.tagName, l = a.rawTagName, u = a.tagExp, d = a.attrExpPresent, f = a.closeIndex;
			if ({tagName: c, tagExp: u} = z(i.transformTagName, c, u, i), i.strictReservedNames && (c === i.commentPropName || c === i.cdataPropName || c === i.textNodeName || c === i.attributesGroupName)) throw Error(`Invalid tag name: ${c}`);
			n && r && n.tagname !== "!xml" && (r = this.saveTextToParentTag(r, n, this.readonlyMatcher, !1));
			let p = n;
			p && i.unpairedTagsSet.has(p.tagname) && (n = this.tagsNodeStack.pop(), this.matcher.pop());
			let m = !1;
			u.length > 0 && u.lastIndexOf("/") === u.length - 1 && (m = !0, c[c.length - 1] === "/" ? (c = c.substr(0, c.length - 1), u = c) : u = u.substr(0, u.length - 1), d = c !== u);
			let h = null, g;
			g = Oe(l), c !== t.tagname && this.matcher.push(c, {}, g), c !== u && d && (h = this.buildAttributesMap(u, this.matcher, c), h && De(h, i)), c !== t.tagname && (this.isCurrentNodeStopNode = this.isItStopNode());
			let _ = s;
			if (this.isCurrentNodeStopNode) {
				let t = "";
				if (m) s = a.closeIndex;
				else if (i.unpairedTagsSet.has(c)) s = a.closeIndex;
				else {
					let n = this.readStopNodeData(e, l, f + 1);
					if (!n) throw Error(`Unexpected end of ${l}`);
					s = n.i, t = n.tagContent;
				}
				let r = new T(c);
				h && (r[":@"] = h), r.add(i.textNodeName, t), this.matcher.pop(), this.isCurrentNodeStopNode = !1, this.addChild(n, r, this.readonlyMatcher, _);
			} else {
				if (m) {
					({tagName: c, tagExp: u} = z(i.transformTagName, c, u, i));
					let e = new T(c);
					h && (e[":@"] = h), this.addChild(n, e, this.readonlyMatcher, _), this.matcher.pop(), this.isCurrentNodeStopNode = !1;
				} else if (i.unpairedTagsSet.has(c)) {
					let e = new T(c);
					h && (e[":@"] = h), this.addChild(n, e, this.readonlyMatcher, _), this.matcher.pop(), this.isCurrentNodeStopNode = !1, s = a.closeIndex;
					continue;
				} else {
					let e = new T(c);
					if (this.tagsNodeStack.length > i.maxNestedTags) throw Error("Maximum nested tags exceeded");
					this.tagsNodeStack.push(n), h && (e[":@"] = h), this.addChild(n, e, this.readonlyMatcher, _), n = e;
				}
				r = "", s = f;
			}
		}
	} else r += e[s];
	return t.child;
};
function Fe(e, t, n, r) {
	this.options.captureMetaData || (r = void 0);
	let i = this.options.jPath ? n.toString() : n, a = this.options.updateTag(t.tagname, i, t[":@"]);
	a === !1 || (typeof a == "string" && (t.tagname = a), e.addChild(t, r));
}
function Ie(e, t, n) {
	let r = this.options.processEntities;
	if (!r || !r.enabled) return e;
	if (r.allowedTags) {
		let i = this.options.jPath ? n.toString() : n;
		if (!(Array.isArray(r.allowedTags) ? r.allowedTags.includes(t) : r.allowedTags(t, i))) return e;
	}
	if (r.tagFilter) {
		let i = this.options.jPath ? n.toString() : n;
		if (!r.tagFilter(t, i)) return e;
	}
	return this.entityReplacer.replace(e);
}
function Le(e, t, n, r) {
	return e &&= (r === void 0 && (r = t.child.length === 0), e = this.parseTextData(e, t.tagname, n, !1, t[":@"] ? Object.keys(t[":@"]).length !== 0 : !1, r), e !== void 0 && e !== "" && t.add(this.options.textNodeName, e), ""), e;
}
function Re() {
	return this.stopNodeExpressionsSet.size === 0 ? !1 : this.matcher.matchesAny(this.stopNodeExpressionsSet);
}
function ze(e, t, n = ">") {
	let r = 0, i = [], a = e.length, o = n.charCodeAt(0), s = n.length > 1 ? n.charCodeAt(1) : -1;
	for (let n = t; n < a; n++) {
		let t = e.charCodeAt(n);
		if (r) t === r && (r = 0);
		else if (t === 34 || t === 39) r = t;
		else if (t === o) if (s !== -1) {
			if (e.charCodeAt(n + 1) === s) return {
				data: String.fromCharCode(...i),
				index: n
			};
		} else return {
			data: String.fromCharCode(...i),
			index: n
		};
		else if (t === 9) {
			i.push(32);
			continue;
		}
		i.push(t);
	}
}
function I(e, t, n, r) {
	let i = e.indexOf(t, n);
	if (i === -1) throw Error(r);
	return i + t.length - 1;
}
function Be(e, t, n, r) {
	let i = e.indexOf(t, n);
	if (i === -1) throw Error(r);
	return i;
}
function L(e, t, n, r = ">") {
	let i = ze(e, t + 1, r);
	if (!i) return;
	let a = i.data, o = i.index, s = a.search(/\s/), c = a, l = !0;
	s !== -1 && (c = a.substring(0, s), a = a.substring(s + 1).trimStart());
	let u = c;
	if (n) {
		let e = c.indexOf(":");
		e !== -1 && (c = c.substr(e + 1), l = c !== i.data.substr(e + 1));
	}
	return {
		tagName: c,
		tagExp: a,
		closeIndex: o,
		attrExpPresent: l,
		rawTagName: u
	};
}
function Ve(e, t, n) {
	let r = n, i = 1, a = e.length;
	for (; n < a; n++) if (e[n] === "<") {
		let a = e.charCodeAt(n + 1);
		if (a === 47) {
			let a = Be(e, ">", n, `${t} is not closed`);
			if (e.substring(n + 2, a).trim() === t && (i--, i === 0)) return {
				tagContent: e.substring(r, n),
				i: a
			};
			n = a;
		} else if (a === 63) n = I(e, "?>", n + 1, "StopNode is not closed.");
		else if (a === 33 && e.charCodeAt(n + 2) === 45 && e.charCodeAt(n + 3) === 45) n = I(e, "-->", n + 3, "StopNode is not closed.");
		else if (a === 33 && e.charCodeAt(n + 2) === 91) n = I(e, "]]>", n, "StopNode is not closed.") - 2;
		else {
			let r = L(e, n, ">");
			r && ((r && r.tagName) === t && r.tagExp[r.tagExp.length - 1] !== "/" && i++, n = r.closeIndex);
		}
	}
}
function R(e, t, n) {
	if (t && typeof e == "string") {
		let t = e.trim();
		return t === "true" ? !0 : t === "false" ? !1 : ue(e, n);
	} else if (a(e)) return e;
	else return "";
}
function z(e, t, n, r) {
	if (e) {
		let r = e(t);
		n === t && (n = r), t = r;
	}
	return t = B(t, r), {
		tagName: t,
		tagExp: n
	};
}
function B(e, t) {
	if (s.includes(e)) throw Error(`[SECURITY] Invalid name: "${e}" is a reserved JavaScript keyword that could cause prototype pollution`);
	return o.includes(e) ? t.onDangerousProperty(e) : e;
}
//#endregion
//#region node_modules/fast-xml-parser/src/xmlparser/node2json.js
var V = T.getMetaDataSymbol();
function He(e, t) {
	if (!e || typeof e != "object") return {};
	if (!t) return e;
	let n = {};
	for (let r in e) if (r.startsWith(t)) {
		let i = r.substring(t.length);
		n[i] = e[r];
	} else n[r] = e[r];
	return n;
}
function Ue(e, t, n, r) {
	return H(e, t, n, r);
}
function H(e, t, n, r) {
	let i, a = {};
	for (let o = 0; o < e.length; o++) {
		let s = e[o], c = We(s);
		if (c !== void 0 && c !== t.textNodeName) {
			let e = He(s[":@"] || {}, t.attributeNamePrefix);
			n.push(c, e);
		}
		if (c === t.textNodeName) i === void 0 ? i = s[c] : i += "" + s[c];
		else if (c === void 0) continue;
		else if (s[c]) {
			let e = H(s[c], t, n, r), i = Ke(e, t);
			if (s[":@"] ? Ge(e, s[":@"], r, t) : Object.keys(e).length === 1 && e[t.textNodeName] !== void 0 && !t.alwaysCreateTextNode ? e = e[t.textNodeName] : Object.keys(e).length === 0 && (t.alwaysCreateTextNode ? e[t.textNodeName] = "" : e = ""), s[V] !== void 0 && typeof e == "object" && e && (e[V] = s[V]), a[c] !== void 0 && Object.prototype.hasOwnProperty.call(a, c)) Array.isArray(a[c]) || (a[c] = [a[c]]), a[c].push(e);
			else {
				let n = t.jPath ? r.toString() : r;
				t.isArray(c, n, i) ? a[c] = [e] : a[c] = e;
			}
			c !== void 0 && c !== t.textNodeName && n.pop();
		}
	}
	return typeof i == "string" ? i.length > 0 && (a[t.textNodeName] = i) : i !== void 0 && (a[t.textNodeName] = i), a;
}
function We(e) {
	let t = Object.keys(e);
	for (let e = 0; e < t.length; e++) {
		let n = t[e];
		if (n !== ":@") return n;
	}
}
function Ge(e, t, n, r) {
	if (t) {
		let i = Object.keys(t), a = i.length;
		for (let o = 0; o < a; o++) {
			let a = i[o], s = a.startsWith(r.attributeNamePrefix) ? a.substring(r.attributeNamePrefix.length) : a, c = r.jPath ? n.toString() + "." + s : n;
			r.isArray(a, c, !0, !0) ? e[a] = [t[a]] : e[a] = t[a];
		}
	}
}
function Ke(e, t) {
	let { textNodeName: n } = t, r = Object.keys(e).length;
	return !!(r === 0 || r === 1 && (e[n] || typeof e[n] == "boolean" || e[n] === 0));
}
//#endregion
//#region node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var qe = class {
	constructor(e) {
		this.externalEntities = {}, this.options = ae(e);
	}
	parse(e, t) {
		if (typeof e != "string" && e.toString) e = e.toString();
		else if (typeof e != "string") throw Error("XML data is accepted in String or Bytes[] form.");
		if (t) {
			t === !0 && (t = {});
			let n = l(e, t);
			if (n !== !0) throw Error(`${n.err.msg}:${n.err.line}:${n.err.col}`);
		}
		let n = new ke(this.options);
		n.entityReplacer.setExternalEntities(this.externalEntities);
		let r = n.parseXml(e);
		return this.options.preserveOrder || r === void 0 ? r : Ue(r, this.options, n.matcher, n.readonlyMatcher);
	}
	addEntity(e, t) {
		if (t.indexOf("&") !== -1) throw Error("Entity value can't have '&'");
		if (e.indexOf("&") !== -1 || e.indexOf(";") !== -1) throw Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
		if (t === "&") throw Error("An entity with value '&' is not permitted");
		this.externalEntities[e] = t;
	}
	static getMetaDataSymbol() {
		return T.getMetaDataSymbol();
	}
};
//#endregion
//#region src/sbgnmlParser.js
function Je(e) {
	let t = new qe({
		ignoreAttributes: !1,
		attributeNamePrefix: "",
		isArray: (e) => [
			"map",
			"glyph",
			"arc",
			"port",
			"stateVariable",
			"unitOfInformation"
		].includes(e)
	}).parse(e).sbgn;
	if (!t || !t.map || t.map.length === 0) throw Error("Invalid SBGN-ML: <sbgn> or <map> elements are missing.");
	let n = t.map[0], r = [], i = [];
	function a(e) {
		try {
			let t = e.extension?.annotation;
			if (!t) return null;
			let n = t["rdf:RDF"]?.["rdf:Description"];
			if (!n) return null;
			for (let e in n) if (e.includes("is") || e.includes("hasPart")) {
				let t = n[e]?.["rdf:Bag"];
				if (t) {
					let e = t["rdf:li"];
					if (Array.isArray(e) && e.length > 0) return e[0]["rdf:resource"];
					if (e) return e["rdf:resource"];
				}
			}
		} catch (e) {
			console.warn("Could not parse a complex annotation structure.", e);
		}
		return null;
	}
	let o = (e, t = null) => {
		if (e.class === "state variable" || e.class === "unit of information") return;
		let n = [], i = [], s = [];
		e.glyph && e.glyph.forEach((e) => {
			e.class === "state variable" ? n.push({
				id: e.id,
				value: e.state?.value || "",
				variable: e.state?.variable || "",
				x: parseFloat(e.bbox?.x || 0),
				y: parseFloat(e.bbox?.y || 0),
				width: parseFloat(e.bbox?.w || 0),
				height: parseFloat(e.bbox?.h || 0)
			}) : e.class === "unit of information" ? i.push({
				id: e.id,
				label: e.label?.text || "",
				x: parseFloat(e.bbox?.x || 0),
				y: parseFloat(e.bbox?.y || 0),
				width: parseFloat(e.bbox?.w || 0),
				height: parseFloat(e.bbox?.h || 0),
				entityName: e.entity?.name ? e.entity?.name == "perturbation" ? "perturbing agent" : e.entity?.name : e.entity?.name || null
			}) : s.push(e);
		}), r.push({
			id: e.id,
			type: e.class,
			label: e.label?.text || "",
			x: parseFloat(e.bbox?.x || 0),
			y: parseFloat(e.bbox?.y || 0),
			width: parseFloat(e.bbox?.w || 0),
			height: parseFloat(e.bbox?.h || 0),
			parentId: t || e.compartmentRef || null,
			stateVariables: n,
			unitsOfInformation: i,
			isClone: e.hasOwnProperty("clone"),
			isMultimer: typeof e.class == "string" && e.class.includes("multimer"),
			link: a(e)
		}), s.forEach((t) => o(t, e.id));
	};
	return n.glyph && n.glyph.forEach((e) => o(e)), n.arc && n.arc.forEach((e) => {
		i.push({
			id: e.id,
			source: e.source,
			target: e.target,
			type: e.class
		});
	}), {
		nodes: r,
		edges: i
	};
}
//#endregion
//#region src/themes.js
var U = {
	name: "cool",
	macromolecule: {
		fill: "url(#gradMacromolecule)",
		stroke: "#5b9bd5",
		text: "#2c3e50"
	},
	simpleChemical: {
		fill: "url(#gradChemical)",
		stroke: "#8bc34a",
		text: "#33691e"
	},
	complex: {
		fill: "#f9f9f9",
		stroke: "#7f8c8d",
		text: "#555555"
	},
	nucleicAcidFeature: {
		fill: "#fdf2e9",
		stroke: "#e67e22",
		text: "#d35400"
	},
	phenotype: {
		fill: "#f4f6f7",
		stroke: "#7f8c8d",
		text: "#2c3e50"
	},
	unspecifiedEntity: {
		fill: "#f0f3f4",
		stroke: "#95a5a6",
		text: "#34495e"
	},
	perturbingAgent: {
		fill: "#f9ebea",
		stroke: "#c0392b",
		text: "#922b21"
	},
	compartment: {
		fill: "#f7f9fa",
		stroke: "#aeb6bf",
		text: "#5d6d7e"
	},
	process: {
		fill: "#ffffff",
		stroke: "#555555",
		text: "#333333"
	},
	association: {
		fill: "#555555",
		stroke: "#555555",
		text: "#333333"
	},
	dissociation: {
		fill: "#ffffff",
		stroke: "#555555",
		text: "#333333"
	},
	logicalOperator: {
		fill: "#ffffff",
		stroke: "#555555",
		text: "#333333"
	},
	tag: {
		fill: "#ffffff",
		stroke: "#555555",
		text: "#333333"
	},
	emptySet: {
		fill: "#ffffff",
		stroke: "#7f8c8d",
		text: "#7f8c8d"
	},
	biologicalActivity: {
		fill: "url(#gradMacromolecule)",
		stroke: "#5b9bd5",
		text: "#2c3e50"
	},
	stateVariable: {
		fill: "#ffffff",
		stroke: "#2c3e50",
		text: "#333333"
	},
	unitOfInformation: {
		fill: "#f5f5f5",
		stroke: "#7f8c8d",
		text: "#555555"
	},
	cloneMarker: { fill: "#a0a0a0" },
	multimerMarker: { fallbackStroke: "#999999" },
	edge: {
		defaultStroke: "#555555",
		inhibitionStroke: "#555555",
		equivalenceStroke: "#555555",
		text: "#555555"
	},
	gradients: "\n    <linearGradient id=\"gradMacromolecule\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" style=\"stop-color:#f8fbff;stop-opacity:1\" />\n      <stop offset=\"100%\" style=\"stop-color:#d1e6ff;stop-opacity:1\" />\n    </linearGradient>\n    \n    <linearGradient id=\"gradChemical\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" style=\"stop-color:#fafff8;stop-opacity:1\" />\n      <stop offset=\"100%\" style=\"stop-color:#e2ffd1;stop-opacity:1\" />\n    </linearGradient>\n  ",
	filters: "\n    <filter id=\"dropShadow\" x=\"-20%\" y=\"-20%\" width=\"150%\" height=\"150%\">\n      <feGaussianBlur in=\"SourceAlpha\" stdDeviation=\"2.5\" />\n      <feOffset dx=\"1.5\" dy=\"1.5\" result=\"offsetblur\" />\n      <feComponentTransfer><feFuncA type=\"linear\" slope=\"0.3\"/></feComponentTransfer>\n      <feMerge><feMergeNode/><feMergeNode in=\"SourceGraphic\"/></feMerge>\n    </filter>\n  "
}, W = {
	cool: U,
	bluescale: {
		name: "bluescale",
		macromolecule: {
			fill: "#9ecae1",
			stroke: "#3182bd",
			text: "#08306b"
		},
		simpleChemical: {
			fill: "#c6dbef",
			stroke: "#6baed6",
			text: "#08519c"
		},
		complex: {
			fill: "#eff3ff",
			stroke: "#3182bd",
			text: "#08306b"
		},
		nucleicAcidFeature: {
			fill: "#6baed6",
			stroke: "#2171b5",
			text: "#ffffff"
		},
		phenotype: {
			fill: "#9ecae1",
			stroke: "#08519c",
			text: "#08306b"
		},
		unspecifiedEntity: {
			fill: "#deebf7",
			stroke: "#6baed6",
			text: "#08519c"
		},
		perturbingAgent: {
			fill: "#4292c6",
			stroke: "#084594",
			text: "#ffffff"
		},
		compartment: {
			fill: "none",
			stroke: "#9ecae1",
			text: "#3182bd"
		},
		process: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		association: {
			fill: "#555555",
			stroke: "#555555",
			text: "#333333"
		},
		dissociation: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#333333"
		},
		logicalOperator: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#333333"
		},
		tag: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#333333"
		},
		emptySet: {
			fill: "#ffffff",
			stroke: "#7f8c8d",
			text: "#7f8c8d"
		},
		biologicalActivity: {
			fill: "#9ecae1",
			stroke: "#3182bd",
			text: "#08306b"
		},
		stateVariable: {
			fill: "#ffffff",
			stroke: "#000000",
			text: "#000000"
		},
		unitOfInformation: {
			fill: "#f0f0f0",
			stroke: "#333333",
			text: "#000000"
		},
		cloneMarker: { fill: "#777777" },
		edge: {
			defaultStroke: "#555555",
			inhibitionStroke: "#555555",
			equivalenceStroke: "#555555"
		},
		gradients: "",
		filters: U.filters
	},
	warm: {
		name: "warm",
		macromolecule: {
			fill: "url(#gradMacromoleculeWarm)",
			stroke: "#a569bd",
			text: "#4a235a"
		},
		simpleChemical: {
			fill: "url(#gradChemicalWarm)",
			stroke: "#f5b041",
			text: "#7e5109"
		},
		complex: {
			fill: "#fdfefe",
			stroke: "#b0a8a0",
			text: "#4d4135"
		},
		nucleicAcidFeature: {
			fill: "#f5cba7",
			stroke: "#e67e22",
			text: "#6e2c00"
		},
		phenotype: {
			fill: "#d2b4de",
			stroke: "#8e44ad",
			text: "#3c134e"
		},
		unspecifiedEntity: {
			fill: "#f2f3f4",
			stroke: "#99a3a4",
			text: "#273746"
		},
		perturbingAgent: {
			fill: "#fadbd8",
			stroke: "#c0392b",
			text: "#641e16"
		},
		compartment: {
			fill: "#fcfaf8",
			stroke: "#d5d0ca",
			text: "#5c5145"
		},
		biologicalActivity: {
			fill: "url(#gradMacromoleculeWarm)",
			stroke: "#a569bd",
			text: "#4a235a"
		},
		process: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#333333"
		},
		association: {
			fill: "#555555",
			stroke: "#555555",
			text: "#333333"
		},
		dissociation: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#333333"
		},
		logicalOperator: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#333333"
		},
		stateVariable: {
			fill: "#ffffff",
			stroke: "#a569bd",
			text: "#4a235a"
		},
		unitOfInformation: {
			fill: "#f8f9f9",
			stroke: "#b0a8a0",
			text: "#4d4135"
		},
		cloneMarker: { fill: "#c1b8b0" },
		multimerMarker: { fallbackStroke: "#b0a8a0" },
		edge: {
			defaultStroke: "#706356",
			inhibitionStroke: "#706356",
			equivalenceStroke: "#b0a8a0"
		},
		gradients: "\n    <linearGradient id=\"gradMacromoleculeWarm\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" style=\"stop-color:#f5eef8;\" />\n      <stop offset=\"100%\" style=\"stop-color:#e8daef;\" />\n    </linearGradient>\n    <linearGradient id=\"gradChemicalWarm\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" style=\"stop-color:#fef9e7;\" />\n      <stop offset=\"100%\" style=\"stop-color:#fdebd0;\" />\n    </linearGradient>\n  ",
		filters: U.filters
	},
	colorblind: {
		name: "colorblind",
		macromolecule: {
			fill: "url(#gradMacromoleculeCB)",
			stroke: "#0072B2",
			text: "#003e63"
		},
		simpleChemical: {
			fill: "url(#gradChemicalCB)",
			stroke: "#F0E442",
			text: "#807800"
		},
		complex: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#555555"
		},
		nucleicAcidFeature: {
			fill: "#ffe1cc",
			stroke: "#D55E00",
			text: "#6b2f00"
		},
		phenotype: {
			fill: "#f2e6ff",
			stroke: "#CC79A7",
			text: "#663651"
		},
		unspecifiedEntity: {
			fill: "#e6f7ff",
			stroke: "#009E73",
			text: "#004d38"
		},
		perturbingAgent: {
			fill: "#e6e6e6",
			stroke: "#555555",
			text: "#555555"
		},
		compartment: {
			fill: "#fcfcfc",
			stroke: "#999999",
			text: "#333333"
		},
		biologicalActivity: {
			fill: "url(#gradMacromoleculeCB)",
			stroke: "#0072B2",
			text: "#003e63"
		},
		process: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#333333"
		},
		association: {
			fill: "#555555",
			stroke: "#555555",
			text: "#333333"
		},
		dissociation: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#333333"
		},
		logicalOperator: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#333333"
		},
		stateVariable: {
			fill: "#ffffff",
			stroke: "#000000",
			text: "#000000"
		},
		unitOfInformation: {
			fill: "#f0f0f0",
			stroke: "#000000",
			text: "#000000"
		},
		cloneMarker: { fill: "#b3b3b3" },
		multimerMarker: { fallbackStroke: "#666666" },
		edge: {
			defaultStroke: "#555555",
			inhibitionStroke: "#555555",
			equivalenceStroke: "#555555"
		},
		gradients: "\n    <linearGradient id=\"gradMacromoleculeCB\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" style=\"stop-color:#e6f3ff;\" />\n      <stop offset=\"100%\" style=\"stop-color:#b3dfff;\" />\n    </linearGradient>\n    <linearGradient id=\"gradChemicalCB\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" style=\"stop-color:#fffce6;\" />\n      <stop offset=\"100%\" style=\"stop-color:#fff9b3;\" />\n    </linearGradient>\n  ",
		filters: U.filters
	},
	blank: {
		name: "blank",
		macromolecule: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		simpleChemical: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		complex: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		nucleicAcidFeature: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		phenotype: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		unspecifiedEntity: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		perturbingAgent: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		compartment: {
			fill: "none",
			stroke: "#cccccc",
			text: "#555555"
		},
		biologicalActivity: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		process: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		logicalOperator: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		tag: {
			fill: "#ffffff",
			stroke: "#555555",
			text: "#000000"
		},
		emptySet: {
			fill: "#ffffff",
			stroke: "#999999",
			text: "#999999"
		},
		stateVariable: {
			fill: "#ffffff",
			stroke: "#000000",
			text: "#000000"
		},
		unitOfInformation: {
			fill: "#f0f0f0",
			stroke: "#555555",
			text: "#000000"
		},
		cloneMarker: { fill: "#bbbbbb" },
		multimerMarker: { fallbackStroke: "#888888" },
		edge: {
			defaultStroke: "#555555",
			inhibitionStroke: "#555555",
			equivalenceStroke: "#aaaaaa"
		},
		gradients: "",
		filters: ""
	}
};
//#endregion
//#region src/renderer.js
function Ye(e, t = {}) {
	let { nodes: n, edges: r } = e, i = W[t.theme || "cool"] || W.cool, a = {
		...W.cool,
		...i,
		...t.customTheme || {}
	}, o = Infinity, s = Infinity, c = -Infinity, l = -Infinity;
	n.forEach((e) => {
		o = Math.min(o, e.x), s = Math.min(s, e.y), c = Math.max(c, e.x + e.width), l = Math.max(l, e.y + e.height);
	}), o = (o === Infinity ? 0 : o) - 20, s = (s === Infinity ? 0 : s) - 20;
	let u = (c === -Infinity ? 800 : c - o) + 40, d = (l === -Infinity ? 600 : l - s) + 40, f = Xe(a), p = n.filter((e) => ["compartment", "complex"].includes(e.type)), m = n.filter((e) => !["compartment", "complex"].includes(e.type)), h = p.map((e) => K(e, n, a, t)).join("\n"), g = r.map((e) => {
		let t = (e) => {
			let t = n.find((t) => t.id === e);
			if (!t && e.includes(".")) {
				let r = e.split(".").slice(0, -1).join(".");
				t = n.find((e) => e.id === r);
			}
			return t;
		}, r = t(e.source), i = t(e.target);
		return r && i ? dt(e, r, i, a) : "";
	}).join("\n"), _ = m.map((e) => K(e, n, a, t)).join("\n");
	return `
    <svg xmlns="http://www.w3.org/2000/svg" 
         width="100%" height="100%" 
         viewBox="${o} ${s} ${u} ${d}">
      
      ${f}
      
      <g id="containers-layer">
        ${h}
      </g>
      
      <g id="edges-layer">
        ${g}
      </g>
      
      <g id="foreground-nodes-layer">
        ${_}
      </g>
    </svg>
  `;
}
function G(e) {
	let t = e.type || "";
	return t.includes("macromolecule") ? Ze : t.includes("simple chemical") || t.includes("metabolite") ? Qe : t.includes("complex") ? q : t.includes("nucleic acid feature") ? $e : t.includes("phenotype") ? et : t.includes("unspecified entity") ? tt : t.includes("perturbing agent") ? nt : t.includes("biological activity") ? ut : t.includes("process") || t.includes("omitted process") || t.includes("uncertain process") ? at : t.includes("association") ? ot : t.includes("dissociation") ? st : t.includes("compartment") ? it : t.includes("and") || t.includes("or") || t.includes("not") || t.includes("delay") ? ct : t.includes("tag") || t.includes("submap terminal") ? lt : t.includes("empty set") || t.includes("source and sink") ? rt : null;
}
function K(e, t, n, r) {
	let i = G(e);
	return i ? i === q ? i(e, t, n, r) : i(e, n, r) : (console.warn(`Unrecognized SBGN class type: "${e.type}". Falling back to generic node.`), ft(e));
}
function Xe(e) {
	let t = e.edge.defaultStroke, n = e.edge.inhibitionStroke;
	return `
    <defs>
      ${e.filters || ""}
      ${e.gradients || ""}
      <marker id="marker-production" markerWidth="10" markerHeight="10" refX="8.66" refY="5" orient="auto">
        <path d="M 0 0 L 8.66 5 L 0 10 Z" fill="${t}" />
      </marker>
      <marker id="marker-stimulation" markerWidth="11" markerHeight="10" refX="9.66" refY="5" orient="auto">
        <path d="M 1 0 L 9.66 5 L 1 10 Z" fill="#ffffff" stroke="${t}" stroke-width="1.5" />
      </marker>
      <marker id="marker-necessary-stimulation" markerWidth="15" markerHeight="10" refX="12.66" refY="5" orient="auto">
        <line x1="2" y1="0" x2="2" y2="10" stroke="${t}" stroke-width="1.5" />
        <path d="M 4 0 L 12.66 5 L 4 10 Z" fill="#ffffff" stroke="${t}" stroke-width="1.5" />
      </marker>
      <marker id="marker-catalysis" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
        <circle cx="6" cy="6" r="4" fill="#ffffff" stroke="${t}" stroke-width="1.5" />
      </marker>
      <marker id="marker-modulation" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto">
        <polygon points="6,0 12,6 6,12 0,6" fill="#ffffff" stroke="${t}" stroke-width="1.5" />
      </marker>
      <marker id="marker-inhibition" markerWidth="8" markerHeight="12" refX="2" refY="6" orient="auto">
        <line x1="2" y1="1" x2="2" y2="11" stroke="${n}" stroke-width="4" />
      </marker>
    </defs>
  `;
}
function Ze(e, t, n = {}) {
	let { width: r, height: i, label: a, id: o, x: s, y: c } = e, l = t.macromolecule, u = Math.max(4, Math.min(i * .25, 12)), d = n.isIcon || !1, f = d ? "" : $(a, r, i, 12, l.text, "normal");
	e.strokeColor = l.stroke;
	let p = X(e), m = Z(e), h = `
    ${p}
    <rect width="${r}" height="${i}" rx="${u}" ry="${u}"
          fill="${l.fill}" stroke="${l.stroke}" stroke-width="2" filter="url(#dropShadow)" />
    ${m}
    ${f}
    ${d ? "" : Y(e, t, n)}
  `;
	return e.link ? `
      <a xlink:href="${e.link}" target="_blank" class="node-link">
        <g class="node-group macromolecule" id="${o}" transform="translate(${s}, ${c})">
          ${h}
        </g>
      </a>
    ` : `
      <g class="node-group macromolecule" id="${o}" transform="translate(${s}, ${c})">
        ${h}
      </g>
    `;
}
function Qe(e, t, n = { isIcon: !1 }) {
	let { width: r, height: i, label: a, id: o, x: s, y: c } = e, l = i / 2, u = t.simpleChemical, d = n.isIcon ? "" : $(a, r, i, 11, u.text, "normal");
	e.strokeColor = u.stroke;
	let f = X(e), p = Z(e), m = `
    ${f}
    <rect width="${r}" height="${i}" rx="${l}" ry="${l}"
          fill="${u.fill}" stroke="${u.stroke}" stroke-width="2" filter="url(#dropShadow)" />
    ${p}
    ${d}
    ${n.isIcon ? "" : Y(e, t, n)}
  `;
	return e.link ? `
      <a xlink:href="${e.link}" target="_blank" class="node-link">
        <g class="node-group simple-chemical" id="${o}" transform="translate(${s}, ${c})">
          ${m}
        </g>
      </a>
    ` : `
      <g class="node-group simple-chemical" id="${o}" transform="translate(${s}, ${c})">
        ${m}
      </g>
    `;
}
function q(e, t, n, r = { isIcon: !1 }) {
	let { width: i, height: a, label: o, id: s, x: c, y: l } = e, u = n.complex, d = !1;
	t && Array.isArray(t) && (d = t.some((e) => e.parentId === s));
	let f = "";
	o && (f = d ? `<text x="${i / 2}" y="${a + 10}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="${u.text}">${o}</text>` : r.isIcon ? "" : $(o, i, a, 11, u.text, "bold"));
	let p = Math.min(i, a) * .15, m = `M ${p},0 L ${i - p},0 L ${i},${p} L ${i},${a - p} L ${i - p},${a} L ${p},${a} L 0,${a - p} L 0,${p} Z`;
	e.strokeColor = u.stroke;
	let h = X(e), g = Z(e), _ = `
    <g class="complex-background">
      ${h}
      <path d="${m}" fill="${u.fill}" stroke="${u.stroke}" stroke-width="2" filter="url(#dropShadow)" />
      ${g}
    </g>
    ${f}
    ${r.isIcon ? "" : Y(e, n, r)}
  `;
	return e.link ? `
      <a xlink:href="${e.link}" target="_blank" class="node-link">
        <g class="node-group complex" id="${s}" transform="translate(${c}, ${l})">
          ${_}
        </g>
      </a>
    ` : `
      <g class="node-group complex" id="${s}" transform="translate(${c}, ${l})">
        ${_}
      </g>
    `;
}
function $e(e, t, n = { isIcon: !1 }) {
	let { width: r, height: i, label: a, id: o, x: s, y: c } = e, l = Math.min(r, i) * .2, u = t.nucleicAcidFeature, d = `M 0 0 L ${r} 0 L ${r} ${i - l} Q ${r} ${i} ${r - l} ${i} L ${l} ${i} Q 0 ${i} 0 ${i - l} Z`, f = n.isIcon ? "" : $(a, r, i, 12, u.text, "normal");
	e.strokeColor = u.stroke;
	let p = X(e), m = Z(e), h = `
    ${p}
    <path d="${d}" fill="${u.fill}" stroke="${e.strokeColor}" stroke-width="2" filter="url(#dropShadow)" />
    ${m}
    ${f}
    ${n.isIcon ? "" : Y(e, t, n)}
  `;
	return e.link ? `
      <a xlink:href="${e.link}" target="_blank" class="node-link">
        <g class="node-group nucleic-acid" id="${o}" transform="translate(${s}, ${c})">
          ${h}
        </g>
      </a>
    ` : `
      <g class="node-group nucleic-acid" id="${o}" transform="translate(${s}, ${c})">
        ${h}
      </g>
    `;
}
function et(e, t, n = { isIcon: !1 }) {
	let { width: r, height: i, label: a, id: o, x: s, y: c } = e, l = r * .15, u = `0,${i / 2} ${l},0 ${r - l},0 ${r},${i / 2} ${r - l},${i} ${l},${i}`, d = t.phenotype, f = n.isIcon ? "" : $(a, r, i, 12, d.text, "normal"), p = `
    <polygon points="${u}" fill="${d.fill}" stroke="${d.stroke}"  stroke-width="2" filter="url(#dropShadow)" />
    ${f}
    ${n.isIcon ? "" : Y(e, t, n)}
  `;
	return e.link ? `
      <a xlink:href="${e.link}" target="_blank" class="node-link">
        <g class="node-group phenotype" id="${o}" transform="translate(${s}, ${c})">
          ${p}
        </g>
      </a>
    ` : `
      <g class="node-group phenotype" id="${o}" transform="translate(${s}, ${c})">
        ${p}
      </g>
    `;
}
function tt(e, t, n = { isIcon: !1 }) {
	let { width: r, height: i, label: a, id: o, x: s, y: c } = e, l = r / 2, u = i / 2, d = t.unspecifiedEntity, f = n.isIcon ? "" : $(a, r, i, 12, d.text, "normal");
	e.strokeColor = d.stroke;
	let p = Z(e), m = `
    <ellipse cx="${l}" cy="${u}" rx="${l}" ry="${u}" 
              fill="${d.fill}" stroke="${e.strokeColor}" stroke-width="2" filter="url(#dropShadow)" />
    ${p}
    ${f}
    ${n.isIcon ? "" : Y(e, t, n)}
  `;
	return e.link ? `
      <a xlink:href="${e.link}" target="_blank" class="node-link">
        <g class="node-group unspecified-entity" id="${o}" transform="translate(${s}, ${c})">
          ${m}
        </g>
      </a>
    ` : `
      <g class="node-group unspecified-entity" id="${o}" transform="translate(${s}, ${c})">
        ${m}
      </g>
    `;
}
function nt(e, t, n = { isIcon: !1 }) {
	let { width: r, height: i, label: a, id: o, x: s, y: c } = e, l = r * .15, u = `0,0 ${r},0 ${r - l},${i / 2} ${r},${i} 0,${i} ${l},${i / 2}`, d = t.perturbingAgent, f = n.isIcon ? "" : $(a, r, i, 12, d.text, "normal");
	e.strokeColor = d.stroke;
	let p = Z(e), m = `
    <polygon points="${u}" fill="${d.fill}" stroke="${e.strokeColor}" stroke-width="2" filter="url(#dropShadow)" />
    ${p}
    ${f}
    ${n.isIcon ? "" : Y(e, t, n)}
  `;
	return e.link ? `
      <a xlink:href="${e.link}" target="_blank" class="node-link">
        <g class="node-group perturbing-agent" id="${o}" transform="translate(${s}, ${c})">
          ${m}
        </g>
      </a>
    ` : `
      <g class="node-group perturbing-agent" id="${o}" transform="translate(${s}, ${c})">
        ${m}
      </g>
    `;
}
function rt(e, t) {
	let n = e.width / 2, r = e.height / 2, i = Math.min(n, r), a = t.emptySet, o = i * 1.5 * .7071;
	return `
    <g class="node-group" id="${e.id}" transform="translate(${e.x}, ${e.y})">
      <!-- Main Circle -->
      <circle cx="${n}" cy="${r}" r="${i}" fill="${a.fill}" stroke="${a.stroke}" stroke-width="2" />
      
      <!-- Extended Diagonal Line -->
      <line x1="${n + o}" y1="${r - o}" x2="${n - o}" y2="${r + o}" 
            stroke="${a.stroke}" stroke-width="2" />
      
      <!-- Normally empty sets have no label, but if one exists, render it below -->
      ${e.label ? `
        <text x="${n}" y="${r + i + 12}" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, Helvetica" font-size="10" fill="${a.fill}">
          ${e.label}
        </text>
      ` : ""}
      ${Y(e, t)}
    </g>
  `;
}
function it(e, t, n = { isIcon: !1 }) {
	let r = e.width, i = e.height, a = t.compartment, o = a.fill, s = a.stroke, c = "";
	e.label && (c = `
      <text x="${r / 2}" y="${i + 12}" 
            text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" 
            font-size="14" font-weight="bold" fill="${a.text}" >
        ${e.label}
      </text>
    `);
	let l = `
    <rect width="${r}" height="${i}" rx="20" ry="20" 
          fill="${o}" 
          stroke="${s}" stroke-width="4" />
    ${c}
    ${n.isIcon ? "" : Y(e, t, n)}
  `;
	return e.link ? `
      <a xlink:href="${e.link}" target="_blank" class="node-link">
        <g class="compartment-node" id="${e.id}" transform="translate(${e.x}, ${e.y})">
          ${l}
        </g>
      </a>
    ` : `
      <g class="compartment-node" id="${e.id}" transform="translate(${e.x}, ${e.y})">
        ${l}
      </g>
    `;
}
function at(e, t) {
	let n = e.width, r = e.height, i = n / 2, a = r / 2, o = t.process, s = "", c = o.stroke, l = o.fill;
	switch (e.type) {
		case "omitted process":
			let e = n * .2;
			s = `
        <line x1="${e}" y1="${e}" x2="${n - e}" y2="${r - e}" 
              stroke="${c}" stroke-width="1.5" />
        <line x1="${e + 4}" y1="${e}" x2="${n - e + 4}" y2="${r - e}" 
              stroke="${c}" stroke-width="1.5" />
      `;
			break;
		case "uncertain process":
			s = `
        <text x="${i}" y="${a}" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, Helvetica, sans-serif" font-size="${r * .8}" 
              font-weight="bold" fill="${c}">?</text>
      `;
			break;
		default:
			s = "";
			break;
	}
	return `
    <!-- Process Hub: ${e.id} (${e.type}) -->
    <g class="process-node" id="${e.id}" transform="translate(${e.x}, ${e.y})">
      <rect width="${n}" height="${r}" fill="${l}" stroke="${c}" stroke-width="1.5" />
      ${s}
      
      <!-- Optional label positioning (usually processes don't have prominent labels) -->
      ${e.label ? `
        <text x="${i}" y="${r + 12}" text-anchor="middle" dominant-baseline="auto" 
              font-family="Arial, Helvetica" font-size="10" fill="${o.text}">
          ${e.label}
        </text>
      ` : ""}
    </g>
  `;
}
function ot(e, t) {
	let n = e.width / 2, r = e.height / 2, i = Math.min(n, r), a = t.association;
	return `
    <!-- Association Hub: ${e.id} -->
    <g class="association-node" id="${e.id}" transform="translate(${e.x}, ${e.y})">
      <circle cx="${n}" cy="${r}" r="${i}" fill="${a.fill}" stroke="${a.stroke}" stroke-width="1" />
    </g>
  `;
}
function st(e, t) {
	let n = e.width / 2, r = e.height / 2, i = Math.min(n, r), a = i * .6, o = t.dissociation;
	return `
    <!-- Dissociation Hub: ${e.id} -->
    <g class="dissociation-node" id="${e.id}" transform="translate(${e.x}, ${e.y})">
      <circle cx="${n}" cy="${r}" r="${i}" fill="${o.fill}" stroke="${o.stroke}" stroke-width="1.5" />
      <circle cx="${n}" cy="${r}" r="${a}" fill="${o.fill}" stroke="${o.stroke}" stroke-width="1.5" />
    </g>
  `;
}
function ct(e, t) {
	let { width: n, height: r, id: i, x: a, y: o } = e, s = n / 2, c = r / 2, l = Math.min(n, r) / 2, u = t.logicalOperator, d = "";
	if (e.type.includes("delay")) d = `
      <text x="${s}" y="${c}" text-anchor="middle" dominant-baseline="central"
            font-family="Georgia, 'Times New Roman', serif" font-size="${l * 1.5}" fill="${u.text}">τ</text>
    `;
	else {
		let t = e.type.toUpperCase();
		d = `
      <text x="${s}" y="${c}" text-anchor="middle" dominant-baseline="central"
            font-family="Arial, Helvetica, sans-serif" font-size="${l * .8}" font-weight="bold" fill="${u.text}">
        ${t}
      </text>
    `;
	}
	return `
    <g class="logic-operator-node" id="${i}" transform="translate(${a}, ${o})">
      <circle cx="${s}" cy="${c}" r="${l}" fill="${u.fill}" stroke="${u.stroke}" stroke-width="1.5" />
      ${d}
    </g>
  `;
}
function lt(e) {
	let t = e.width, n = e.height, r = `M 0 0 L ${t - 15} 0 L ${t} ${n / 2} L ${t - 15} ${n} L 0 ${n} Z`;
	return `
    <g class="tag-node" id="${e.id}" transform="translate(${e.x}, ${e.y})">
      <path d="${r}" fill="#ffffff" stroke="#555555" stroke-width="1.5" filter="url(#dropShadow)" />
      
      <!-- Center the text slightly to the left to account for the pointed end -->
      <text x="${(t - 15) / 2}" y="${n / 2}" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#333333">
        ${e.label}
      </text>
    </g>
  `;
}
function ut(e, t, n = { isIcon: !1 }) {
	let { width: r, height: i, label: a, id: o, x: s, y: c } = e, l = t.biologicalActivity || t.macromolecule, u = n.isIcon ? "" : $(a, r, i, 12, l.text, "normal");
	e.strokeColor = l.stroke;
	let d = X(e), f = Z(e), p = `
    ${d}
    <rect width="${r}" height="${i}" rx="0" ry="0"
          fill="${l.fill}" stroke="${l.stroke}" stroke-width="2" filter="url(#dropShadow)" />
    ${f}
    ${u}
    ${n.isIcon ? "" : Y(e, t, n)}
  `;
	return e.link ? `
      <a xlink:href="${e.link}" target="_blank" class="node-link">
        <g class="node-group biological-activity" id="${o}" transform="translate(${s}, ${c})">
          ${p}
        </g>
      </a>
    ` : `
      <g class="node-group biological-activity" id="${o}" transform="translate(${s}, ${c})">
        ${p}
      </g>
    `;
}
function J(e) {
	if (!e) return "macromolecule";
	let t = e.split(" ");
	return t.length === 1 ? t[0] : t[0] + t.slice(1).map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join("");
}
function Y(e, t, n = {}) {
	let r = [], i = t.stateVariable, a = t.unitOfInformation;
	return e.stateVariables && e.stateVariables.length > 0 && e.stateVariables.forEach((t) => {
		let n = t.x - e.x, a = t.y - e.y, o = t.variable ? t.variable : t.value ? t.value : "", s = `
        <g class="state-variable" id="${t.id}" transform="translate(${n}, ${a})">
          <rect width="${t.width}" height="${t.height}" rx="8" ry="8" 
                fill="${i.fill}" stroke="${i.stroke}" stroke-width="1.2" />
          <text x="${t.width / 2}" y="${t.height / 2}" 
                text-anchor="middle" dominant-baseline="central" 
                font-family="Arial, Helvetica, sans-serif" font-size="10" 
                font-weight="bold" fill="${i.text}">
            ${o}
          </text>
        </g>
      `;
		r.push(s);
	}), e.unitsOfInformation && e.unitsOfInformation.length > 0 && e.unitsOfInformation.forEach((i) => {
		let o = i.x - e.x, s = i.y - e.y, c = "";
		if (i.entityName) {
			let r = {
				id: `icon_${i.id}`,
				type: i.entityName,
				x: 0,
				y: 0,
				width: i.width,
				height: i.height,
				label: ""
			}, a = G(r);
			if (a) {
				let l;
				l = n.useParentThemeForIcons ? J(e.type) : J(i.entityName);
				let u = t[l] || t.macromolecule, d = {
					...t,
					[J(i.entityName)]: u
				}, f = "";
				f = a === q ? a(r, null, d, { isIcon: !0 }) : a(r, d, { isIcon: !0 }), c = `
                <g class="unit-of-information-icon" id="${i.id}" transform="translate(${o}, ${s})">
                    ${f}
                </g>
            `;
			}
		}
		c ||= `
          <g class="unit-of-information" id="${i.id}" transform="translate(${o}, ${s})">
            <rect width="${i.width}" height="${i.height}" rx="0" ry="0" 
                  fill="${a.fill}" stroke="${a.stroke}" stroke-width="1" />
            <text x="${i.width / 2}" y="${i.height / 2}" 
                  text-anchor="middle" dominant-baseline="central" 
                  font-family="Arial, Helvetica, sans-serif" font-size="9" 
                  fill="${a.text}">
              ${i.label}
            </text>
          </g>
        `, r.push(c);
	}), r.join("\n");
}
function X(e) {
	if (!e.isMultimer) return "";
	let t = e.strokeColor || W.cool.multimerMarker.fallbackStroke, n = e.type || "", r = "";
	if (n.includes("complex")) {
		let t = Math.min(e.width, e.height) * .15;
		r = `<path d="M ${t},0 L ${e.width - t},0 L ${e.width},${t} L ${e.width},${e.height - t} L ${e.width - t},${e.height} L ${t},${e.height} L 0,${e.height - t} L 0,${t} Z" />`;
	} else if (n.includes("simple chemical")) {
		let t = e.height / 2;
		r = `<rect width="${e.width}" height="${e.height}" rx="${t}" ry="${t}" />`;
	} else r = `<rect width="${e.width}" height="${e.height}" rx="8" ry="8" />`;
	let i = "";
	return e.isClone && (i = Z(e)), `
    <g class="multimer-marker" transform="translate(6, 6)">
      <!-- Önce klon dolgusunu çiz (altta kalacak) -->
      ${i}
      <!-- Sonra kenarlığı üzerine çiz (daha net görünür) -->
      <g fill="none" stroke="${t}" stroke-width="1.5">
        ${r}
      </g>
    </g>
  `;
}
function Z(e) {
	if (!e.isClone) return "";
	let { width: t, height: n } = e, r = e.type || "", i = n - (r.includes("complex") ? n * .2 : n * .3), a = .5, o = W.cool.cloneMarker.fill, s = "";
	if (r.includes("complex")) {
		let e = Math.min(t, n) * .15;
		s = `
      <path d="M ${a} ${i} L ${t - a} ${i} L ${t - a} ${n - e} L ${t - e} ${n - a} L ${e} ${n - a} L ${a} ${n - e} Z" />
    `;
	} else if (r.includes("simple chemical")) {
		let e = n / 2;
		s = `
      <path d="M ${a} ${i} L ${t - a} ${i} L ${t - a} ${n - e} A ${e - a} ${e - a} 0 0 1 ${t - e - a} ${n - a} L ${e + a} ${n - a} A ${e - a} ${e - a} 0 0 1 ${a} ${n - e} Z" />
    `;
	} else s = `
      <path d="M ${a} ${i} L ${t - a} ${i} L ${t - a} ${n - 8} Q ${t - a} ${n - a} ${t - a - 8} ${n - a} L ${8 + a} ${n - a} Q ${a} ${n - a} ${a} ${n - 8} Z" />
    `;
	return `<g class="clone-marker" fill="${o}" stroke="none">${s}</g>`;
}
function dt(e, t, n, r) {
	let i = Q(n, t), a = Q(t, n), o = i.x, s = i.y, c = a.x, l = a.y, u = r.edge, d = "none", f = u.defaultStroke, p = "1.5";
	switch (e.type) {
		case "consumption":
			d = "none";
			break;
		case "production":
			d = "url(#marker-production)";
			break;
		case "modulation":
			d = "url(#marker-modulation)";
			break;
		case "unknown influence":
			d = "url(#marker-modulation)";
			break;
		case "stimulation":
			d = "url(#marker-stimulation)";
			break;
		case "positive influence":
			d = "url(#marker-stimulation)";
			break;
		case "catalysis":
			d = "url(#marker-catalysis)";
			break;
		case "inhibition":
		case "negative influence":
			d = "url(#marker-inhibition)", f = u.inhibitionStroke;
			let e = Math.atan2(l - s, c - o);
			c -= Math.cos(e) * 2, l -= Math.sin(e) * 2;
			break;
		case "necessary stimulation":
			d = "url(#marker-necessary-stimulation)";
			break;
		case "logic arc":
			p = "1";
			break;
		case "equivalence arc":
			f = u.equivalenceStroke;
			break;
		default: break;
	}
	return `
    <line id="${e.id}" class="arc ${e.type.replace(" ", "-")}"
          x1="${o}" y1="${s}" x2="${c}" y2="${l}"
          stroke="${f}" 
          stroke-width="${p}" 
          stroke-dasharray="none"
          marker-end="${d}" />
  `;
}
function ft(e) {
	return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="none" stroke="red" />`;
}
function Q(e, t) {
	let n = e.x + e.width / 2, r = e.y + e.height / 2, i = t.x + t.width / 2, a = t.y + t.height / 2, o = t.type;
	return [
		"simple chemical",
		"unspecified entity",
		"phenotype",
		"association",
		"dissociation",
		"and",
		"or",
		"not"
	].includes(o) ? pt(n, r, i, a, t.width / 2, t.height / 2) : mt(n, r, i, a, t.width, t.height);
}
function pt(e, t, n, r, i, a) {
	let o = e - n, s = t - r;
	if (o === 0 && s === 0) return {
		x: n,
		y: r
	};
	let c = Math.atan2(s, o);
	return {
		x: n + i * Math.cos(c),
		y: r + a * Math.sin(c)
	};
}
function mt(e, t, n, r, i, a) {
	let o = e - n, s = t - r;
	if (o === 0 && s === 0) return {
		x: n,
		y: r
	};
	let c = i / 2, l = a / 2, u = c / Math.abs(o), d = l / Math.abs(s), f = Math.min(u, d);
	return {
		x: n + o * f,
		y: r + s * f
	};
}
function $(e, t, n, r, i, a = "bold") {
	if (!e) return "";
	let o = t - 10, s = .6, c = e.split(/\n|&#xA;/), l = [];
	c.forEach((e) => {
		let t = e.split(/\s+/), n = "";
		t.forEach((e) => {
			let t = n ? n + " " + e : e;
			t.length * r * s > o && n !== "" ? (l.push(n), n = e) : n = t;
		}), n && l.push(n);
	});
	let u = Math.max(...l.map((e) => e.length)) * r * s, d = 1;
	u > o && (d = o / u);
	let f = l.length * (r * 1.2), p = n - 10, m = 1;
	f > p && (m = p / f);
	let h = Math.max(r * Math.min(d, m, 1), 8), g = h * 1.2, _ = n / 2 - (l.length - 1) * g / 2, v = `<text x="${t / 2}" y="${_}" 
                      text-anchor="middle" dominant-baseline="central" 
                      font-family="Arial, Helvetica, sans-serif" 
                      font-size="${h.toFixed(1)}" 
                      font-weight="${a}" fill="${i}">`;
	return l.forEach((e, n) => {
		let r = n === 0 ? 0 : g;
		v += `<tspan x="${t / 2}" dy="${r}">${e}</tspan>`;
	}), v += "</text>", v;
}
//#endregion
//#region src/index.js
function ht(e, t = {}) {
	try {
		let n = Je(e);
		return t.debug && console.log("Successfully parsed graph data:", n), Ye(n, t);
	} catch (e) {
		throw console.error("Error generating SBGN figure:", e.message), e;
	}
}
//#endregion
export { ht as generate };
