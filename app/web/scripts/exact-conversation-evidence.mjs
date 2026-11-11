// Read-only QA evidence from responses the real application already requested.
// Never infer a participant role from account profile or effective capabilities.
export function observeConversationRoles(context) {
  const reads = new Map();
  const pending = new Set();
  const observe = (response) => {
    const request = response.request();
    const match = new URL(response.url()).pathname.match(
      /^\/api\/client\/backend\/api\/v1\/conversations\/([a-f0-9-]{36})$/i,
    );
    if (!match || request.method() !== 'GET') return;
    const key = (request.headers()['x-makan-context'] || '') + ':' + match[1];
    const read = { members: [] };
    reads.set(key, read);
    if (!response.ok()) return;
    const task = response
      .json()
      .then((body) => {
        if (body.conversationId !== match[1] || !Array.isArray(body.participants)) return;
        if (reads.get(key) !== read) return;
        read.members = body.participants
          .filter(
            (member) =>
              member.status === 'Active' && ['Owner', 'Admin', 'Member'].includes(member.role),
          )
          .map((member) => ({ userId: member.user?.userId, role: member.role }));
      })
      .catch(() => {});
    pending.add(task);
    void task.finally(() => pending.delete(task));
  };
  context.on('response', observe);
  return {
    async role(conversationId, userId, revision) {
      await Promise.allSettled([...pending]);
      return reads
        .get(revision + ':' + conversationId)
        ?.members.find((member) => member.userId === userId)?.role;
    },
    dispose() {
      context.off('response', observe);
      reads.clear();
    },
  };
}
