
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Header.svelte generated by Svelte v3.22.2 */

    const file = "src\\components\\Header.svelte";

    function create_fragment(ctx) {
    	let header;
    	let h3;
    	let t1;
    	let h4;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h3 = element("h3");
    			h3.textContent = "Welcome to Turnip Profit Calculator";
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = "When you need your profits calculated quicker than you can say \"There isn't much news for me to announce today\"";
    			attr_dev(h3, "class", "uk-heading-medium");
    			add_location(h3, file, 1, 1, 69);
    			attr_dev(h4, "class", "uk-margin-remove");
    			add_location(h4, file, 2, 1, 142);
    			attr_dev(header, "class", "uk-text-center header-background uk-padding-small svelte-9c5ipk");
    			add_location(header, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h3);
    			append_dev(header, t1);
    			append_dev(header, h4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\components\Display.svelte generated by Svelte v3.22.2 */

    const file$1 = "src\\components\\Display.svelte";

    // (8:1) {:else}
    function create_else_block(ctx) {
    	let p0;
    	let b0;
    	let t1;
    	let t2_value = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(/*calc*/ ctx[0].totalSellPrice) + "";
    	let t2;
    	let t3;
    	let p1;
    	let b1;
    	let t5;
    	let t6_value = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(/*calc*/ ctx[0].netGain) + "";
    	let t6;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			b0 = element("b");
    			b0.textContent = "Total Sell Price:";
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			p1 = element("p");
    			b1 = element("b");
    			b1.textContent = "Net Profit:";
    			t5 = space();
    			t6 = text(t6_value);
    			add_location(b0, file$1, 8, 5, 253);
    			add_location(p0, file$1, 8, 2, 250);
    			add_location(b1, file$1, 9, 5, 388);
    			add_location(p1, file$1, 9, 2, 385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, b0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, b1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*calc*/ 1 && t2_value !== (t2_value = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(/*calc*/ ctx[0].totalSellPrice) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*calc*/ 1 && t6_value !== (t6_value = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(/*calc*/ ctx[0].netGain) + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(8:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (6:1) {#if (calc.totalSellPrice === null && calc.netGain === null)}
    function create_if_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Please enter required information below";
    			add_location(p, file$1, 6, 2, 190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(6:1) {#if (calc.totalSellPrice === null && calc.netGain === null)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*calc*/ ctx[0].totalSellPrice === null && /*calc*/ ctx[0].netGain === null) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "uk-card uk-card-body uk-text-center display uk-margin-bottom svelte-9d56cy");
    			add_location(div, file$1, 4, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { calc = null } = $$props;
    	const writable_props = ["calc"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Display> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Display", $$slots, []);

    	$$self.$set = $$props => {
    		if ("calc" in $$props) $$invalidate(0, calc = $$props.calc);
    	};

    	$$self.$capture_state = () => ({ calc });

    	$$self.$inject_state = $$props => {
    		if ("calc" in $$props) $$invalidate(0, calc = $$props.calc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [calc];
    }

    class Display extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { calc: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Display",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get calc() {
    		throw new Error("<Display>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set calc(value) {
    		throw new Error("<Display>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var NumeralFormatter = function (numeralDecimalMark,
                                     numeralIntegerScale,
                                     numeralDecimalScale,
                                     numeralThousandsGroupStyle,
                                     numeralPositiveOnly,
                                     stripLeadingZeroes,
                                     prefix,
                                     signBeforePrefix,
                                     tailPrefix,
                                     delimiter) {
        var owner = this;

        owner.numeralDecimalMark = numeralDecimalMark || '.';
        owner.numeralIntegerScale = numeralIntegerScale > 0 ? numeralIntegerScale : 0;
        owner.numeralDecimalScale = numeralDecimalScale >= 0 ? numeralDecimalScale : 2;
        owner.numeralThousandsGroupStyle = numeralThousandsGroupStyle || NumeralFormatter.groupStyle.thousand;
        owner.numeralPositiveOnly = !!numeralPositiveOnly;
        owner.stripLeadingZeroes = stripLeadingZeroes !== false;
        owner.prefix = (prefix || prefix === '') ? prefix : '';
        owner.signBeforePrefix = !!signBeforePrefix;
        owner.tailPrefix = !!tailPrefix;
        owner.delimiter = (delimiter || delimiter === '') ? delimiter : ',';
        owner.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';
    };

    NumeralFormatter.groupStyle = {
        thousand: 'thousand',
        lakh:     'lakh',
        wan:      'wan',
        none:     'none'    
    };

    NumeralFormatter.prototype = {
        getRawValue: function (value) {
            return value.replace(this.delimiterRE, '').replace(this.numeralDecimalMark, '.');
        },

        format: function (value) {
            var owner = this, parts, partSign, partSignAndPrefix, partInteger, partDecimal = '';

            // strip alphabet letters
            value = value.replace(/[A-Za-z]/g, '')
                // replace the first decimal mark with reserved placeholder
                .replace(owner.numeralDecimalMark, 'M')

                // strip non numeric letters except minus and "M"
                // this is to ensure prefix has been stripped
                .replace(/[^\dM-]/g, '')

                // replace the leading minus with reserved placeholder
                .replace(/^\-/, 'N')

                // strip the other minus sign (if present)
                .replace(/\-/g, '')

                // replace the minus sign (if present)
                .replace('N', owner.numeralPositiveOnly ? '' : '-')

                // replace decimal mark
                .replace('M', owner.numeralDecimalMark);

            // strip any leading zeros
            if (owner.stripLeadingZeroes) {
                value = value.replace(/^(-)?0+(?=\d)/, '$1');
            }

            partSign = value.slice(0, 1) === '-' ? '-' : '';
            if (typeof owner.prefix != 'undefined') {
                if (owner.signBeforePrefix) {
                    partSignAndPrefix = partSign + owner.prefix;
                } else {
                    partSignAndPrefix = owner.prefix + partSign;
                }
            } else {
                partSignAndPrefix = partSign;
            }
            
            partInteger = value;

            if (value.indexOf(owner.numeralDecimalMark) >= 0) {
                parts = value.split(owner.numeralDecimalMark);
                partInteger = parts[0];
                partDecimal = owner.numeralDecimalMark + parts[1].slice(0, owner.numeralDecimalScale);
            }

            if(partSign === '-') {
                partInteger = partInteger.slice(1);
            }

            if (owner.numeralIntegerScale > 0) {
              partInteger = partInteger.slice(0, owner.numeralIntegerScale);
            }

            switch (owner.numeralThousandsGroupStyle) {
            case NumeralFormatter.groupStyle.lakh:
                partInteger = partInteger.replace(/(\d)(?=(\d\d)+\d$)/g, '$1' + owner.delimiter);

                break;

            case NumeralFormatter.groupStyle.wan:
                partInteger = partInteger.replace(/(\d)(?=(\d{4})+$)/g, '$1' + owner.delimiter);

                break;

            case NumeralFormatter.groupStyle.thousand:
                partInteger = partInteger.replace(/(\d)(?=(\d{3})+$)/g, '$1' + owner.delimiter);

                break;
            }

            if (owner.tailPrefix) {
                return partSign + partInteger.toString() + (owner.numeralDecimalScale > 0 ? partDecimal.toString() : '') + owner.prefix;
            }

            return partSignAndPrefix + partInteger.toString() + (owner.numeralDecimalScale > 0 ? partDecimal.toString() : '');
        }
    };

    var NumeralFormatter_1 = NumeralFormatter;

    var DateFormatter = function (datePattern, dateMin, dateMax) {
        var owner = this;

        owner.date = [];
        owner.blocks = [];
        owner.datePattern = datePattern;
        owner.dateMin = dateMin
          .split('-')
          .reverse()
          .map(function(x) {
            return parseInt(x, 10);
          });
        if (owner.dateMin.length === 2) owner.dateMin.unshift(0);

        owner.dateMax = dateMax
          .split('-')
          .reverse()
          .map(function(x) {
            return parseInt(x, 10);
          });
        if (owner.dateMax.length === 2) owner.dateMax.unshift(0);
        
        owner.initBlocks();
    };

    DateFormatter.prototype = {
        initBlocks: function () {
            var owner = this;
            owner.datePattern.forEach(function (value) {
                if (value === 'Y') {
                    owner.blocks.push(4);
                } else {
                    owner.blocks.push(2);
                }
            });
        },

        getISOFormatDate: function () {
            var owner = this,
                date = owner.date;

            return date[2] ? (
                date[2] + '-' + owner.addLeadingZero(date[1]) + '-' + owner.addLeadingZero(date[0])
            ) : '';
        },

        getBlocks: function () {
            return this.blocks;
        },

        getValidatedDate: function (value) {
            var owner = this, result = '';

            value = value.replace(/[^\d]/g, '');

            owner.blocks.forEach(function (length, index) {
                if (value.length > 0) {
                    var sub = value.slice(0, length),
                        sub0 = sub.slice(0, 1),
                        rest = value.slice(length);

                    switch (owner.datePattern[index]) {
                    case 'd':
                        if (sub === '00') {
                            sub = '01';
                        } else if (parseInt(sub0, 10) > 3) {
                            sub = '0' + sub0;
                        } else if (parseInt(sub, 10) > 31) {
                            sub = '31';
                        }

                        break;

                    case 'm':
                        if (sub === '00') {
                            sub = '01';
                        } else if (parseInt(sub0, 10) > 1) {
                            sub = '0' + sub0;
                        } else if (parseInt(sub, 10) > 12) {
                            sub = '12';
                        }

                        break;
                    }

                    result += sub;

                    // update remaining string
                    value = rest;
                }
            });

            return this.getFixedDateString(result);
        },

        getFixedDateString: function (value) {
            var owner = this, datePattern = owner.datePattern, date = [],
                dayIndex = 0, monthIndex = 0, yearIndex = 0,
                dayStartIndex = 0, monthStartIndex = 0, yearStartIndex = 0,
                day, month, year, fullYearDone = false;

            // mm-dd || dd-mm
            if (value.length === 4 && datePattern[0].toLowerCase() !== 'y' && datePattern[1].toLowerCase() !== 'y') {
                dayStartIndex = datePattern[0] === 'd' ? 0 : 2;
                monthStartIndex = 2 - dayStartIndex;
                day = parseInt(value.slice(dayStartIndex, dayStartIndex + 2), 10);
                month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);

                date = this.getFixedDate(day, month, 0);
            }

            // yyyy-mm-dd || yyyy-dd-mm || mm-dd-yyyy || dd-mm-yyyy || dd-yyyy-mm || mm-yyyy-dd
            if (value.length === 8) {
                datePattern.forEach(function (type, index) {
                    switch (type) {
                    case 'd':
                        dayIndex = index;
                        break;
                    case 'm':
                        monthIndex = index;
                        break;
                    default:
                        yearIndex = index;
                        break;
                    }
                });

                yearStartIndex = yearIndex * 2;
                dayStartIndex = (dayIndex <= yearIndex) ? dayIndex * 2 : (dayIndex * 2 + 2);
                monthStartIndex = (monthIndex <= yearIndex) ? monthIndex * 2 : (monthIndex * 2 + 2);

                day = parseInt(value.slice(dayStartIndex, dayStartIndex + 2), 10);
                month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
                year = parseInt(value.slice(yearStartIndex, yearStartIndex + 4), 10);

                fullYearDone = value.slice(yearStartIndex, yearStartIndex + 4).length === 4;

                date = this.getFixedDate(day, month, year);
            }

            // mm-yy || yy-mm
            if (value.length === 4 && (datePattern[0] === 'y' || datePattern[1] === 'y')) {
                monthStartIndex = datePattern[0] === 'm' ? 0 : 2;
                yearStartIndex = 2 - monthStartIndex;
                month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
                year = parseInt(value.slice(yearStartIndex, yearStartIndex + 2), 10);

                fullYearDone = value.slice(yearStartIndex, yearStartIndex + 2).length === 2;

                date = [0, month, year];
            }

            // mm-yyyy || yyyy-mm
            if (value.length === 6 && (datePattern[0] === 'Y' || datePattern[1] === 'Y')) {
                monthStartIndex = datePattern[0] === 'm' ? 0 : 4;
                yearStartIndex = 2 - 0.5 * monthStartIndex;
                month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
                year = parseInt(value.slice(yearStartIndex, yearStartIndex + 4), 10);

                fullYearDone = value.slice(yearStartIndex, yearStartIndex + 4).length === 4;

                date = [0, month, year];
            }

            date = owner.getRangeFixedDate(date);
            owner.date = date;

            var result = date.length === 0 ? value : datePattern.reduce(function (previous, current) {
                switch (current) {
                case 'd':
                    return previous + (date[0] === 0 ? '' : owner.addLeadingZero(date[0]));
                case 'm':
                    return previous + (date[1] === 0 ? '' : owner.addLeadingZero(date[1]));
                case 'y':
                    return previous + (fullYearDone ? owner.addLeadingZeroForYear(date[2], false) : '');
                case 'Y':
                    return previous + (fullYearDone ? owner.addLeadingZeroForYear(date[2], true) : '');
                }
            }, '');

            return result;
        },

        getRangeFixedDate: function (date) {
            var owner = this,
                datePattern = owner.datePattern,
                dateMin = owner.dateMin || [],
                dateMax = owner.dateMax || [];

            if (!date.length || (dateMin.length < 3 && dateMax.length < 3)) return date;

            if (
              datePattern.find(function(x) {
                return x.toLowerCase() === 'y';
              }) &&
              date[2] === 0
            ) return date;

            if (dateMax.length && (dateMax[2] < date[2] || (
              dateMax[2] === date[2] && (dateMax[1] < date[1] || (
                dateMax[1] === date[1] && dateMax[0] < date[0]
              ))
            ))) return dateMax;

            if (dateMin.length && (dateMin[2] > date[2] || (
              dateMin[2] === date[2] && (dateMin[1] > date[1] || (
                dateMin[1] === date[1] && dateMin[0] > date[0]
              ))
            ))) return dateMin;

            return date;
        },

        getFixedDate: function (day, month, year) {
            day = Math.min(day, 31);
            month = Math.min(month, 12);
            year = parseInt((year || 0), 10);

            if ((month < 7 && month % 2 === 0) || (month > 8 && month % 2 === 1)) {
                day = Math.min(day, month === 2 ? (this.isLeapYear(year) ? 29 : 28) : 30);
            }

            return [day, month, year];
        },

        isLeapYear: function (year) {
            return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
        },

        addLeadingZero: function (number) {
            return (number < 10 ? '0' : '') + number;
        },

        addLeadingZeroForYear: function (number, fullYearMode) {
            if (fullYearMode) {
                return (number < 10 ? '000' : (number < 100 ? '00' : (number < 1000 ? '0' : ''))) + number;
            }

            return (number < 10 ? '0' : '') + number;
        }
    };

    var DateFormatter_1 = DateFormatter;

    var TimeFormatter = function (timePattern, timeFormat) {
        var owner = this;

        owner.time = [];
        owner.blocks = [];
        owner.timePattern = timePattern;
        owner.timeFormat = timeFormat;
        owner.initBlocks();
    };

    TimeFormatter.prototype = {
        initBlocks: function () {
            var owner = this;
            owner.timePattern.forEach(function () {
                owner.blocks.push(2);
            });
        },

        getISOFormatTime: function () {
            var owner = this,
                time = owner.time;

            return time[2] ? (
                owner.addLeadingZero(time[0]) + ':' + owner.addLeadingZero(time[1]) + ':' + owner.addLeadingZero(time[2])
            ) : '';
        },

        getBlocks: function () {
            return this.blocks;
        },

        getTimeFormatOptions: function () {
            var owner = this;
            if (String(owner.timeFormat) === '12') {
                return {
                    maxHourFirstDigit: 1,
                    maxHours: 12,
                    maxMinutesFirstDigit: 5,
                    maxMinutes: 60
                };
            }

            return {
                maxHourFirstDigit: 2,
                maxHours: 23,
                maxMinutesFirstDigit: 5,
                maxMinutes: 60
            };
        },

        getValidatedTime: function (value) {
            var owner = this, result = '';

            value = value.replace(/[^\d]/g, '');

            var timeFormatOptions = owner.getTimeFormatOptions();

            owner.blocks.forEach(function (length, index) {
                if (value.length > 0) {
                    var sub = value.slice(0, length),
                        sub0 = sub.slice(0, 1),
                        rest = value.slice(length);

                    switch (owner.timePattern[index]) {

                    case 'h':
                        if (parseInt(sub0, 10) > timeFormatOptions.maxHourFirstDigit) {
                            sub = '0' + sub0;
                        } else if (parseInt(sub, 10) > timeFormatOptions.maxHours) {
                            sub = timeFormatOptions.maxHours + '';
                        }

                        break;

                    case 'm':
                    case 's':
                        if (parseInt(sub0, 10) > timeFormatOptions.maxMinutesFirstDigit) {
                            sub = '0' + sub0;
                        } else if (parseInt(sub, 10) > timeFormatOptions.maxMinutes) {
                            sub = timeFormatOptions.maxMinutes + '';
                        }
                        break;
                    }

                    result += sub;

                    // update remaining string
                    value = rest;
                }
            });

            return this.getFixedTimeString(result);
        },

        getFixedTimeString: function (value) {
            var owner = this, timePattern = owner.timePattern, time = [],
                secondIndex = 0, minuteIndex = 0, hourIndex = 0,
                secondStartIndex = 0, minuteStartIndex = 0, hourStartIndex = 0,
                second, minute, hour;

            if (value.length === 6) {
                timePattern.forEach(function (type, index) {
                    switch (type) {
                    case 's':
                        secondIndex = index * 2;
                        break;
                    case 'm':
                        minuteIndex = index * 2;
                        break;
                    case 'h':
                        hourIndex = index * 2;
                        break;
                    }
                });

                hourStartIndex = hourIndex;
                minuteStartIndex = minuteIndex;
                secondStartIndex = secondIndex;

                second = parseInt(value.slice(secondStartIndex, secondStartIndex + 2), 10);
                minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);
                hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);

                time = this.getFixedTime(hour, minute, second);
            }

            if (value.length === 4 && owner.timePattern.indexOf('s') < 0) {
                timePattern.forEach(function (type, index) {
                    switch (type) {
                    case 'm':
                        minuteIndex = index * 2;
                        break;
                    case 'h':
                        hourIndex = index * 2;
                        break;
                    }
                });

                hourStartIndex = hourIndex;
                minuteStartIndex = minuteIndex;

                second = 0;
                minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);
                hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);

                time = this.getFixedTime(hour, minute, second);
            }

            owner.time = time;

            return time.length === 0 ? value : timePattern.reduce(function (previous, current) {
                switch (current) {
                case 's':
                    return previous + owner.addLeadingZero(time[2]);
                case 'm':
                    return previous + owner.addLeadingZero(time[1]);
                case 'h':
                    return previous + owner.addLeadingZero(time[0]);
                }
            }, '');
        },

        getFixedTime: function (hour, minute, second) {
            second = Math.min(parseInt(second || 0, 10), 60);
            minute = Math.min(minute, 60);
            hour = Math.min(hour, 60);

            return [hour, minute, second];
        },

        addLeadingZero: function (number) {
            return (number < 10 ? '0' : '') + number;
        }
    };

    var TimeFormatter_1 = TimeFormatter;

    var PhoneFormatter = function (formatter, delimiter) {
        var owner = this;

        owner.delimiter = (delimiter || delimiter === '') ? delimiter : ' ';
        owner.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';

        owner.formatter = formatter;
    };

    PhoneFormatter.prototype = {
        setFormatter: function (formatter) {
            this.formatter = formatter;
        },

        format: function (phoneNumber) {
            var owner = this;

            owner.formatter.clear();

            // only keep number and +
            phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

            // strip non-leading +
            phoneNumber = phoneNumber.replace(/^\+/, 'B').replace(/\+/g, '').replace('B', '+');

            // strip delimiter
            phoneNumber = phoneNumber.replace(owner.delimiterRE, '');

            var result = '', current, validated = false;

            for (var i = 0, iMax = phoneNumber.length; i < iMax; i++) {
                current = owner.formatter.inputDigit(phoneNumber.charAt(i));

                // has ()- or space inside
                if (/[\s()-]/g.test(current)) {
                    result = current;

                    validated = true;
                } else {
                    if (!validated) {
                        result = current;
                    }
                    // else: over length input
                    // it turns to invalid number again
                }
            }

            // strip ()
            // e.g. US: 7161234567 returns (716) 123-4567
            result = result.replace(/[()]/g, '');
            // replace library delimiter with user customized delimiter
            result = result.replace(/[\s-]/g, owner.delimiter);

            return result;
        }
    };

    var PhoneFormatter_1 = PhoneFormatter;

    var CreditCardDetector = {
        blocks: {
            uatp:          [4, 5, 6],
            amex:          [4, 6, 5],
            diners:        [4, 6, 4],
            discover:      [4, 4, 4, 4],
            mastercard:    [4, 4, 4, 4],
            dankort:       [4, 4, 4, 4],
            instapayment:  [4, 4, 4, 4],
            jcb15:         [4, 6, 5],
            jcb:           [4, 4, 4, 4],
            maestro:       [4, 4, 4, 4],
            visa:          [4, 4, 4, 4],
            mir:           [4, 4, 4, 4],
            unionPay:      [4, 4, 4, 4],
            general:       [4, 4, 4, 4]
        },

        re: {
            // starts with 1; 15 digits, not starts with 1800 (jcb card)
            uatp: /^(?!1800)1\d{0,14}/,

            // starts with 34/37; 15 digits
            amex: /^3[47]\d{0,13}/,

            // starts with 6011/65/644-649; 16 digits
            discover: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/,

            // starts with 300-305/309 or 36/38/39; 14 digits
            diners: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,

            // starts with 51-55/2221–2720; 16 digits
            mastercard: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,

            // starts with 5019/4175/4571; 16 digits
            dankort: /^(5019|4175|4571)\d{0,12}/,

            // starts with 637-639; 16 digits
            instapayment: /^63[7-9]\d{0,13}/,

            // starts with 2131/1800; 15 digits
            jcb15: /^(?:2131|1800)\d{0,11}/,

            // starts with 2131/1800/35; 16 digits
            jcb: /^(?:35\d{0,2})\d{0,12}/,

            // starts with 50/56-58/6304/67; 16 digits
            maestro: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,

            // starts with 22; 16 digits
            mir: /^220[0-4]\d{0,12}/,

            // starts with 4; 16 digits
            visa: /^4\d{0,15}/,

            // starts with 62/81; 16 digits
            unionPay: /^(62|81)\d{0,14}/
        },

        getStrictBlocks: function (block) {
          var total = block.reduce(function (prev, current) {
            return prev + current;
          }, 0);

          return block.concat(19 - total);
        },

        getInfo: function (value, strictMode) {
            var blocks = CreditCardDetector.blocks,
                re = CreditCardDetector.re;

            // Some credit card can have up to 19 digits number.
            // Set strictMode to true will remove the 16 max-length restrain,
            // however, I never found any website validate card number like
            // this, hence probably you don't want to enable this option.
            strictMode = !!strictMode;

            for (var key in re) {
                if (re[key].test(value)) {
                    var matchedBlocks = blocks[key];
                    return {
                        type: key,
                        blocks: strictMode ? this.getStrictBlocks(matchedBlocks) : matchedBlocks
                    };
                }
            }

            return {
                type: 'unknown',
                blocks: strictMode ? this.getStrictBlocks(blocks.general) : blocks.general
            };
        }
    };

    var CreditCardDetector_1 = CreditCardDetector;

    var Util = {
        noop: function () {
        },

        strip: function (value, re) {
            return value.replace(re, '');
        },

        getPostDelimiter: function (value, delimiter, delimiters) {
            // single delimiter
            if (delimiters.length === 0) {
                return value.slice(-delimiter.length) === delimiter ? delimiter : '';
            }

            // multiple delimiters
            var matchedDelimiter = '';
            delimiters.forEach(function (current) {
                if (value.slice(-current.length) === current) {
                    matchedDelimiter = current;
                }
            });

            return matchedDelimiter;
        },

        getDelimiterREByDelimiter: function (delimiter) {
            return new RegExp(delimiter.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
        },

        getNextCursorPosition: function (prevPos, oldValue, newValue, delimiter, delimiters) {
          // If cursor was at the end of value, just place it back.
          // Because new value could contain additional chars.
          if (oldValue.length === prevPos) {
              return newValue.length;
          }

          return prevPos + this.getPositionOffset(prevPos, oldValue, newValue, delimiter ,delimiters);
        },

        getPositionOffset: function (prevPos, oldValue, newValue, delimiter, delimiters) {
            var oldRawValue, newRawValue, lengthOffset;

            oldRawValue = this.stripDelimiters(oldValue.slice(0, prevPos), delimiter, delimiters);
            newRawValue = this.stripDelimiters(newValue.slice(0, prevPos), delimiter, delimiters);
            lengthOffset = oldRawValue.length - newRawValue.length;

            return (lengthOffset !== 0) ? (lengthOffset / Math.abs(lengthOffset)) : 0;
        },

        stripDelimiters: function (value, delimiter, delimiters) {
            var owner = this;

            // single delimiter
            if (delimiters.length === 0) {
                var delimiterRE = delimiter ? owner.getDelimiterREByDelimiter(delimiter) : '';

                return value.replace(delimiterRE, '');
            }

            // multiple delimiters
            delimiters.forEach(function (current) {
                current.split('').forEach(function (letter) {
                    value = value.replace(owner.getDelimiterREByDelimiter(letter), '');
                });
            });

            return value;
        },

        headStr: function (str, length) {
            return str.slice(0, length);
        },

        getMaxLength: function (blocks) {
            return blocks.reduce(function (previous, current) {
                return previous + current;
            }, 0);
        },

        // strip prefix
        // Before type  |   After type    |     Return value
        // PEFIX-...    |   PEFIX-...     |     ''
        // PREFIX-123   |   PEFIX-123     |     123
        // PREFIX-123   |   PREFIX-23     |     23
        // PREFIX-123   |   PREFIX-1234   |     1234
        getPrefixStrippedValue: function (value, prefix, prefixLength, prevResult, delimiter, delimiters, noImmediatePrefix, tailPrefix, signBeforePrefix) {
            // No prefix
            if (prefixLength === 0) {
              return value;
            }

            if (signBeforePrefix && (value.slice(0, 1) == '-')) {
                var prev = (prevResult.slice(0, 1) == '-') ? prevResult.slice(1) : prevResult;
                return '-' + this.getPrefixStrippedValue(value.slice(1), prefix, prefixLength, prev, delimiter, delimiters, noImmediatePrefix, tailPrefix, signBeforePrefix);
            }

            // Pre result prefix string does not match pre-defined prefix
            if (prevResult.slice(0, prefixLength) !== prefix && !tailPrefix) {
                // Check if the first time user entered something
                if (noImmediatePrefix && !prevResult && value) return value;
                return '';
            } else if (prevResult.slice(-prefixLength) !== prefix && tailPrefix) {
                // Check if the first time user entered something
                if (noImmediatePrefix && !prevResult && value) return value;
                return '';
            }

            var prevValue = this.stripDelimiters(prevResult, delimiter, delimiters);

            // New value has issue, someone typed in between prefix letters
            // Revert to pre value
            if (value.slice(0, prefixLength) !== prefix && !tailPrefix) {
                return prevValue.slice(prefixLength);
            } else if (value.slice(-prefixLength) !== prefix && tailPrefix) {
                return prevValue.slice(0, -prefixLength - 1);
            }

            // No issue, strip prefix for new value
            return tailPrefix ? value.slice(0, -prefixLength) : value.slice(prefixLength);
        },

        getFirstDiffIndex: function (prev, current) {
            var index = 0;

            while (prev.charAt(index) === current.charAt(index)) {
                if (prev.charAt(index++) === '') {
                    return -1;
                }
            }

            return index;
        },

        getFormattedValue: function (value, blocks, blocksLength, delimiter, delimiters, delimiterLazyShow) {
            var result = '',
                multipleDelimiters = delimiters.length > 0,
                currentDelimiter;

            // no options, normal input
            if (blocksLength === 0) {
                return value;
            }

            blocks.forEach(function (length, index) {
                if (value.length > 0) {
                    var sub = value.slice(0, length),
                        rest = value.slice(length);

                    if (multipleDelimiters) {
                        currentDelimiter = delimiters[delimiterLazyShow ? (index - 1) : index] || currentDelimiter;
                    } else {
                        currentDelimiter = delimiter;
                    }

                    if (delimiterLazyShow) {
                        if (index > 0) {
                            result += currentDelimiter;
                        }

                        result += sub;
                    } else {
                        result += sub;

                        if (sub.length === length && index < blocksLength - 1) {
                            result += currentDelimiter;
                        }
                    }

                    // update remaining string
                    value = rest;
                }
            });

            return result;
        },

        // move cursor to the end
        // the first time user focuses on an input with prefix
        fixPrefixCursor: function (el, prefix, delimiter, delimiters) {
            if (!el) {
                return;
            }

            var val = el.value,
                appendix = delimiter || (delimiters[0] || ' ');

            if (!el.setSelectionRange || !prefix || (prefix.length + appendix.length) <= val.length) {
                return;
            }

            var len = val.length * 2;

            // set timeout to avoid blink
            setTimeout(function () {
                el.setSelectionRange(len, len);
            }, 1);
        },

        // Check if input field is fully selected
        checkFullSelection: function(value) {
          try {
            var selection = window.getSelection() || document.getSelection() || {};
            return selection.toString().length === value.length;
          } catch (ex) {
            // Ignore
          }

          return false;
        },

        setSelection: function (element, position, doc) {
            if (element !== this.getActiveElement(doc)) {
                return;
            }

            // cursor is already in the end
            if (element && element.value.length <= position) {
              return;
            }

            if (element.createTextRange) {
                var range = element.createTextRange();

                range.move('character', position);
                range.select();
            } else {
                try {
                    element.setSelectionRange(position, position);
                } catch (e) {
                    // eslint-disable-next-line
                    console.warn('The input element type does not support selection');
                }
            }
        },

        getActiveElement: function(parent) {
            var activeElement = parent.activeElement;
            if (activeElement && activeElement.shadowRoot) {
                return this.getActiveElement(activeElement.shadowRoot);
            }
            return activeElement;
        },

        isAndroid: function () {
            return navigator && /android/i.test(navigator.userAgent);
        },

        // On Android chrome, the keyup and keydown events
        // always return key code 229 as a composition that
        // buffers the user’s keystrokes
        // see https://github.com/nosir/cleave.js/issues/147
        isAndroidBackspaceKeydown: function (lastInputValue, currentInputValue) {
            if (!this.isAndroid() || !lastInputValue || !currentInputValue) {
                return false;
            }

            return currentInputValue === lastInputValue.slice(0, -1);
        }
    };

    var Util_1 = Util;

    /**
     * Props Assignment
     *
     * Separate this, so react module can share the usage
     */
    var DefaultProperties = {
        // Maybe change to object-assign
        // for now just keep it as simple
        assign: function (target, opts) {
            target = target || {};
            opts = opts || {};

            // credit card
            target.creditCard = !!opts.creditCard;
            target.creditCardStrictMode = !!opts.creditCardStrictMode;
            target.creditCardType = '';
            target.onCreditCardTypeChanged = opts.onCreditCardTypeChanged || (function () {});

            // phone
            target.phone = !!opts.phone;
            target.phoneRegionCode = opts.phoneRegionCode || 'AU';
            target.phoneFormatter = {};

            // time
            target.time = !!opts.time;
            target.timePattern = opts.timePattern || ['h', 'm', 's'];
            target.timeFormat = opts.timeFormat || '24';
            target.timeFormatter = {};

            // date
            target.date = !!opts.date;
            target.datePattern = opts.datePattern || ['d', 'm', 'Y'];
            target.dateMin = opts.dateMin || '';
            target.dateMax = opts.dateMax || '';
            target.dateFormatter = {};

            // numeral
            target.numeral = !!opts.numeral;
            target.numeralIntegerScale = opts.numeralIntegerScale > 0 ? opts.numeralIntegerScale : 0;
            target.numeralDecimalScale = opts.numeralDecimalScale >= 0 ? opts.numeralDecimalScale : 2;
            target.numeralDecimalMark = opts.numeralDecimalMark || '.';
            target.numeralThousandsGroupStyle = opts.numeralThousandsGroupStyle || 'thousand';
            target.numeralPositiveOnly = !!opts.numeralPositiveOnly;
            target.stripLeadingZeroes = opts.stripLeadingZeroes !== false;
            target.signBeforePrefix = !!opts.signBeforePrefix;
            target.tailPrefix = !!opts.tailPrefix;

            // others
            target.swapHiddenInput = !!opts.swapHiddenInput;
            
            target.numericOnly = target.creditCard || target.date || !!opts.numericOnly;

            target.uppercase = !!opts.uppercase;
            target.lowercase = !!opts.lowercase;

            target.prefix = (target.creditCard || target.date) ? '' : (opts.prefix || '');
            target.noImmediatePrefix = !!opts.noImmediatePrefix;
            target.prefixLength = target.prefix.length;
            target.rawValueTrimPrefix = !!opts.rawValueTrimPrefix;
            target.copyDelimiter = !!opts.copyDelimiter;

            target.initValue = (opts.initValue !== undefined && opts.initValue !== null) ? opts.initValue.toString() : '';

            target.delimiter =
                (opts.delimiter || opts.delimiter === '') ? opts.delimiter :
                    (opts.date ? '/' :
                        (opts.time ? ':' :
                            (opts.numeral ? ',' :
                                (opts.phone ? ' ' :
                                    ' '))));
            target.delimiterLength = target.delimiter.length;
            target.delimiterLazyShow = !!opts.delimiterLazyShow;
            target.delimiters = opts.delimiters || [];

            target.blocks = opts.blocks || [];
            target.blocksLength = target.blocks.length;

            target.root = (typeof commonjsGlobal === 'object' && commonjsGlobal) ? commonjsGlobal : window;
            target.document = opts.document || target.root.document;

            target.maxLength = 0;

            target.backspace = false;
            target.result = '';

            target.onValueChanged = opts.onValueChanged || (function () {});

            return target;
        }
    };

    var DefaultProperties_1 = DefaultProperties;

    /**
     * Construct a new Cleave instance by passing the configuration object
     *
     * @param {String | HTMLElement} element
     * @param {Object} opts
     */
    var Cleave = function (element, opts) {
        var owner = this;
        var hasMultipleElements = false;

        if (typeof element === 'string') {
            owner.element = document.querySelector(element);
            hasMultipleElements = document.querySelectorAll(element).length > 1;
        } else {
          if (typeof element.length !== 'undefined' && element.length > 0) {
            owner.element = element[0];
            hasMultipleElements = element.length > 1;
          } else {
            owner.element = element;
          }
        }

        if (!owner.element) {
            throw new Error('[cleave.js] Please check the element');
        }

        if (hasMultipleElements) {
          try {
            // eslint-disable-next-line
            console.warn('[cleave.js] Multiple input fields matched, cleave.js will only take the first one.');
          } catch (e) {
            // Old IE
          }
        }

        opts.initValue = owner.element.value;

        owner.properties = Cleave.DefaultProperties.assign({}, opts);

        owner.init();
    };

    Cleave.prototype = {
        init: function () {
            var owner = this, pps = owner.properties;

            // no need to use this lib
            if (!pps.numeral && !pps.phone && !pps.creditCard && !pps.time && !pps.date && (pps.blocksLength === 0 && !pps.prefix)) {
                owner.onInput(pps.initValue);

                return;
            }

            pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);

            owner.isAndroid = Cleave.Util.isAndroid();
            owner.lastInputValue = '';

            owner.onChangeListener = owner.onChange.bind(owner);
            owner.onKeyDownListener = owner.onKeyDown.bind(owner);
            owner.onFocusListener = owner.onFocus.bind(owner);
            owner.onCutListener = owner.onCut.bind(owner);
            owner.onCopyListener = owner.onCopy.bind(owner);

            owner.initSwapHiddenInput();

            owner.element.addEventListener('input', owner.onChangeListener);
            owner.element.addEventListener('keydown', owner.onKeyDownListener);
            owner.element.addEventListener('focus', owner.onFocusListener);
            owner.element.addEventListener('cut', owner.onCutListener);
            owner.element.addEventListener('copy', owner.onCopyListener);


            owner.initPhoneFormatter();
            owner.initDateFormatter();
            owner.initTimeFormatter();
            owner.initNumeralFormatter();

            // avoid touch input field if value is null
            // otherwise Firefox will add red box-shadow for <input required />
            if (pps.initValue || (pps.prefix && !pps.noImmediatePrefix)) {
                owner.onInput(pps.initValue);
            }
        },

        initSwapHiddenInput: function () {
            var owner = this, pps = owner.properties;
            if (!pps.swapHiddenInput) return;

            var inputFormatter = owner.element.cloneNode(true);
            owner.element.parentNode.insertBefore(inputFormatter, owner.element);

            owner.elementSwapHidden = owner.element;
            owner.elementSwapHidden.type = 'hidden';

            owner.element = inputFormatter;
            owner.element.id = '';
        },

        initNumeralFormatter: function () {
            var owner = this, pps = owner.properties;

            if (!pps.numeral) {
                return;
            }

            pps.numeralFormatter = new Cleave.NumeralFormatter(
                pps.numeralDecimalMark,
                pps.numeralIntegerScale,
                pps.numeralDecimalScale,
                pps.numeralThousandsGroupStyle,
                pps.numeralPositiveOnly,
                pps.stripLeadingZeroes,
                pps.prefix,
                pps.signBeforePrefix,
                pps.tailPrefix,
                pps.delimiter
            );
        },

        initTimeFormatter: function() {
            var owner = this, pps = owner.properties;

            if (!pps.time) {
                return;
            }

            pps.timeFormatter = new Cleave.TimeFormatter(pps.timePattern, pps.timeFormat);
            pps.blocks = pps.timeFormatter.getBlocks();
            pps.blocksLength = pps.blocks.length;
            pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);
        },

        initDateFormatter: function () {
            var owner = this, pps = owner.properties;

            if (!pps.date) {
                return;
            }

            pps.dateFormatter = new Cleave.DateFormatter(pps.datePattern, pps.dateMin, pps.dateMax);
            pps.blocks = pps.dateFormatter.getBlocks();
            pps.blocksLength = pps.blocks.length;
            pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);
        },

        initPhoneFormatter: function () {
            var owner = this, pps = owner.properties;

            if (!pps.phone) {
                return;
            }

            // Cleave.AsYouTypeFormatter should be provided by
            // external google closure lib
            try {
                pps.phoneFormatter = new Cleave.PhoneFormatter(
                    new pps.root.Cleave.AsYouTypeFormatter(pps.phoneRegionCode),
                    pps.delimiter
                );
            } catch (ex) {
                throw new Error('[cleave.js] Please include phone-type-formatter.{country}.js lib');
            }
        },

        onKeyDown: function (event) {
            var owner = this, pps = owner.properties,
                charCode = event.which || event.keyCode,
                Util = Cleave.Util,
                currentValue = owner.element.value;

            // if we got any charCode === 8, this means, that this device correctly
            // sends backspace keys in event, so we do not need to apply any hacks
            owner.hasBackspaceSupport = owner.hasBackspaceSupport || charCode === 8;
            if (!owner.hasBackspaceSupport
              && Util.isAndroidBackspaceKeydown(owner.lastInputValue, currentValue)
            ) {
                charCode = 8;
            }

            owner.lastInputValue = currentValue;

            // hit backspace when last character is delimiter
            var postDelimiter = Util.getPostDelimiter(currentValue, pps.delimiter, pps.delimiters);
            if (charCode === 8 && postDelimiter) {
                pps.postDelimiterBackspace = postDelimiter;
            } else {
                pps.postDelimiterBackspace = false;
            }
        },

        onChange: function () {
            this.onInput(this.element.value);
        },

        onFocus: function () {
            var owner = this,
                pps = owner.properties;

            if (pps.prefix && pps.noImmediatePrefix && !owner.element.value) {
                this.onInput(pps.prefix);
            }

            Cleave.Util.fixPrefixCursor(owner.element, pps.prefix, pps.delimiter, pps.delimiters);
        },

        onCut: function (e) {
            if (!Cleave.Util.checkFullSelection(this.element.value)) return;
            this.copyClipboardData(e);
            this.onInput('');
        },

        onCopy: function (e) {
            if (!Cleave.Util.checkFullSelection(this.element.value)) return;
            this.copyClipboardData(e);
        },

        copyClipboardData: function (e) {
            var owner = this,
                pps = owner.properties,
                Util = Cleave.Util,
                inputValue = owner.element.value,
                textToCopy = '';

            if (!pps.copyDelimiter) {
                textToCopy = Util.stripDelimiters(inputValue, pps.delimiter, pps.delimiters);
            } else {
                textToCopy = inputValue;
            }

            try {
                if (e.clipboardData) {
                    e.clipboardData.setData('Text', textToCopy);
                } else {
                    window.clipboardData.setData('Text', textToCopy);
                }

                e.preventDefault();
            } catch (ex) {
                //  empty
            }
        },

        onInput: function (value) {
            var owner = this, pps = owner.properties,
                Util = Cleave.Util;

            // case 1: delete one more character "4"
            // 1234*| -> hit backspace -> 123|
            // case 2: last character is not delimiter which is:
            // 12|34* -> hit backspace -> 1|34*
            // note: no need to apply this for numeral mode
            var postDelimiterAfter = Util.getPostDelimiter(value, pps.delimiter, pps.delimiters);
            if (!pps.numeral && pps.postDelimiterBackspace && !postDelimiterAfter) {
                value = Util.headStr(value, value.length - pps.postDelimiterBackspace.length);
            }

            // phone formatter
            if (pps.phone) {
                if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
                    pps.result = pps.prefix + pps.phoneFormatter.format(value).slice(pps.prefix.length);
                } else {
                    pps.result = pps.phoneFormatter.format(value);
                }
                owner.updateValueState();

                return;
            }

            // numeral formatter
            if (pps.numeral) {
                // Do not show prefix when noImmediatePrefix is specified
                // This mostly because we need to show user the native input placeholder
                if (pps.prefix && pps.noImmediatePrefix && value.length === 0) {
                    pps.result = '';
                } else {
                    pps.result = pps.numeralFormatter.format(value);
                }
                owner.updateValueState();

                return;
            }

            // date
            if (pps.date) {
                value = pps.dateFormatter.getValidatedDate(value);
            }

            // time
            if (pps.time) {
                value = pps.timeFormatter.getValidatedTime(value);
            }

            // strip delimiters
            value = Util.stripDelimiters(value, pps.delimiter, pps.delimiters);

            // strip prefix
            value = Util.getPrefixStrippedValue(value, pps.prefix, pps.prefixLength, pps.result, pps.delimiter, pps.delimiters, pps.noImmediatePrefix, pps.tailPrefix, pps.signBeforePrefix);

            // strip non-numeric characters
            value = pps.numericOnly ? Util.strip(value, /[^\d]/g) : value;

            // convert case
            value = pps.uppercase ? value.toUpperCase() : value;
            value = pps.lowercase ? value.toLowerCase() : value;

            // prevent from showing prefix when no immediate option enabled with empty input value
            if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
                if (pps.tailPrefix) {
                    value = value + pps.prefix;
                } else {
                    value = pps.prefix + value;
                }


                // no blocks specified, no need to do formatting
                if (pps.blocksLength === 0) {
                    pps.result = value;
                    owner.updateValueState();

                    return;
                }
            }

            // update credit card props
            if (pps.creditCard) {
                owner.updateCreditCardPropsByValue(value);
            }

            // strip over length characters
            value = Util.headStr(value, pps.maxLength);

            // apply blocks
            pps.result = Util.getFormattedValue(
                value,
                pps.blocks, pps.blocksLength,
                pps.delimiter, pps.delimiters, pps.delimiterLazyShow
            );

            owner.updateValueState();
        },

        updateCreditCardPropsByValue: function (value) {
            var owner = this, pps = owner.properties,
                Util = Cleave.Util,
                creditCardInfo;

            // At least one of the first 4 characters has changed
            if (Util.headStr(pps.result, 4) === Util.headStr(value, 4)) {
                return;
            }

            creditCardInfo = Cleave.CreditCardDetector.getInfo(value, pps.creditCardStrictMode);

            pps.blocks = creditCardInfo.blocks;
            pps.blocksLength = pps.blocks.length;
            pps.maxLength = Util.getMaxLength(pps.blocks);

            // credit card type changed
            if (pps.creditCardType !== creditCardInfo.type) {
                pps.creditCardType = creditCardInfo.type;

                pps.onCreditCardTypeChanged.call(owner, pps.creditCardType);
            }
        },

        updateValueState: function () {
            var owner = this,
                Util = Cleave.Util,
                pps = owner.properties;

            if (!owner.element) {
                return;
            }

            var endPos = owner.element.selectionEnd;
            var oldValue = owner.element.value;
            var newValue = pps.result;

            endPos = Util.getNextCursorPosition(endPos, oldValue, newValue, pps.delimiter, pps.delimiters);

            // fix Android browser type="text" input field
            // cursor not jumping issue
            if (owner.isAndroid) {
                window.setTimeout(function () {
                    owner.element.value = newValue;
                    Util.setSelection(owner.element, endPos, pps.document, false);
                    owner.callOnValueChanged();
                }, 1);

                return;
            }

            owner.element.value = newValue;
            if (pps.swapHiddenInput) owner.elementSwapHidden.value = owner.getRawValue();

            Util.setSelection(owner.element, endPos, pps.document, false);
            owner.callOnValueChanged();
        },

        callOnValueChanged: function () {
            var owner = this,
                pps = owner.properties;

            pps.onValueChanged.call(owner, {
                target: {
                    name: owner.element.name,
                    value: pps.result,
                    rawValue: owner.getRawValue()
                }
            });
        },

        setPhoneRegionCode: function (phoneRegionCode) {
            var owner = this, pps = owner.properties;

            pps.phoneRegionCode = phoneRegionCode;
            owner.initPhoneFormatter();
            owner.onChange();
        },

        setRawValue: function (value) {
            var owner = this, pps = owner.properties;

            value = value !== undefined && value !== null ? value.toString() : '';

            if (pps.numeral) {
                value = value.replace('.', pps.numeralDecimalMark);
            }

            pps.postDelimiterBackspace = false;

            owner.element.value = value;
            owner.onInput(value);
        },

        getRawValue: function () {
            var owner = this,
                pps = owner.properties,
                Util = Cleave.Util,
                rawValue = owner.element.value;

            if (pps.rawValueTrimPrefix) {
                rawValue = Util.getPrefixStrippedValue(rawValue, pps.prefix, pps.prefixLength, pps.result, pps.delimiter, pps.delimiters, pps.noImmediatePrefix, pps.tailPrefix, pps.signBeforePrefix);
            }

            if (pps.numeral) {
                rawValue = pps.numeralFormatter.getRawValue(rawValue);
            } else {
                rawValue = Util.stripDelimiters(rawValue, pps.delimiter, pps.delimiters);
            }

            return rawValue;
        },

        getISOFormatDate: function () {
            var owner = this,
                pps = owner.properties;

            return pps.date ? pps.dateFormatter.getISOFormatDate() : '';
        },

        getISOFormatTime: function () {
            var owner = this,
                pps = owner.properties;

            return pps.time ? pps.timeFormatter.getISOFormatTime() : '';
        },

        getFormattedValue: function () {
            return this.element.value;
        },

        destroy: function () {
            var owner = this;

            owner.element.removeEventListener('input', owner.onChangeListener);
            owner.element.removeEventListener('keydown', owner.onKeyDownListener);
            owner.element.removeEventListener('focus', owner.onFocusListener);
            owner.element.removeEventListener('cut', owner.onCutListener);
            owner.element.removeEventListener('copy', owner.onCopyListener);
        },

        toString: function () {
            return '[Cleave Object]';
        }
    };

    Cleave.NumeralFormatter = NumeralFormatter_1;
    Cleave.DateFormatter = DateFormatter_1;
    Cleave.TimeFormatter = TimeFormatter_1;
    Cleave.PhoneFormatter = PhoneFormatter_1;
    Cleave.CreditCardDetector = CreditCardDetector_1;
    Cleave.Util = Util_1;
    Cleave.DefaultProperties = DefaultProperties_1;

    // for angular directive
    ((typeof commonjsGlobal === 'object' && commonjsGlobal) ? commonjsGlobal : window)['Cleave'] = Cleave;

    // CommonJS
    var Cleave_1 = Cleave;

    /* src\components\NumberInput.svelte generated by Svelte v3.22.2 */
    const file$2 = "src\\components\\NumberInput.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			attr_dev(input, "tabindex", /*tabindex*/ ctx[1]);
    			attr_dev(input, "class", "number-input uk-width-1-1 svelte-wypmco");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "type", "text");
    			add_location(input, file$2, 20, 1, 425);
    			attr_dev(div, "class", "uk-width-1-1");
    			add_location(div, file$2, 19, 0, 396);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    				listen_dev(input, "input", /*input_handler*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tabindex*/ 2) {
    				attr_dev(input, "tabindex", /*tabindex*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { value = null } = $$props;
    	let { decimalScale = 2 } = $$props;
    	let { tabindex = 0 } = $$props;

    	onMount(() => {
    		document.querySelectorAll(".number-input").forEach(function (el) {
    			new Cleave_1(el,
    			{
    					numeral: true,
    					numeralDecimalScale: decimalScale,
    					numeralPositiveOnly: true
    				});
    		});
    	});

    	const writable_props = ["value", "decimalScale", "tabindex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NumberInput> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NumberInput", $$slots, []);

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("decimalScale" in $$props) $$invalidate(2, decimalScale = $$props.decimalScale);
    		if ("tabindex" in $$props) $$invalidate(1, tabindex = $$props.tabindex);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Cleave: Cleave_1,
    		value,
    		decimalScale,
    		tabindex
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("decimalScale" in $$props) $$invalidate(2, decimalScale = $$props.decimalScale);
    		if ("tabindex" in $$props) $$invalidate(1, tabindex = $$props.tabindex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, tabindex, decimalScale, input_handler, input_input_handler];
    }

    class NumberInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 0, decimalScale: 2, tabindex: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NumberInput",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get value() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get decimalScale() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set decimalScale(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SaleRecord.svelte generated by Svelte v3.22.2 */
    const file$3 = "src\\components\\SaleRecord.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let div2;
    	let div0;
    	let label0;
    	let t1;
    	let updating_value;
    	let t2;
    	let div1;
    	let label1;
    	let t4;
    	let updating_value_1;
    	let current;

    	function numberinput0_value_binding(value) {
    		/*numberinput0_value_binding*/ ctx[3].call(null, value);
    	}

    	let numberinput0_props = { decimalScale: 0 };

    	if (/*record*/ ctx[0].turnipSellPrice !== void 0) {
    		numberinput0_props.value = /*record*/ ctx[0].turnipSellPrice;
    	}

    	const numberinput0 = new NumberInput({
    			props: numberinput0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numberinput0, "value", numberinput0_value_binding));
    	numberinput0.$on("input", /*updateCalc*/ ctx[1]);

    	function numberinput1_value_binding(value) {
    		/*numberinput1_value_binding*/ ctx[4].call(null, value);
    	}

    	let numberinput1_props = { decimalScale: 0 };

    	if (/*record*/ ctx[0].numberOfTurnipsSold !== void 0) {
    		numberinput1_props.value = /*record*/ ctx[0].numberOfTurnipsSold;
    	}

    	const numberinput1 = new NumberInput({
    			props: numberinput1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numberinput1, "value", numberinput1_value_binding));
    	numberinput1.$on("input", /*updateCalc*/ ctx[1]);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Turnips Sell Price";
    			t1 = space();
    			create_component(numberinput0.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "# Sold";
    			t4 = space();
    			create_component(numberinput1.$$.fragment);
    			attr_dev(label0, "class", "uk-form-label");
    			add_location(label0, file$3, 16, 3, 359);
    			attr_dev(div0, "class", "uk-width-1-1 uk-width-1-2@s label-spacing");
    			add_location(div0, file$3, 15, 2, 299);
    			attr_dev(label1, "class", "uk-form-label");
    			add_location(label1, file$3, 20, 3, 582);
    			attr_dev(div1, "class", "uk-width-1-1 uk-width-1-2@s label-spacing");
    			add_location(div1, file$3, 19, 2, 522);
    			attr_dev(div2, "uk-grid", "");
    			add_location(div2, file$3, 14, 1, 282);
    			attr_dev(section, "class", "uk-margin-top");
    			add_location(section, file$3, 13, 0, 248);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			mount_component(numberinput0, div0, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			mount_component(numberinput1, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const numberinput0_changes = {};

    			if (!updating_value && dirty & /*record*/ 1) {
    				updating_value = true;
    				numberinput0_changes.value = /*record*/ ctx[0].turnipSellPrice;
    				add_flush_callback(() => updating_value = false);
    			}

    			numberinput0.$set(numberinput0_changes);
    			const numberinput1_changes = {};

    			if (!updating_value_1 && dirty & /*record*/ 1) {
    				updating_value_1 = true;
    				numberinput1_changes.value = /*record*/ ctx[0].numberOfTurnipsSold;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			numberinput1.$set(numberinput1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(numberinput0.$$.fragment, local);
    			transition_in(numberinput1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(numberinput0.$$.fragment, local);
    			transition_out(numberinput1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(numberinput0);
    			destroy_component(numberinput1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

    	function updateCalc() {
    		dispatch("updateCalc");
    	}

    	let { record } = $$props;
    	const writable_props = ["record"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SaleRecord> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SaleRecord", $$slots, []);

    	function numberinput0_value_binding(value) {
    		record.turnipSellPrice = value;
    		$$invalidate(0, record);
    	}

    	function numberinput1_value_binding(value) {
    		record.numberOfTurnipsSold = value;
    		$$invalidate(0, record);
    	}

    	$$self.$set = $$props => {
    		if ("record" in $$props) $$invalidate(0, record = $$props.record);
    	};

    	$$self.$capture_state = () => ({
    		NumberInput,
    		createEventDispatcher,
    		dispatch,
    		updateCalc,
    		record
    	});

    	$$self.$inject_state = $$props => {
    		if ("record" in $$props) $$invalidate(0, record = $$props.record);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		record,
    		updateCalc,
    		dispatch,
    		numberinput0_value_binding,
    		numberinput1_value_binding
    	];
    }

    class SaleRecord extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { record: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SaleRecord",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*record*/ ctx[0] === undefined && !("record" in props)) {
    			console.warn("<SaleRecord> was created without expected prop 'record'");
    		}
    	}

    	get record() {
    		throw new Error("<SaleRecord>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set record(value) {
    		throw new Error("<SaleRecord>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Body.svelte generated by Svelte v3.22.2 */
    const file$4 = "src\\components\\Body.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (57:3) {#each records as record, i}
    function create_each_block(ctx) {
    	let current;

    	const salerecord = new SaleRecord({
    			props: { record: /*record*/ ctx[9] },
    			$$inline: true
    		});

    	salerecord.$on("updateCalc", /*updateCalc*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(salerecord.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(salerecord, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const salerecord_changes = {};
    			if (dirty & /*records*/ 2) salerecord_changes.record = /*record*/ ctx[9];
    			salerecord.$set(salerecord_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(salerecord.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(salerecord.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(salerecord, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(57:3) {#each records as record, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section2;
    	let section0;
    	let header0;
    	let h30;
    	let t1;
    	let div2;
    	let div0;
    	let label0;
    	let t3;
    	let updating_value;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let updating_value_1;
    	let t7;
    	let section1;
    	let header1;
    	let h31;
    	let t9;
    	let div3;
    	let t10;
    	let div6;
    	let div4;
    	let button0;
    	let t12;
    	let div5;
    	let button1;
    	let current;
    	let dispose;

    	function numberinput0_value_binding(value) {
    		/*numberinput0_value_binding*/ ctx[7].call(null, value);
    	}

    	let numberinput0_props = { decimalScale: 0 };

    	if (/*calc*/ ctx[0].turnipBuyPrice !== void 0) {
    		numberinput0_props.value = /*calc*/ ctx[0].turnipBuyPrice;
    	}

    	const numberinput0 = new NumberInput({
    			props: numberinput0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numberinput0, "value", numberinput0_value_binding));

    	function numberinput1_value_binding(value) {
    		/*numberinput1_value_binding*/ ctx[8].call(null, value);
    	}

    	let numberinput1_props = { decimalScale: 0 };

    	if (/*calc*/ ctx[0].numberOfTurnipsBought !== void 0) {
    		numberinput1_props.value = /*calc*/ ctx[0].numberOfTurnipsBought;
    	}

    	const numberinput1 = new NumberInput({
    			props: numberinput1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numberinput1, "value", numberinput1_value_binding));
    	let each_value = /*records*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section2 = element("section");
    			section0 = element("section");
    			header0 = element("header");
    			h30 = element("h3");
    			h30.textContent = "Please enter Turnip buying information";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Turnips Buy Price";
    			t3 = space();
    			create_component(numberinput0.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "# Bought";
    			t6 = space();
    			create_component(numberinput1.$$.fragment);
    			t7 = space();
    			section1 = element("section");
    			header1 = element("header");
    			h31 = element("h3");
    			h31.textContent = "Please enter each Turnip sell record";
    			t9 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			div6 = element("div");
    			div4 = element("div");
    			button0 = element("button");
    			button0.textContent = "Add record";
    			t12 = space();
    			div5 = element("div");
    			button1 = element("button");
    			button1.textContent = "Reset Sell Records";
    			attr_dev(h30, "class", "uk-text-center");
    			add_location(h30, file$4, 36, 3, 780);
    			add_location(header0, file$4, 35, 2, 767);
    			attr_dev(label0, "class", "uk-form-label svelte-xwst6p");
    			add_location(label0, file$4, 40, 4, 967);
    			attr_dev(div0, "class", "uk-width-1-1 uk-width-1-2@s label-spacing svelte-xwst6p");
    			add_location(div0, file$4, 39, 3, 906);
    			attr_dev(label1, "class", "uk-form-label svelte-xwst6p");
    			add_location(label1, file$4, 44, 4, 1168);
    			attr_dev(div1, "class", "uk-width-1-1 uk-width-1-2@s label-spacing svelte-xwst6p");
    			add_location(div1, file$4, 43, 3, 1107);
    			attr_dev(div2, "class", "uk-width-1-1");
    			attr_dev(div2, "uk-grid", "");
    			add_location(div2, file$4, 38, 2, 867);
    			attr_dev(section0, "class", "uk-margin-bottom");
    			add_location(section0, file$4, 34, 1, 729);
    			attr_dev(h31, "class", "uk-text-center");
    			add_location(h31, file$4, 52, 3, 1355);
    			add_location(header1, file$4, 51, 2, 1342);
    			attr_dev(div3, "class", "uk-margin-bottom");
    			add_location(div3, file$4, 55, 2, 1442);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "uk-margin-auto uk-display-block button primary");
    			add_location(button0, file$4, 62, 4, 1639);
    			add_location(div4, file$4, 61, 3, 1628);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "uk-margin-auto uk-display-block button secondary");
    			add_location(button1, file$4, 65, 4, 1787);
    			add_location(div5, file$4, 64, 3, 1776);
    			attr_dev(div6, "uk-grid", "");
    			attr_dev(div6, "class", "uk-flex-center");
    			add_location(div6, file$4, 60, 2, 1587);
    			add_location(section1, file$4, 50, 1, 1329);
    			attr_dev(section2, "class", "uk-card uk-card-body body uk-form-stacked svelte-xwst6p");
    			add_location(section2, file$4, 33, 0, 667);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, section2, anchor);
    			append_dev(section2, section0);
    			append_dev(section0, header0);
    			append_dev(header0, h30);
    			append_dev(section0, t1);
    			append_dev(section0, div2);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			mount_component(numberinput0, div0, null);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			mount_component(numberinput1, div1, null);
    			append_dev(section2, t7);
    			append_dev(section2, section1);
    			append_dev(section1, header1);
    			append_dev(header1, h31);
    			append_dev(section1, t9);
    			append_dev(section1, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(section1, t10);
    			append_dev(section1, div6);
    			append_dev(div6, div4);
    			append_dev(div4, button0);
    			append_dev(div6, t12);
    			append_dev(div6, div5);
    			append_dev(div5, button1);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*addSellRecord*/ ctx[2], false, false, false),
    				listen_dev(button1, "click", /*resetSellRecords*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const numberinput0_changes = {};

    			if (!updating_value && dirty & /*calc*/ 1) {
    				updating_value = true;
    				numberinput0_changes.value = /*calc*/ ctx[0].turnipBuyPrice;
    				add_flush_callback(() => updating_value = false);
    			}

    			numberinput0.$set(numberinput0_changes);
    			const numberinput1_changes = {};

    			if (!updating_value_1 && dirty & /*calc*/ 1) {
    				updating_value_1 = true;
    				numberinput1_changes.value = /*calc*/ ctx[0].numberOfTurnipsBought;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			numberinput1.$set(numberinput1_changes);

    			if (dirty & /*records, updateCalc*/ 18) {
    				each_value = /*records*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(numberinput0.$$.fragment, local);
    			transition_in(numberinput1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(numberinput0.$$.fragment, local);
    			transition_out(numberinput1.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section2);
    			destroy_component(numberinput0);
    			destroy_component(numberinput1);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { calc = null } = $$props;

    	function updateCalculator() {
    		calc.updateDisplayValue();
    	}

    	function addSellRecord() {
    		calc.addSellRecord();
    		$$invalidate(1, records = [...calc.saleRecords]);
    	}

    	function resetSellRecords() {
    		calc.resetSellRecords();
    		$$invalidate(1, records = [...calc.saleRecords]);
    		calc.updateCalc();
    		dispatch("updateCalc");
    	}

    	function updateCalc() {
    		calc.updateCalc();
    		dispatch("updateCalc");
    	}

    	const writable_props = ["calc"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Body> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Body", $$slots, []);

    	function numberinput0_value_binding(value) {
    		calc.turnipBuyPrice = value;
    		$$invalidate(0, calc);
    	}

    	function numberinput1_value_binding(value) {
    		calc.numberOfTurnipsBought = value;
    		$$invalidate(0, calc);
    	}

    	$$self.$set = $$props => {
    		if ("calc" in $$props) $$invalidate(0, calc = $$props.calc);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		NumberInput,
    		SaleRecord,
    		dispatch,
    		calc,
    		updateCalculator,
    		addSellRecord,
    		resetSellRecords,
    		updateCalc,
    		records
    	});

    	$$self.$inject_state = $$props => {
    		if ("calc" in $$props) $$invalidate(0, calc = $$props.calc);
    		if ("records" in $$props) $$invalidate(1, records = $$props.records);
    	};

    	let records;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*calc*/ 1) {
    			 $$invalidate(1, records = [...calc.saleRecords]);
    		}
    	};

    	return [
    		calc,
    		records,
    		addSellRecord,
    		resetSellRecords,
    		updateCalc,
    		dispatch,
    		updateCalculator,
    		numberinput0_value_binding,
    		numberinput1_value_binding
    	];
    }

    class Body extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { calc: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Body",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get calc() {
    		throw new Error("<Body>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set calc(value) {
    		throw new Error("<Body>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function getNumber(num) {
    	if (typeof num === 'number') return num
    	
    	if (typeof num === 'undefined' || num === null) return 0

    	if (typeof num === 'string') return Number(num.split(',').join(''))

    	throw new Error("getNumber: An unexpected variable type was provided.")
    }

    class Calculator {
    	
    	constructor(data) {
    		this.totalSellPrice = data ? data.totalSellPrice : null;
    		this.netGain = data ? data.netGain : null;
    		this.numberOfTurnipsBought = data ? data.numberOfTurnipsBought : null;
    		this.turnipBuyPrice = data ? data.turnipBuyPrice : null;
    		this.saleRecords = data ? data.saleRecords : [ new SellRecord() ];
    	}

    	updateCalc() {
    		this.totalSellPrice = this.saleRecords.reduce((acc, curr) => {
    			return acc + (getNumber(curr.numberOfTurnipsSold) * getNumber(curr.turnipSellPrice))
    		}, 0);

    		this.netGain = this.totalSellPrice - (getNumber(this.numberOfTurnipsBought) * getNumber(this.turnipBuyPrice));
    	
    		if (this.totalSellPrice == 0 || isNaN(this.totalSellPrice) || isNaN(this.netGain)) {
    			this.totalSellPrice = null;
    			this.netGain = null;
    		}
    	}

    	addSellRecord() {
    		this.saleRecords.push(new SellRecord());
    	}

    	resetSellRecords() {
    		this.saleRecords = [new SellRecord()];
    	}
    }

    class SellRecord {
    	constructor() {
    		this.numberOfTurnipsSold = null;
    		this.turnipSellPrice = null;
    	}
    }

    /* src\components\Calculator.svelte generated by Svelte v3.22.2 */
    const file$5 = "src\\components\\Calculator.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div;
    	let t;
    	let current;

    	const display_1 = new Display({
    			props: { calc: /*calc*/ ctx[0] },
    			$$inline: true
    		});

    	const body = new Body({
    			props: { calc: /*calc*/ ctx[0] },
    			$$inline: true
    		});

    	body.$on("updateCalc", /*updateCalc*/ ctx[1]);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			create_component(display_1.$$.fragment);
    			t = space();
    			create_component(body.$$.fragment);
    			attr_dev(div, "class", "uk-card uk-card-body uk-card-default body-background body-radius uk-width-5-6 uk-width-1-2@m svelte-d4u6pz");
    			add_location(div, file$5, 14, 1, 423);
    			attr_dev(section, "uk-height-viewport", "offset-top: true");
    			attr_dev(section, "class", "calculator-background uk-flex uk-flex-column uk-flex-middle uk-flex-center uk-padding-small svelte-d4u6pz");
    			add_location(section, file$5, 13, 0, 273);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			mount_component(display_1, div, null);
    			append_dev(div, t);
    			mount_component(body, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const display_1_changes = {};
    			if (dirty & /*calc*/ 1) display_1_changes.calc = /*calc*/ ctx[0];
    			display_1.$set(display_1_changes);
    			const body_changes = {};
    			if (dirty & /*calc*/ 1) body_changes.calc = /*calc*/ ctx[0];
    			body.$set(body_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(display_1.$$.fragment, local);
    			transition_in(body.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(display_1.$$.fragment, local);
    			transition_out(body.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(display_1);
    			destroy_component(body);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let display = "non default display";
    	let calc = new Calculator();

    	function updateCalc() {
    		$$invalidate(0, calc = new Calculator(calc));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Calculator> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Calculator", $$slots, []);

    	$$self.$capture_state = () => ({
    		Display,
    		Body,
    		Calculator,
    		display,
    		calc,
    		updateCalc
    	});

    	$$self.$inject_state = $$props => {
    		if ("display" in $$props) display = $$props.display;
    		if ("calc" in $$props) $$invalidate(0, calc = $$props.calc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [calc, updateCalc];
    }

    class Calculator_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calculator_1",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.22.2 */
    const file$6 = "src\\App.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let t;
    	let current;
    	const header = new Header({ $$inline: true });
    	const calculator = new Calculator_1({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(calculator.$$.fragment);
    			attr_dev(main, "class", "uk-height-viewport");
    			add_location(main, file$6, 5, 0, 124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t);
    			mount_component(calculator, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(calculator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(calculator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(calculator);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Header, Calculator: Calculator_1 });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
