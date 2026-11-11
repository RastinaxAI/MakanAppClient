let latestAccountCheck = 0;
/** Local display only: never requests permission, subscribes or changes the server. */
export function checkPushDisplayAccount(userId: string | null) {
  const check = ++latestAccountCheck;
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;
  void navigator.serviceWorker
    .getRegistration('/')
    .then((registration) => {
      if (check !== latestAccountCheck) return;
      registration?.active?.postMessage(
        userId ? { type: 'PUSH_ACCOUNT_CHANGED', userId } : { type: 'PUSH_DISABLED' },
      );
    })
    .catch(() => {});
}
