/** Isolated browser API double only. No native prompt, push service or delivery. */
export async function mockPushBrowser(context, options = {}) {
  await context.addInitScript(
    ({
      permission = 'default',
      nextPermission = 'granted',
      deferPermission = false,
      unsupported = false,
    }) => {
      if (unsupported) {
        Object.defineProperty(window, 'Notification', { value: undefined, configurable: true });
      }
      const key = 'makan:test-push-browser:v1';
      const read = () =>
        JSON.parse(localStorage.getItem(key) || 'null') || {
          permission,
          requests: 0,
          subscribes: 0,
          messages: [],
        };
      const write = (value) => localStorage.setItem(key, JSON.stringify(value));
      const notification = {
        get permission() {
          return read().permission;
        },
        requestPermission: async () => {
          const value = read();
          value.requests++;
          write(value);
          const allowed = deferPermission
            ? await new Promise((resolve) => {
                window.__makanPushPermission = resolve;
              })
            : nextPermission;
          const next = read();
          next.permission = allowed;
          write(next);
          return allowed;
        },
      };
      if (!unsupported)
        Object.defineProperty(window, 'Notification', { value: notification, configurable: true });
      const subscription = () => {
        const value = read();
        if (!value.applicationKey) return null;
        return {
          endpoint: 'https://push.example.invalid/declared-fixture-only',
          options: {
            userVisibleOnly: true,
            applicationServerKey: Uint8Array.from(value.applicationKey).buffer,
          },
          toJSON: () => ({
            endpoint: 'https://push.example.invalid/declared-fixture-only',
            keys: {
              p256dh: 'BFRlc3RGaXh0dXJlT25seU5vdFJlYWxQdXNoS2V5',
              auth: 'Zml4dHVyZS1vbmx5',
            },
          }),
          unsubscribe: async () => {
            const next = read();
            delete next.applicationKey;
            next.unsubscribes = (next.unsubscribes || 0) + 1;
            write(next);
            return true;
          },
        };
      };
      const registration = Object.assign(new EventTarget(), {
        scope: location.origin + '/',
        installing: null,
        waiting: null,
        active: {
          postMessage: (message) => {
            const value = read();
            value.messages.push(message);
            write(value);
          },
        },
        pushManager: unsupported
          ? undefined
          : {
              getSubscription: async () => subscription(),
              subscribe: async ({ applicationServerKey }) => {
                const value = read();
                value.subscribes++;
                value.applicationKey = Array.from(applicationServerKey);
                write(value);
                return subscription();
              },
            },
      });
      const workers = Object.assign(new EventTarget(), {
        register: async () => registration,
        getRegistration: async () => registration,
        getRegistrations: async () => [registration],
        ready: Promise.resolve(registration),
        controller: registration.active,
      });
      Object.defineProperty(navigator, 'serviceWorker', { value: workers, configurable: true });
    },
    options,
  );
}
