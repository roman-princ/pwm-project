// Guard: skip if already loaded (can happen when included from
// both the parent page and a data-include template).
if (typeof DataService !== "undefined") {
  // already defined — nothing to do
} else {
  /**
   * DataService — centralised data access layer.
   *
   * Loads all data from /src/data/db.json (local file for now).
   * The BASE_URL constant can later be pointed at a remote API
   * (e.g. JSON-Server, Strapi, or any REST backend) without
   * changing the consuming code.
   *
   * Mutations (create / update / delete events, register users) are
   * persisted to localStorage so they survive page reloads while we
   * don't have a real server.
   */

  var DataService = (() => {
    // ── Configuration ────────────────────────────────────────
    // Change this to a remote URL when switching to JSON-Server / Strapi.
    const BASE_URL = "/src/data";

    // In-memory cache so we only fetch once per page load.
    let _db = null;

    // ── Private helpers ──────────────────────────────────────

    /**
     * Fetch the full database JSON and apply any local overrides.
     * Caches the result on first call.
     * @returns {Promise<Object>}
     */
    async function _loadDB() {
      if (_db) return _db;

      const response = await fetch(`${BASE_URL}/db.json`);
      if (!response.ok) {
        throw new Error(
          `DataService: failed to load db.json (${response.status})`,
        );
      }
      _db = await response.json();

      // Rehydrate event mutations from localStorage
      const savedEvents = localStorage.getItem("db_events");
      if (savedEvents) {
        try {
          _db.events = JSON.parse(savedEvents);
        } catch {
          /* ignore corrupt data */
        }
      }

      return _db;
    }

    /**
     * Format a date string (YYYY-MM-DD) into a human-readable label.
     * e.g. "2026-02-25" → "Wednesday, February 25, 2026"
     */
    function _formatDate(dateStr) {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    /**
     * Enrich a raw event object with computed fields.
     */
    function _enrichEvent(evt) {
      return {
        ...evt,
        dateFormatted: _formatDate(evt.date),
      };
    }

    /**
     * Persist the current events array to localStorage.
     */
    function _persistEvents() {
      localStorage.setItem("db_events", JSON.stringify(_db.events));
    }

    /**
     * Return locally-registered users (those created via the registration form).
     */
    function _getLocalUsers() {
      try {
        return JSON.parse(localStorage.getItem("db_users") || "[]");
      } catch {
        return [];
      }
    }

    // ── Public API ───────────────────────────────────────────

    return {
      /* ---------- Events ---------- */

      /** @returns {Promise<Object[]>} all events sorted by date */
      async getEvents() {
        const db = await _loadDB();
        return db.events.map(_enrichEvent);
      },

      /** @returns {Promise<Object|undefined>} a single event or undefined */
      async getEventById(id) {
        const db = await _loadDB();
        const evt = db.events.find((e) => e.id === id);
        return evt ? _enrichEvent(evt) : undefined;
      },

      /**
       * Add a new event (persists to localStorage).
       * Returns the created event with its new id.
       */
      async createEvent(eventData) {
        const db = await _loadDB();
        const maxId = db.events.reduce((max, e) => Math.max(max, e.id), 0);
        const newEvent = { id: maxId + 1, ...eventData };
        db.events.push(newEvent);
        _persistEvents();
        return _enrichEvent(newEvent);
      },

      /**
       * Update an existing event by id.
       * Returns the updated event or null if not found.
       */
      async updateEvent(id, updates) {
        const db = await _loadDB();
        const idx = db.events.findIndex((e) => e.id === id);
        if (idx === -1) return null;
        db.events[idx] = { ...db.events[idx], ...updates };
        _persistEvents();
        return _enrichEvent(db.events[idx]);
      },

      /**
       * Delete an event by id. Returns true if deleted.
       */
      async deleteEvent(id) {
        const db = await _loadDB();
        const idx = db.events.findIndex((e) => e.id === id);
        if (idx === -1) return false;
        db.events.splice(idx, 1);
        _persistEvents();
        return true;
      },

      /* ---------- Categories ---------- */

      /** @returns {Promise<Object[]>} */
      async getCategories() {
        const db = await _loadDB();
        return db.categories;
      },

      /* ---------- Users ---------- */

      /**
       * Authenticate a user by username + password.
       * @returns {Promise<Object|null>} the matched user (without password) or null
       */
      async authenticate(username, password) {
        const db = await _loadDB();
        const allUsers = [...db.users, ..._getLocalUsers()];
        const user = allUsers.find(
          (u) => u.username === username && u.password === password,
        );
        if (!user) return null;
        const { password: _, ...safeUser } = user;
        return safeUser;
      },

      /**
       * Register a new user (persists to localStorage).
       * Returns the created user or throws if username/email already exists.
       */
      async registerUser(userData) {
        const db = await _loadDB();
        const localUsers = _getLocalUsers();
        const allUsers = [...db.users, ...localUsers];

        if (allUsers.some((u) => u.username === userData.username)) {
          throw new Error("Username already exists.");
        }
        if (allUsers.some((u) => u.email === userData.email)) {
          throw new Error("E-mail already registered.");
        }

        const maxId = allUsers.reduce((max, u) => Math.max(max, u.id), 0);
        const newUser = {
          id: maxId + 1,
          ...userData,
          role: "user",
        };

        localUsers.push(newUser);
        localStorage.setItem("db_users", JSON.stringify(localUsers));

        const { password: _, ...safeUser } = newUser;
        return safeUser;
      },

      /* ---------- Page / Partial content ---------- */

      /** @returns {Promise<Object>} content map for a given page key */
      async getPageContent(pageKey) {
        const db = await _loadDB();
        return db.pages[pageKey] || {};
      },

      /** @returns {Promise<Object>} content map for a given partial key */
      async getPartialContent(partialKey) {
        const db = await _loadDB();
        return db.partials[partialKey] || {};
      },

      /** @returns {Promise<Object>} full site metadata */
      async getSite() {
        const db = await _loadDB();
        return db.site;
      },
    };
  })();
} // end guard
