
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
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

    var Items = [
    	{ id: 0, name: 'Bitterling', price: 900, category: "Fish", },
    	{ id: 1, name: 'Pale Chub', price: 200, category: "Fish", },
    	{ id: 2, name: 'Crucian Carp', price: 160, category: "Fish", },
    	{ id: 3, name: 'Dace', price: 240, category: "Fish", },
    	{ id: 4, name: 'Carp', price: 300, category: "Fish", },
    	{ id: 5, name: 'Koi', price: 4000, category: "Fish", },
    	{ id: 6, name: 'Goldfish', price: 1300, category: "Fish", },
    	{ id: 7, name: 'Pop-eyed Goldfish', price: 1300, category: "Fish", },
    	{ id: 8, name: 'Ranchau Goldfish', price: 4500, category: "Fish", },
    	{ id: 9, name: 'KilliFish', price: 300, category: "Fish", },
    	{ id: 10, name: 'Crawfish', price: 200, category: "Fish", },
    	{ id: 11, name: 'Soft-shelled Turtle', price: 3750, category: "Fish", },
    	{ id: 12, name: 'Snapping Turtle', price: 5000, category: "Fish", },
    	{ id: 13, name: 'Tadpole', price: 100, category: "Fish", },
    	{ id: 14, name: 'Frog', price: 120, category: "Fish", },
    	{ id: 15, name: 'Freshwater Goby', price: 400, category: "Fish", },
    	{ id: 16, name: 'Loach', price: 400, category: "Fish", },
    	{ id: 17, name: 'Catfish', price: 800, category: "Fish", },
    	{ id: 18, name: 'Giant Snakehead', price: 5500, category: "Fish", },
    	{ id: 19, name: 'Bluegill', price: 180, category: "Fish", },
    	{ id: 20, name: 'Yellow Perch', price: 300, category: "Fish", },
    	{ id: 21, name: 'Black Bass', price: 400, category: "Fish", },
    	{ id: 22, name: 'Tilapia', price: 800, category: "Fish", },
    	{ id: 23, name: 'Pike', price: 1800, category: "Fish", },
    	{ id: 24, name: 'Pond Smelt', price: 500, category: "Fish", },
    	{ id: 25, name: 'Sweetfish', price: 900, category: "Fish", },
    	{ id: 26, name: 'Cherry Salmon', price: 1000, category: "Fish", },
    	{ id: 27, name: 'Char', price: 3800, category: "Fish", },
    	{ id: 28, name: 'Golden Trout', price: 15000, category: "Fish", },
    	{ id: 29, name: 'Stringfish', price: 15000, category: "Fish", },
    	{ id: 30, name: 'Salmon', price: 700, category: "Fish", },
    	{ id: 31, name: 'King Salmon', price: 1800, category: "Fish", },
    	{ id: 32, name: 'Mitten Crab', price: 2000, category: "Fish", },
    	{ id: 33, name: 'Guppy', price: 1300, category: "Fish", },
    	{ id: 34, name: 'Nibble Fish', price: 1500, category: "Fish", },
    	{ id: 35, name: 'Angelfish', price: 3000, category: "Fish", },
    	{ id: 36, name: 'Betta', price: 2500, category: "Fish", },
    	{ id: 37, name: 'Neon Tetra', price: 500, category: "Fish", },
    	{ id: 38, name: 'Rainbowfish', price: 800, category: "Fish", },
    	{ id: 39, name: 'Piranha', price: 2500, category: "Fish", },
    	{ id: 40, name: 'Arowana', price: 10000, category: "Fish", },
    	{ id: 41, name: 'Dorado', price: 15000, category: "Fish", },
    	{ id: 42, name: 'Gar', price: 6000, category: "Fish", },
    	{ id: 43, name: 'Arapaima', price: 10000, category: "Fish", },
    	{ id: 44, name: 'Saddled Bichir', price: 4000, category: "Fish", },
    	{ id: 45, name: 'Sturgeon', price: 10000, category: "Fish", },
    	{ id: 46, name: 'Sea Butterfly', price: 1000, category: "Fish", },
    	{ id: 47, name: 'Sea Horse', price: 1100, category: "Fish", },
    	{ id: 48, name: 'Clown Fish', price: 650, category: "Fish", },
    	{ id: 49, name: 'Surgeonfish', price: 1000, category: "Fish", },
    	{ id: 50, name: 'Butterfly Fish', price: 1000, category: "Fish", },
    	{ id: 51, name: 'Napoleonfish', price: 10000, category: "Fish", },
    	{ id: 52, name: 'Zebra Turkeyfish', price: 500, category: "Fish", },
    	{ id: 53, name: 'Blowfish', price: 5000, category: "Fish", },
    	{ id: 54, name: 'Puffer Fish', price: 250, category: "Fish", },
    	{ id: 55, name: 'Anchovy', price: 200, category: "Fish", },
    	{ id: 56, name: 'Horse Mackerel', price: 150, category: "Fish", },
    	{ id: 57, name: 'Barred Knifejaw', price: 5000, category: "Fish", },
    	{ id: 58, name: 'Sea Bass', price: 400, category: "Fish", },
    	{ id: 59, name: 'Red Snapper', price: 3000, category: "Fish", },
    	{ id: 60, name: 'Dab', price: 300, category: "Fish", },
    	{ id: 61, name: 'Olive Flounder', price: 800, category: "Fish", },
    	{ id: 62, name: 'Squid', price: 500, category: "Fish", },
    	{ id: 63, name: 'Moray Eel', price: 2000, category: "Fish", },
    	{ id: 64, name: 'Ribbon Eel', price: 600, category: "Fish", },
    	{ id: 65, name: 'Tuna', price: 7000, category: "Fish", },
    	{ id: 66, name: 'Blue Marlin', price: 10000, category: "Fish", },
    	{ id: 67, name: 'Giant Trevally', price: 4500, category: "Fish", },
    	{ id: 68, name: 'Mahi-Mahi', price: 6000, category: "Fish", },
    	{ id: 69, name: 'Ocean Sunfish', price: 4000, category: "Fish", },
    	{ id: 70, name: 'Ray', price: 3000, category: "Fish", },
    	{ id: 71, name: 'Saw Shark', price: 12000, category: "Fish", },
    	{ id: 72, name: 'Hammerhead Shark', price: 8000, category: "Fish", },
    	{ id: 73, name: 'Great White Shark', price: 15000, category: "Fish", },
    	{ id: 74, name: 'Whale Shark', price: 13000, category: "Fish", },
    	{ id: 75, name: 'Suckerfish', price: 1500, category: "Fish", },
    	{ id: 76, name: 'Football Fish', price: 2500, category: "Fish", },
    	{ id: 77, name: 'Oarfish', price: 9000, category: "Fish", },
    	{ id: 78, name: 'Barreleye', price: 15000, category: "Fish", },
    	{ id: 79, name: 'Coelacanth', price: 15000, category: "Fish", },
    	{ id: 80, name: "Common Butterfly", price: 160, category: "Bugs" },
    	{ id: 81, name: "Yellow Butterfly", price: 160, category: "Bugs" },
    	{ id: 82, name: "Tiger Butterfly", price: 240, category: "Bugs" },
    	{ id: 83, name: "Peacock Butterfly", price: 2500, category: "Bugs" },
    	{ id: 84, name: "Common Bluebottle", price: 300, category: "Bugs" },
    	{ id: 85, name: "Paper Kite Butterfly", price: 1000, category: "Bugs" },
    	{ id: 86, name: "Great Purple Emperor", price: 3000, category: "Bugs" },
    	{ id: 87, name: "Monarch Butterfly", price: 140, category: "Bugs" },
    	{ id: 88, name: "Emperor Butterfly", price: 4000, category: "Bugs" },
    	{ id: 89, name: "Agrias Butterfly", price: 3000, category: "Bugs" },
    	{ id: 90, name: "Rajah Brooke's Birdwing", price: 2500, category: "Bugs" },
    	{ id: 91, name: "Queen Alexandra's Birdwing", price: 4000, category: "Bugs" },
    	{ id: 92, name: "Moth", price: 130, category: "Bugs" },
    	{ id: 93, name: "Atlas Moth", price: 3000, category: "Bugs" },
    	{ id: 94, name: "Madagascan sunset Moth", price: 2500, category: "Bugs" },
    	{ id: 95, name: "Long Locust", price: 200, category: "Bugs" },
    	{ id: 96, name: "Migratory Locust", price: 600, category: "Bugs" },
    	{ id: 97, name: "Rice Grasshopper", price: 160, category: "Bugs" },
    	{ id: 98, name: "Grasshopper", price: 160, category: "Bugs" },
    	{ id: 99, name: "Cricket", price: 130, category: "Bugs" },
    	{ id: 100, name: "Bell Cricket", price: 430, category: "Bugs" },
    	{ id: 101, name: "Mantis", price: 430, category: "Bugs" },
    	{ id: 102, name: "Orchid Mantis", price: 2400, category: "Bugs" },
    	{ id: 103, name: "Honeybee", price: 200, category: "Bugs" },
    	{ id: 104, name: "Wasp", price: 2500, category: "Bugs" },
    	{ id: 105, name: "Brown Cicada", price: 250, category: "Bugs" },
    	{ id: 106, name: "Robust Cicada", price: 300, category: "Bugs" },
    	{ id: 107, name: "Giant Cicada", price: 500, category: "Bugs" },
    	{ id: 108, name: "Walker Cicada", price: 400, category: "Bugs" },
    	{ id: 109, name: "Evening Cicada", price: 550, category: "Bugs" },
    	{ id: 110, name: "Cicada shell", price: 10, category: "Bugs" },
    	{ id: 111, name: "Red Dragonfly", price: 180, category: "Bugs" },
    	{ id: 112, name: "Darner Dragonfly", price: 230, category: "Bugs" },
    	{ id: 113, name: "Banded Dragonfly", price: 4500, category: "Bugs" },
    	{ id: 114, name: "Damselfly", price: 500, category: "Bugs" },
    	{ id: 115, name: "Firefly", price: 300, category: "Bugs" },
    	{ id: 116, name: "Mole Cricket", price: 500, category: "Bugs" },
    	{ id: 117, name: "Pondskater", price: 130, category: "Bugs" },
    	{ id: 118, name: "Diving Beetle", price: 800, category: "Bugs" },
    	{ id: 119, name: "Giant Water Bug", price: 2000, category: "Bugs" },
    	{ id: 120, name: "Stinkbug", price: 120, category: "Bugs" },
    	{ id: 121, name: "Man-faced Stink Bug", price: 1000, category: "Bugs" },
    	{ id: 122, name: "Ladybug", price: 200, category: "Bugs" },
    	{ id: 123, name: "Tiger Beetle", price: 1500, category: "Bugs" },
    	{ id: 124, name: "Jewel Beetle", price: 2400, category: "Bugs" },
    	{ id: 125, name: "Violin Beetle", price: 450, category: "Bugs" },
    	{ id: 126, name: "Citrus Long-horned Beetle", price: 350, category: "Bugs" },
    	{ id: 127, name: "Rosalia Batesi Beetle", price: 3000, category: "Bugs" },
    	{ id: 128, name: "Blue Weevil Beetle", price: 800, category: "Bugs" },
    	{ id: 129, name: "Dung Beetle", price: 3000, category: "Bugs" },
    	{ id: 130, name: "Earth-Boring Dung Beetle", price: 300, category: "Bugs" },
    	{ id: 131, name: "Scarab Beetle", price: 10000, category: "Bugs" },
    	{ id: 132, name: "Drone Beetle", price: 200, category: "Bugs" },
    	{ id: 133, name: "Goliath Beetle", price: 8000, category: "Bugs" },
    	{ id: 134, name: "Saw Stag", price: 2000, category: "Bugs" },
    	{ id: 135, name: "Miyama Stag", price: 1000, category: "Bugs" },
    	{ id: 136, name: "Giant Stag", price: 10000, category: "Bugs" },
    	{ id: 137, name: "Rainbow Stag", price: 6000, category: "Bugs" },
    	{ id: 138, name: "Cyclommatus Stag", price: 8000, category: "Bugs" },
    	{ id: 139, name: "Golden Stag", price: 12000, category: "Bugs" },
    	{ id: 140, name: "Giraffe Stag", price: 12000, category: "Bugs" },
    	{ id: 141, name: "Horned Dynastid", price: 1350, category: "Bugs" },
    	{ id: 142, name: "Horned Atlas", price: 8000, category: "Bugs" },
    	{ id: 143, name: "Horned Elephant", price: 8000, category: "Bugs" },
    	{ id: 144, name: "Horned Hercules", price: 12000, category: "Bugs" },
    	{ id: 145, name: "Walking Stick", price: 600, category: "Bugs" },
    	{ id: 146, name: "Walking Leaf", price: 600, category: "Bugs" },
    	{ id: 147, name: "Bagworm", price: 600, category: "Bugs" },
    	{ id: 148, name: "Ant", price: 80, category: "Bugs" },
    	{ id: 149, name: "Hermit Crab", price: 1000, category: "Bugs" },
    	{ id: 150, name: "Wharf Roach", price: 200, category: "Bugs" },
    	{ id: 151, name: "Fly", price: 60, category: "Bugs" },
    	{ id: 152, name: "Mosquito", price: 130, category: "Bugs" },
    	{ id: 153, name: "Flea", price: 70, category: "Bugs" },
    	{ id: 154, name: "Snail", price: 250, category: "Bugs" },
    	{ id: 155, name: "Pill bug", price: 250, category: "Bugs" },
    	{ id: 156, name: "Centipede", price: 300, category: "Bugs" },
    	{ id: 157, name: "Spider", price: 600, category: "Bugs" },
    	{ id: 158, name: "Tarantula", price: 8000, category: "Bugs" },
    	{ id: 159, name: "Scorpion", price: 8000, category: "Bugs" },
    	{ id: 160, name: "Seaweed", price: 600, category: "SeaCreatures" },
    	{ id: 161, name: "Sea grapes", price: 900, category: "SeaCreatures" },
    	{ id: 162, name: "Sea cucumber", price: 500, category: "SeaCreatures" },
    	{ id: 163, name: "Sea Pig", price: 10000, category: "SeaCreatures" },
    	{ id: 164, name: "Sea Star", price: 500, category: "SeaCreatures" },
    	{ id: 165, name: "Sea Urchin", price: 1700, category: "SeaCreatures" },
    	{ id: 166, name: "Slate Pencil Urchin", price: 2000, category: "SeaCreatures" },
    	{ id: 167, name: "Sea Anemone", price: 500, category: "SeaCreatures" },
    	{ id: 168, name: "Moon Jellyfish", price: 600, category: "SeaCreatures" },
    	{ id: 169, name: "Sea Slug", price: 600, category: "SeaCreatures" },
    	{ id: 170, name: "Pearl Oyster", price: 2800, category: "SeaCreatures" },
    	{ id: 171, name: "Mussel", price: 1500, category: "SeaCreatures" },
    	{ id: 172, name: "Oyster", price: 1100, category: "SeaCreatures" },
    	{ id: 173, name: "Scallop", price: 1200, category: "SeaCreatures" },
    	{ id: 174, name: "Whelk", price: 1000, category: "SeaCreatures" },
    	{ id: 175, name: "Turban Shell", price: 1000, category: "SeaCreatures" },
    	{ id: 176, name: "Abalone", price: 2000, category: "SeaCreatures" },
    	{ id: 177, name: "Gigas Giant Clam", price: 15000, category: "SeaCreatures" },
    	{ id: 178, name: "Chambered Nautilus", price: 1800, category: "SeaCreatures" },
    	{ id: 179, name: "Octopus", price: 1200, category: "SeaCreatures" },
    	{ id: 180, name: "Umbrella Octopus", price: 6000, category: "SeaCreatures" },
    	{ id: 181, name: "Vampire Squid", price: 10000, category: "SeaCreatures" },
    	{ id: 182, name: "Firefly Squid", price: 1400, category: "SeaCreatures" },
    	{ id: 183, name: "Gazami Crab", price: 2200, category: "SeaCreatures" },
    	{ id: 184, name: "Dungeness Crab", price: 1900, category: "SeaCreatures" },
    	{ id: 185, name: "Snow Crab", price: 6000, category: "SeaCreatures" },
    	{ id: 186, name: "Red King Crab", price: 8000, category: "SeaCreatures" },
    	{ id: 187, name: "Acorn Barnacle", price: 600, category: "SeaCreatures" },
    	{ id: 188, name: "Spider Crab", price: 12000, category: "SeaCreatures" },
    	{ id: 189, name: "Tiger Prawn", price: 3000, category: "SeaCreatures" },
    	{ id: 190, name: "Sweet Shrimp", price: 1400, category: "SeaCreatures" },
    	{ id: 191, name: "Mantis Shrimp", price: 2500, category: "SeaCreatures" },
    	{ id: 192, name: "Spiny Lobster", price: 5000, category: "SeaCreatures" },
    	{ id: 193, name: "Lobster", price: 4500, category: "SeaCreatures" },
    	{ id: 194, name: "Giant Isopod", price: 12000, category: "SeaCreatures" },
    	{ id: 195, name: "Horseshoe Crab", price: 2500, category: "SeaCreatures" },
    	{ id: 196, name: "Sea Pineapple", price: 1500, category: "SeaCreatures" },
    	{ id: 197, name: "Spotted Garden Eel", price: 1100, category: "SeaCreatures" },
    	{ id: 198, name: "Flatworm", price: 700, category: "SeaCreatures" },
    	{ id: 199, name: "Venus' Flower Basket", price: 5000, category: "SeaCreatures" },
    ];

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function createCart() {
    	const { subscribe, set, update } = writable(new Array());
    	
    	return  {
    		subscribe,
    		add: (item) => {
    			update(items => {
    				const index = items.findIndex(x => x.id === item.id);
    				
    				if (index === -1)
    					items.push({
    						count: 1,
    						...item,
    					});
    				else 
    					items[index].count += 1;

    				
    				console.log(items);
    				return items
    			});
    		},
    		remove: (item) => {
    			update(items => {
    				const index = items.findIndex(x => x.id === item.id);

    				if (index === -1)
    					return items
    				else {
    					const cartItem = items.find(x => x.id === item.id);
    					if (cartItem.count > 1)
    						cartItem.count -= 1;
    					else if (cartItem.count === 1)
    						items.splice(index, 1);
    				}


    				console.log(items);
    				return items
    			});
    		},	
    		setItemCount: (item, newCount) => {
    			update(items => {
    				const itemToUpdate = items.find(x => x.id === item.id);
    				debugger
    				if (!itemToUpdate) {
    					items.push({
    						count: newCount,
    						...item
    					});
    				}
    				else {
    					itemToUpdate.count = newCount;
    				}

    				return items
    			});
    		},
    	}

    }

    const cart = createCart();

    const cartValue = derived(
    	cart,
    	$cart => $cart.reduce((acc, curr) => acc += (curr.price * curr.count) , 0),
    );

    /* src\App.svelte generated by Svelte v3.22.2 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (26:4) {#each fish as item}
    function create_each_block_2(ctx) {
    	let div1;
    	let p;
    	let t0_value = /*item*/ ctx[20].name + "";
    	let t0;
    	let t1;
    	let t2_value = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(/*item*/ ctx[20].price).split(".")[0] + "";
    	let t2;
    	let t3;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let input;
    	let input_value_value;
    	let t5;
    	let img1;
    	let img1_src_value;
    	let t6;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[5](/*item*/ ctx[20], ...args);
    	}

    	function func(...args) {
    		return /*func*/ ctx[6](/*item*/ ctx[20], ...args);
    	}

    	function func_1(...args) {
    		return /*func_1*/ ctx[7](/*item*/ ctx[20], ...args);
    	}

    	function input_handler(...args) {
    		return /*input_handler*/ ctx[8](/*item*/ ctx[20], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[9](/*item*/ ctx[20], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = space();
    			div0 = element("div");
    			img0 = element("img");
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			img1 = element("img");
    			t6 = space();
    			attr_dev(p, "class", "uk-margin-remove");
    			add_location(p, file, 27, 6, 964);
    			if (img0.src !== (img0_src_value = "svgs/RemoveButton.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Remove Button");
    			attr_dev(img0, "height", "25");
    			attr_dev(img0, "width", "25");
    			attr_dev(img0, "class", "uk-margin-small-right");
    			add_location(img0, file, 29, 7, 1134);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "class", "uk-text-center item-number svelte-y6qx1j");

    			input.value = input_value_value = /*$cart*/ ctx[1].find(func)
    			? /*$cart*/ ctx[1].find(func_1).count
    			: 0;

    			add_location(input, file, 30, 7, 1284);
    			if (img1.src !== (img1_src_value = "svgs/AddButton.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Add Button");
    			attr_dev(img1, "height", "25");
    			attr_dev(img1, "width", "25");
    			attr_dev(img1, "class", "uk-margin-small-left");
    			add_location(img1, file, 35, 7, 1552);
    			add_location(div0, file, 28, 6, 1121);
    			attr_dev(div1, "class", "uk-width-1-1 uk-width-1-2@m uk-width-1-3@l uk-flex uk-flex-between uk-flex-wrap uk-flex-middle");
    			add_location(div1, file, 26, 5, 849);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t4);
    			append_dev(div0, input);
    			append_dev(div0, t5);
    			append_dev(div0, img1);
    			append_dev(div1, t6);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(img0, "click", click_handler, false, false, false),
    				listen_dev(input, "input", input_handler, false, false, false),
    				listen_dev(img1, "click", click_handler_1, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$cart*/ 2 && input_value_value !== (input_value_value = /*$cart*/ ctx[1].find(func)
    			? /*$cart*/ ctx[1].find(func_1).count
    			: 0)) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(26:4) {#each fish as item}",
    		ctx
    	});

    	return block;
    }

    // (42:4) {#each bugs as item}
    function create_each_block_1(ctx) {
    	let div1;
    	let p;
    	let t0_value = /*item*/ ctx[20].name + "";
    	let t0;
    	let t1;
    	let t2_value = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(/*item*/ ctx[20].price).split(".")[0] + "";
    	let t2;
    	let t3;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let input;
    	let input_value_value;
    	let t5;
    	let img1;
    	let img1_src_value;
    	let t6;
    	let dispose;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[10](/*item*/ ctx[20], ...args);
    	}

    	function func_2(...args) {
    		return /*func_2*/ ctx[11](/*item*/ ctx[20], ...args);
    	}

    	function func_3(...args) {
    		return /*func_3*/ ctx[12](/*item*/ ctx[20], ...args);
    	}

    	function input_handler_1(...args) {
    		return /*input_handler_1*/ ctx[13](/*item*/ ctx[20], ...args);
    	}

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[14](/*item*/ ctx[20], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = space();
    			div0 = element("div");
    			img0 = element("img");
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			img1 = element("img");
    			t6 = space();
    			attr_dev(p, "class", "uk-margin-remove");
    			add_location(p, file, 43, 6, 1915);
    			if (img0.src !== (img0_src_value = "svgs/RemoveButton.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Remove Button");
    			attr_dev(img0, "height", "25");
    			attr_dev(img0, "width", "25");
    			attr_dev(img0, "class", "uk-margin-small-right");
    			add_location(img0, file, 45, 7, 2085);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "class", "uk-text-center item-number svelte-y6qx1j");

    			input.value = input_value_value = /*$cart*/ ctx[1].find(func_2)
    			? /*$cart*/ ctx[1].find(func_3).count
    			: 0;

    			add_location(input, file, 46, 7, 2235);
    			if (img1.src !== (img1_src_value = "svgs/AddButton.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Add Button");
    			attr_dev(img1, "height", "25");
    			attr_dev(img1, "width", "25");
    			attr_dev(img1, "class", "uk-margin-small-left");
    			add_location(img1, file, 51, 7, 2503);
    			add_location(div0, file, 44, 6, 2072);
    			attr_dev(div1, "class", "uk-width-1-1 uk-width-1-2@m uk-width-1-3@l uk-flex uk-flex-between uk-flex-wrap uk-flex-middle");
    			add_location(div1, file, 42, 5, 1800);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t4);
    			append_dev(div0, input);
    			append_dev(div0, t5);
    			append_dev(div0, img1);
    			append_dev(div1, t6);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(img0, "click", click_handler_2, false, false, false),
    				listen_dev(input, "input", input_handler_1, false, false, false),
    				listen_dev(img1, "click", click_handler_3, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$cart*/ 2 && input_value_value !== (input_value_value = /*$cart*/ ctx[1].find(func_2)
    			? /*$cart*/ ctx[1].find(func_3).count
    			: 0)) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(42:4) {#each bugs as item}",
    		ctx
    	});

    	return block;
    }

    // (58:4) {#each seaCreatures as item}
    function create_each_block(ctx) {
    	let div1;
    	let p;
    	let t0_value = /*item*/ ctx[20].name + "";
    	let t0;
    	let t1;
    	let t2_value = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(/*item*/ ctx[20].price).split(".")[0] + "";
    	let t2;
    	let t3;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let input;
    	let input_value_value;
    	let t5;
    	let img1;
    	let img1_src_value;
    	let t6;
    	let dispose;

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[15](/*item*/ ctx[20], ...args);
    	}

    	function func_4(...args) {
    		return /*func_4*/ ctx[16](/*item*/ ctx[20], ...args);
    	}

    	function func_5(...args) {
    		return /*func_5*/ ctx[17](/*item*/ ctx[20], ...args);
    	}

    	function input_handler_2(...args) {
    		return /*input_handler_2*/ ctx[18](/*item*/ ctx[20], ...args);
    	}

    	function click_handler_5(...args) {
    		return /*click_handler_5*/ ctx[19](/*item*/ ctx[20], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = space();
    			div0 = element("div");
    			img0 = element("img");
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			img1 = element("img");
    			t6 = space();
    			attr_dev(p, "class", "uk-margin-remove");
    			add_location(p, file, 59, 6, 2874);
    			if (img0.src !== (img0_src_value = "svgs/RemoveButton.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Remove Button");
    			attr_dev(img0, "height", "25");
    			attr_dev(img0, "width", "25");
    			attr_dev(img0, "class", "uk-margin-small-right");
    			add_location(img0, file, 61, 7, 3044);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "class", "uk-text-center item-number svelte-y6qx1j");

    			input.value = input_value_value = /*$cart*/ ctx[1].find(func_4)
    			? /*$cart*/ ctx[1].find(func_5).count
    			: 0;

    			add_location(input, file, 62, 7, 3194);
    			if (img1.src !== (img1_src_value = "svgs/AddButton.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Add Button");
    			attr_dev(img1, "height", "25");
    			attr_dev(img1, "width", "25");
    			attr_dev(img1, "class", "uk-margin-small-left");
    			add_location(img1, file, 67, 7, 3462);
    			add_location(div0, file, 60, 6, 3031);
    			attr_dev(div1, "class", "uk-width-1-1 uk-width-1-2@m uk-width-1-3@l uk-flex uk-flex-between uk-flex-wrap uk-flex-middle");
    			add_location(div1, file, 58, 5, 2759);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t4);
    			append_dev(div0, input);
    			append_dev(div0, t5);
    			append_dev(div0, img1);
    			append_dev(div1, t6);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(img0, "click", click_handler_4, false, false, false),
    				listen_dev(input, "input", input_handler_2, false, false, false),
    				listen_dev(img1, "click", click_handler_5, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$cart*/ 2 && input_value_value !== (input_value_value = /*$cart*/ ctx[1].find(func_4)
    			? /*$cart*/ ctx[1].find(func_5).count
    			: 0)) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(58:4) {#each seaCreatures as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let section;
    	let div0;
    	let h3;
    	let t0_value = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(/*$cartValue*/ ctx[0]).split(".")[0] + "";
    	let t0;
    	let t1;
    	let ul0;
    	let li0;
    	let a0;
    	let t3;
    	let li1;
    	let a1;
    	let t5;
    	let li2;
    	let a2;
    	let t7;
    	let ul1;
    	let div1;
    	let t8;
    	let div2;
    	let t9;
    	let div3;
    	let each_value_2 = /*fish*/ ctx[3];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*bugs*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*seaCreatures*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Fish";
    			t3 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Bugs";
    			t5 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Sea Creatures";
    			t7 = space();
    			ul1 = element("ul");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t8 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "uk-text-center");
    			add_location(h3, file, 15, 3, 424);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file, 17, 8, 601);
    			add_location(li0, file, 17, 4, 597);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file, 18, 8, 635);
    			add_location(li1, file, 18, 4, 631);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file, 19, 8, 669);
    			add_location(li2, file, 19, 4, 665);
    			attr_dev(ul0, "uk-tab", "connect: .tabs");
    			add_location(ul0, file, 16, 3, 564);
    			attr_dev(div0, "class", "background-white svelte-y6qx1j");
    			attr_dev(div0, "uk-sticky", "");
    			add_location(div0, file, 11, 2, 370);
    			attr_dev(div1, "class", "uk-flex-wrap");
    			set_style(div1, "margin-top", "40px");
    			attr_dev(div1, "uk-grid", "");
    			add_location(div1, file, 24, 3, 758);
    			attr_dev(div2, "class", "uk-flex-wrap");
    			attr_dev(div2, "uk-grid", "");
    			add_location(div2, file, 40, 3, 1735);
    			attr_dev(div3, "class", "uk-flex-wrap");
    			attr_dev(div3, "uk-grid", "");
    			add_location(div3, file, 56, 3, 2686);
    			attr_dev(ul1, "class", "uk-switcher tabs");
    			add_location(ul1, file, 23, 2, 725);
    			attr_dev(section, "class", "uk-card uk-card-body");
    			add_location(section, file, 10, 1, 329);
    			attr_dev(main, "class", "uk-height-viewport");
    			add_location(main, file, 9, 0, 294);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			append_dev(section, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t0);
    			append_dev(div0, t1);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(ul0, t5);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(section, t7);
    			append_dev(section, ul1);
    			append_dev(ul1, div1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div1, null);
    			}

    			append_dev(ul1, t8);
    			append_dev(ul1, div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(ul1, t9);
    			append_dev(ul1, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$cartValue*/ 1 && t0_value !== (t0_value = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(/*$cartValue*/ ctx[0]).split(".")[0] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*cart, fish, $cart, Number, Intl*/ 10) {
    				each_value_2 = /*fish*/ ctx[3];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*cart, bugs, $cart, Number, Intl*/ 18) {
    				each_value_1 = /*bugs*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*cart, seaCreatures, $cart, Number, Intl*/ 6) {
    				each_value = /*seaCreatures*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	let $cartValue;
    	let $cart;
    	validate_store(cartValue, "cartValue");
    	component_subscribe($$self, cartValue, $$value => $$invalidate(0, $cartValue = $$value));
    	validate_store(cart, "cart");
    	component_subscribe($$self, cart, $$value => $$invalidate(1, $cart = $$value));
    	const seaCreatures = Items.filter(x => x.category === "SeaCreatures");
    	const fish = Items.filter(x => x.category === "Fish");
    	const bugs = Items.filter(x => x.category === "Bugs");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = item => cart.remove(item);
    	const func = (item, i) => i.id === item.id;
    	const func_1 = (item, i) => i.id === item.id;
    	const input_handler = (item, event) => cart.setItemCount(item, Number(event.target.value));
    	const click_handler_1 = item => cart.add(item);
    	const click_handler_2 = item => cart.remove(item);
    	const func_2 = (item, i) => i.id === item.id;
    	const func_3 = (item, i) => i.id === item.id;
    	const input_handler_1 = (item, event) => cart.setItemCount(item, Number(event.target.value));
    	const click_handler_3 = item => cart.add(item);
    	const click_handler_4 = item => cart.remove(item);
    	const func_4 = (item, i) => i.id === item.id;
    	const func_5 = (item, i) => i.id === item.id;
    	const input_handler_2 = (item, event) => cart.setItemCount(item, Number(event.target.value));
    	const click_handler_5 = item => cart.add(item);

    	$$self.$capture_state = () => ({
    		Items,
    		cart,
    		cartValue,
    		seaCreatures,
    		fish,
    		bugs,
    		$cartValue,
    		$cart
    	});

    	return [
    		$cartValue,
    		$cart,
    		seaCreatures,
    		fish,
    		bugs,
    		click_handler,
    		func,
    		func_1,
    		input_handler,
    		click_handler_1,
    		click_handler_2,
    		func_2,
    		func_3,
    		input_handler_1,
    		click_handler_3,
    		click_handler_4,
    		func_4,
    		func_5,
    		input_handler_2,
    		click_handler_5
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
